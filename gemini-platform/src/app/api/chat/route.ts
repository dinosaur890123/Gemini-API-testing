import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import rateLimit from "@/lib/rate-limit";
import { addLog } from "@/lib/logger";
import { getConfig } from "@/lib/config";
import { NextRequest } from "next/server";

// Use a high default, because we enforce dynamically below
const limiter = rateLimit({
  interval: 60 * 1000, 
  uniqueTokenPerInterval: 500, 
});

function getRequestIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip") || null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || null;
    const userId = ((session?.user as unknown as { id?: string | number })?.id) ?? null;

    const ip = getRequestIp(req);
    const userAgent = req.headers.get("user-agent");
    const path = new URL(req.url).pathname;
    const method = req.method;

    const config = getConfig();

    // Maintenance Mode Check
    if (config.isMaintenanceMode) {
      await addLog({
        event_type: "maintenance_block",
        message: "Blocked chat request due to maintenance mode",
        user_email: userEmail,
        user_id: userId,
        ip,
        user_agent: userAgent,
        path,
        method,
      });
      return new Response(
        JSON.stringify({ 
          error: "System is currently in maintenance mode. Please try again later." 
        }), 
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, history } = await req.json();

    const messagePreview = typeof message === "string" ? message.slice(0, 500) : JSON.stringify(message).slice(0, 500);

    await addLog({
      event_type: "chat_request",
      message: messagePreview,
      user_email: userEmail,
      user_id: userId,
      ip,
      user_agent: userAgent,
      path,
      method,
      metadata: {
        message_length: typeof message === "string" ? message.length : undefined,
        history_length: Array.isArray(history) ? history.length : undefined,
        model: config.activeModel || process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-3-flash-preview",
      },
    });
    const apiKey = process.env.GEMINI_API_KEY;

    try {
      // Dynamic Rate Limit
      await limiter.check(config.rateLimit, "CACHE_TOKEN"); 
    } catch {
      await addLog({
        event_type: "rate_limit",
        message: "Rate limit exceeded",
        user_email: userEmail,
        user_id: userId,
        ip,
        user_agent: userAgent,
        path,
        method,
        metadata: { rateLimit: config.rateLimit },
      });
      return new Response("Rate Limit Exceeded", { status: 429 });
    }

    if (!apiKey) {
      return new Response("GEMINI_API_KEY is not set", { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = config.activeModel || process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-3-flash-preview";
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: config.systemInstruction
    });

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
  } catch (error: unknown) {
    console.error("Error calling Gemini API:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
