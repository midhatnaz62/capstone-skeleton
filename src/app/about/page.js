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
      // TOOL INPUT STREAMING STATE
      const temporaryAssistant = {
        role: "assistant",
        content: "",
        toolState: "input-streaming",
      };

      setMessages([...updatedMessages, temporaryAssistant]);

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

      // TOOL OUTPUT AVAILABLE STATE
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.text || "",
          toolResults: data.toolResults || [],
          toolState:
            data.text?.startsWith("Invalid lead information.")
              ? "output-error"
              : data.toolResults?.length > 0
                ? "output-available"
                : "input-available",
        },
      ]);
    } catch (error) {
      // TOOL OUTPUT ERROR STATE
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.text || "",
          toolResults: data.toolResults || [],
          toolState:
            data.text?.startsWith("Invalid lead information.")
              ? "output-error"
              : data.toolResults?.length > 0
                ? "output-available"
                : "input-available",
          errorMessage: data.text,
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
        Ask the AI to qualify a lead and calculate a lead score.
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
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
                padding: "14px",
                borderRadius: "10px",
                background:
                  message.role === "user"
                    ? "#f1f5f9"
                    : "#fafafa",
              }}
            >
              <strong>
                {message.role === "user" ? "You" : "AI"}:
              </strong>

              {/* USER MESSAGE */}
              {message.role === "user" && (
                <p>{message.content}</p>
              )}

              {/* TOOL INPUT STREAMING */}
              {message.toolState === "input-streaming" && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                  }}
                >
                  🔄 Preparing lead qualification...
                </div>
              )}

              {/* TOOL INPUT AVAILABLE */}
              {message.toolState === "input-available" && (
                <>
                  {message.content && (
                    <p>{message.content}</p>
                  )}

                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#fefce8",
                      border: "1px solid #fde68a",
                      color: "#854d0e",
                    }}
                  >
                    ⚙️ Lead information received. Processing
                    qualification...
                  </div>
                </>
              )}

              {/* NORMAL AI RESPONSE */}
              {message.role === "assistant" &&
                message.toolState !== "output-error" &&
                message.toolState !== "input-streaming" &&
                message.toolState !== "input-available" &&
                message.content && (
                  <div style={{ marginTop: "10px" }}>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </p>
                  </div>
                )}

              {/* TOOL OUTPUT AVAILABLE */}
              {message.toolState === "output-available" &&
                message.toolResults?.length > 0 &&
                message.toolResults.map(
                  (toolResult, toolIndex) => {
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
                            border: "2px solid #22c55e",
                            borderRadius: "12px",
                            background: "#f0fdf4",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#15803d",
                              marginBottom: "8px",
                            }}
                          >
                            ✓ TOOL OUTPUT AVAILABLE
                          </div>

                          <h3>
                            Lead Qualification Result
                          </h3>

                          <p>
                            <strong>Name:</strong>{" "}
                            {result.name}
                          </p>

                          <p>
                            <strong>Company:</strong>{" "}
                            {result.company}
                          </p>

                          <p>
                            <strong>Score:</strong>{" "}
                            {result.score}/100
                          </p>

                          <p>
                            <strong>Status:</strong>{" "}
                            {result.label}
                          </p>
                        </div>
                      );
                    }

                    return null;
                  }
                )}

              {/* TOOL OUTPUT ERROR */}
              {message.toolState === "output-error" && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "15px",
                    borderRadius: "10px",
                    background: "#fef2f2",
                    border: "2px solid #fca5a5",
                    color: "#b91c1c",
                  }}
                >
                  <strong>⚠ TOOL ERROR</strong>

                  <p
                    style={{
                      marginTop: "8px",
                      marginBottom: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.errorMessage ||
                      message.content ||
                      "The tool could not complete the request."}
                  </p>
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
          }}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </main>
  );
}