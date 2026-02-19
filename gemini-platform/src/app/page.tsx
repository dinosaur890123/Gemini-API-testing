"use client";

import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Gemini 3 Pro Platform&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
      </div>

      <div className="relative flex place-items-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Gemini 3 Pro Integration
        </h1>
      </div>

      <div className="w-full max-w-4xl">
        <ChatInterface />
      </div>
    </main>
  );
}
