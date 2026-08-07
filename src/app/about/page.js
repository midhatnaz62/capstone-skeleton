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

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();

      console.log("API RESPONSE:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.text || "No response generated.",
          toolResults: data.toolResults || [],
        },
      ]);
    } catch (error) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: `Error: ${error.message}`,
          error: true,
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
      <h1>AI Qualification Chat</h1>

      <p style={{ color: "#666" }}>
        Ask questions or qualify a lead and calculate their lead score.
      </p>

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
                padding: "15px",
                borderRadius: "8px",
                background:
                  message.role === "user" ? "#f1f5f9" : "#fafafa",
              }}
            >
              <strong>
                {message.role === "user" ? "You" : "AI"}:
              </strong>

              <p
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                }}
              >
                {message.content}
              </p>

              {message.toolResults?.length > 0 &&
                message.toolResults.map((toolResult, toolIndex) => {
                  if (
                    toolResult.toolName === "leadScore" &&
                    toolResult.output
                  ) {
                    const result = toolResult.output;

                    return (
                      <div
                        key={toolIndex}
                        style={{
                          marginTop: "15px",
                          padding: "18px",
                          border: "1px solid #ddd",
                          borderRadius: "10px",
                          background: "white",
                        }}
                      >
                        <h3>Lead Qualification Result</h3>

                        <p>
                          <strong>Name:</strong> {result.name}
                        </p>

                        <p>
                          <strong>Company:</strong> {result.company}
                        </p>

                        <p>
                          <strong>Score:</strong> {result.score}/100
                        </p>

                        <p>
                          <strong>Status:</strong> {result.label}
                        </p>
                      </div>
                    );
                  }

                  return null;
                })}

              {message.error && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px",
                    border: "1px solid #fca5a5",
                    borderRadius: "8px",
                    background: "#fef2f2",
                    color: "#b91c1c",
                  }}
                >
                  Something went wrong. Please try again.
                </div>
              )}
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
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </main>
  );
}