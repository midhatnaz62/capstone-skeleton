"use client";

import { useChat } from "@ai-sdk/react";

export default function Home() {
  const {
  messages,
  input,
  handleInputChange,
  handleSubmit,
  status,
  stop,
} = useChat({
  api: "/api/chat",
 });

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AI Chat Interface</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          minHeight: "400px",
          marginBottom: "20px",
        }}
      >
        {messages.map((message) => (
          <div key={message.id} style={{ marginBottom: "16px" }}>
            <strong>
              {message.role === "user" ? "You" : "AI"}:
            </strong>

            <div>
              {message.parts?.map((part, index) => {
                if (part.type === "text") {
                  return <span key={index}>{part.text}</span>;
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {status === "submitted" && <p>Thinking...</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything..."
          style={{
            width: "75%",
            padding: "10px",
          }}
        />

        <button
          type="submit"
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
          }}
        >
          Send
        </button>

        <button
          type="button"
          onClick={stop}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
          }}
        >
          Stop
        </button>
      </form>
    </main>
  );
}