"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState("idle");

  async function sendMessage(messageText, previousMessages = messages) {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: messageText,
    };

    const updatedMessages = [...previousMessages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setButtonState("loading");

    try {
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

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          text || "Server returned an invalid response."
        );
      }

      const data = await response.json();

      console.log("API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.error || "The AI request failed. Please try again."
        );
      }

      const isValidationError =
        data.text?.startsWith("Invalid lead information.");

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: data.text || "",
          toolResults: data.toolResults || [],
          toolState: isValidationError
            ? "output-error"
            : data.toolResults?.length > 0
              ? "output-available"
              : "input-available",
        },
      ]);

      setButtonState(isValidationError ? "error" : "success");

      setTimeout(() => {
        setButtonState("idle");
      }, 1200);
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "",
          toolState: "request-error",
          errorMessage:
            error?.message ||
            "Something went wrong. Please try again.",
          retryMessage: messageText,
        },
      ]);

      setButtonState("error");

      setTimeout(() => {
        setButtonState("idle");
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!input.trim() || loading) return;

    await sendMessage(input);
  }

  async function handleRetry(message) {
    if (!message.retryMessage || loading) return;

    const failedIndex = messages.indexOf(message);

    const messagesBeforeFailedRequest =
      failedIndex > 0
        ? messages
            .slice(0, failedIndex)
            .filter(
              (item) =>
                item.role === "user" ||
                item.role === "assistant"
            )
        : [];

    await sendMessage(
      message.retryMessage,
      messagesBeforeFailedRequest
    );
  }

  // DEMO SUCCESS STATE
  function testSuccess() {
    if (loading) return;

    setButtonState("loading");

    setTimeout(() => {
      setButtonState("success");

      setTimeout(() => {
        setButtonState("idle");
      }, 1200);
    }, 900);
  }

  // DEMO ERROR STATE
  function testError() {
    if (loading) return;

    setButtonState("loading");

    setTimeout(() => {
      setButtonState("error");

      setTimeout(() => {
        setButtonState("idle");
      }, 1200);
    }, 900);
  }

  function getButtonContent() {
    if (buttonState === "loading") {
      return (
        <>
          <span className="spinner" />
          Sending...
        </>
      );
    }

    if (buttonState === "success") {
      return <>✓ Sent</>;
    }

    if (buttonState === "error") {
      return <>⚠ Failed</>;
    }

    return <>Send</>;
  }

  return (
    <>
      <style>{`
        .send-button {
          min-width: 95px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          background: #111827;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition:
            transform 200ms ease,
            opacity 200ms ease,
            background 200ms ease;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #1f2937;
        }

        .send-button:active:not(:disabled) {
          transform: translateY(0) scale(0.96);
        }

        .send-button:focus-visible {
          outline: 3px solid #93c5fd;
          outline-offset: 3px;
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: 0.75;
        }

        .send-button.loading {
          background: #2563eb;
        }

        .send-button.success {
          background: #16a34a;
          transform: scale(1.03);
        }

        .send-button.error {
          background: #dc2626;
          animation: shake 350ms ease;
        }

        .demo-button {
          padding: 10px 14px;
          border-radius: 7px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 200ms ease,
            opacity 200ms ease;
        }

        .demo-button:hover {
          transform: translateY(-2px);
        }

        .demo-button:focus-visible {
          outline: 3px solid #93c5fd;
          outline-offset: 2px;
        }

        .success-demo {
          border: 1px solid #86efac;
          background: #f0fdf4;
          color: #15803d;
        }

        .error-demo {
          border: 1px solid #fca5a5;
          background: #fef2f2;
          color: #b91c1c;
        }

        .spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 700ms linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-4px);
          }

          50% {
            transform: translateX(4px);
          }

          75% {
            transform: translateX(-3px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .send-button,
          .demo-button {
            transition: none;
          }

          .send-button.error {
            animation: none;
          }

          .spinner {
            animation: none;
          }
        }

        @media (max-width: 600px) {
          .chat-form {
            flex-direction: column;
          }

          .send-button {
            width: 100%;
          }

          .demo-controls {
            flex-direction: column;
          }

          .demo-button {
            width: 100%;
          }
        }
      `}</style>

      <main
        style={{
          maxWidth: "700px",
          margin: "40px auto",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1 style={{ marginBottom: "8px" }}>
          AI Qualification Chat
        </h1>

        <p style={{ color: "#666" }}>
          Ask the AI to qualify a lead and calculate a lead
          score.
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
          {/* EMPTY STATE */}
          {messages.length === 0 ? (
            <div
              style={{
                padding: "30px 10px",
                textAlign: "center",
                color: "#777",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>
                Start a conversation...
              </h3>

              <p style={{ margin: 0 }}>
                Ask a question or enter lead information
                to get started.
              </p>
            </div>
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
                  {message.role === "user" ? "You:" : "AI:"}
                </strong>

                {/* USER MESSAGE */}
                {message.role === "user" && (
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {message.content}
                  </p>
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
                {message.toolState ===
                  "input-available" && (
                  <>
                    {message.content && (
                      <p
                        style={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message.content}
                      </p>
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
                      ⚙️ Lead information received.
                      Processing qualification...
                    </div>
                  </>
                )}

                {/* NORMAL AI RESPONSE */}
                {message.role === "assistant" &&
                  message.toolState !== "output-error" &&
                  message.toolState !== "request-error" &&
                  message.toolState !== "input-streaming" &&
                  message.toolState !== "input-available" &&
                  message.content && (
                    <div
                      style={{
                        marginTop: "10px",
                      }}
                    >
                      <p
                        style={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {message.content}
                      </p>
                    </div>
                  )}

                {/* TOOL OUTPUT AVAILABLE */}
                {message.toolState ===
                  "output-available" &&
                  message.toolResults?.length > 0 &&
                  message.toolResults.map(
                    (toolResult, toolIndex) => {
                      if (
                        toolResult.toolName ===
                          "leadScore" &&
                        toolResult.output
                      ) {
                        const result =
                          toolResult.output;

                        return (
                          <div
                            key={toolIndex}
                            style={{
                              marginTop: "15px",
                              padding: "18px",
                              border:
                                "2px solid #22c55e",
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
                              <strong>
                                Name:
                              </strong>{" "}
                              {result.name}
                            </p>

                            <p>
                              <strong>
                                Company:
                              </strong>{" "}
                              {result.company}
                            </p>

                            <p>
                              <strong>
                                Score:
                              </strong>{" "}
                              {result.score}/100
                            </p>

                            <p>
                              <strong>
                                Status:
                              </strong>{" "}
                              {result.label}
                            </p>
                          </div>
                        );
                      }

                      return null;
                    }
                  )}

                {/* TOOL VALIDATION ERROR */}
                {message.toolState ===
                  "output-error" && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "15px",
                      borderRadius: "10px",
                      background: "#fef2f2",
                      border:
                        "2px solid #fca5a5",
                      color: "#b91c1c",
                    }}
                  >
                    <strong>
                      ⚠ TOOL ERROR
                    </strong>

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

                {/* NETWORK / API FAILURE */}
                {message.toolState ===
                  "request-error" && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "16px",
                      borderRadius: "10px",
                      background: "#fff7ed",
                      border:
                        "2px solid #fdba74",
                      color: "#c2410c",
                    }}
                  >
                    <strong>
                      ⚠ Something went wrong
                    </strong>

                    <p
                      style={{
                        marginTop: "8px",
                        marginBottom: "12px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {message.errorMessage ||
                        "The request could not be completed."}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleRetry(message)
                      }
                      disabled={loading}
                      className="demo-button error-demo"
                    >
                      🔄 Retry
                    </button>
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

        {/* CHAT FORM */}
        <form
          onSubmit={handleSubmit}
          className="chat-form"
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            placeholder="Ask anything..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className={`send-button ${buttonState}`}
          >
            {getButtonContent()}
          </button>
        </form>

        {/* ASSIGNMENT DEMO CONTROLS */}
        <div
          style={{
            marginTop: "25px",
            padding: "18px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            background: "#fafafa",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Button State Demo
          </h3>

          <p
            style={{
              marginTop: 0,
              color: "#666",
              fontSize: "14px",
            }}
          >
            Use these controls to preview the success
            and error states required for the assignment.
          </p>

          <div
            className="demo-controls"
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={testSuccess}
              disabled={loading}
              className="demo-button success-demo"
            >
              ✓ Test Success
            </button>

            <button
              type="button"
              onClick={testError}
              disabled={loading}
              className="demo-button error-demo"
            >
              ⚠ Test Error
            </button>
          </div>
        </div>

        {/* MOTION NOTE */}
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "10px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#475569",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          <strong>Motion & accessibility note:</strong>{" "}
          Button transitions use short 200ms ease animations
          for responsive feedback. Loading uses a lightweight
          spinner, success uses a brief scale transition, and
          error uses a short shake. The interface also respects
          <code> prefers-reduced-motion </code> by removing
          non-essential animation while keeping state feedback
          visible.
        </div>
      </main>
    </>
  );
}