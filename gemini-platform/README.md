
# Gemini 3 Pro Full Stack Platform

This is a Next.js application integrated with the Google Gemini API, featuring **streaming responses** and **Markdown rendering**. It uses the `gemini-1.5-pro` model by default (or newer versions like `gemini-3.0-pro` when available).

## getting Started

1.  **Configure API Key**:
    - Open `.env.local` in the root directory.
    - Add your Google Gemini API key:
      ```
      GEMINI_API_KEY=your_actual_api_key_here
      ```
    - You can also change the model version:
      ```
      NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-pro
      ```

2.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```

3.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open the App**:
    - Visit `http://localhost:3000` in your browser.

## Features

- **Streaming Responses**: Real-time token streaming for faster perceived latency.
- **Markdown & Code Highlighting**: Beautifully rendered code blocks and formatted text.
- **Rate Limiting**: Basic protection against API abuse (10 requests/minute per token).
- **Full Stack**: Next.js App Router for frontend + backend API routes.
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`) for chat completions.
- **Modern UI**: Tailwind CSS, Lucide Icons, and responsive design.
- **Chat Interface**: Stateful chat component with message history.

## Customization

- **Model**: Edit `NEXT_PUBLIC_GEMINI_MODEL` in `.env.local` to switch models.
- **System Prompt**: Modify `src/app/api/chat/route.ts` to add system instructions.


## Deployment on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

### Environment Variables

When deploying to Vercel, you need to set your environment variables in the project settings.

1.  **Push your code** to a Git repository (GitHub, GitLab, Bitbucket).
2.  **Import the project** into Vercel.
3.  **Environment Variables**: During the import step (or later in Settings > Environment Variables), add the following keys:
    - `GEMINI_API_KEY`: Your Google Gemini API Key.
    - `NEXT_PUBLIC_GEMINI_MODEL`: `gemini-1.5-pro` (or your preferred model).

These variables are **not** committed to Git for security reasons. Vercel securely injects them into your application at build and runtime.


## Database Setup (Vercel Postgres)

1.  **Create Database**:
    - Go to your Vercel Dashboard -> Storage -> Create Database -> Postgres.
    - Connect it to your project.
    - This will automatically add environment variables like `POSTGRES_URL`.

2.  **Initialize Table**:
    - Once deployed, visit your app URL:
      `https://your-app.vercel.app/api/setup-db`
    - It will create the `logs` table for you.

## Admin Logs
- Access logs at `/admin/logs`.

