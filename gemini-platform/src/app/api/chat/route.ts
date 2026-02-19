import { GoogleGenerativeAI } from "@google/generative-ai";
import rateLimit from "@/lib/rate-limit";
import { addLog } from "@/lib/logger";
import { getConfig } from "@/lib/config";

// Use a high default, because we enforce dynamically below
const limiter = rateLimit({
  interval: 60 * 1000, 
  uniqueTokenPerInterval: 500, 
});

export async function POST(req: Request) {
  try {
    const config = getConfig();

    // Maintenance Mode Check
    if (config.isMaintenanceMode) {
      return new Response(
        JSON.stringify({ 
          error: "System is currently in maintenance mode. Please try again later." 
        }), 
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, history } = await req.json();

    // Log input
    console.log(`[${new Date().toISOString()}] User Input:`, message);
    await addLog(message); 

    const apiKey = process.env.GEMINI_API_KEY;

    try {
      // Dynamic Rate Limit
      await limiter.check(config.rateLimit, "CACHE_TOKEN"); 
    } catch {
      return new Response("Rate Limit Exceeded", { status: 429 });
    }

    if (!apiKey) {
      return new Response("GEMINI_API_KEY is not set", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-pro";
    const model = genAI.getGenerativeModel({ model: modelName });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 8000,
      },
    });

    // Use sendMessageStream for streaming responses
    const result = await chat.sendMessageStream(message);

    // Create a ReadableStream from the generator
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
