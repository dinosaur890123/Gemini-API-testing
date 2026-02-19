import { GoogleGenerativeAI } from "@google/generative-ai";
import rateLimit from "@/lib/rate-limit";
import { addLog } from "@/lib/logger";

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Log the user's input to the server console and memory cache
    console.log(`[${new Date().toISOString()}] User Input:`, message);
    await addLog(message); // Persist to transient store for UI

    const apiKey = process.env.GEMINI_API_KEY;

    try {
      // Rate Limit: 2 requests per minute
      await limiter.check(2, "CACHE_TOKEN"); 
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
