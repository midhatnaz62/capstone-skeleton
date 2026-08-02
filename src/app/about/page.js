"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.text,
        },
      ]);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: `Error: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AI Chat Interface</h1>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          minHeight: "350px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: "#777" }}>
            Start a conversation...
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
              }}
            >
              <strong>
                {message.role === "user" ? "You" : "AI"}:
              </strong>

              <p>{message.content}</p>
            </div>
          ))
        )}

        {loading && (
          <p>
            <strong>AI:</strong> Thinking...
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 20px",
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </main>
  );
}