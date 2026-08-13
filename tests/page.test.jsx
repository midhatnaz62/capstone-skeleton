import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "../src/app/about/page";

describe("AI Qualification Chat", () => {
  it("renders the chat heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /ai qualification chat/i,
      })
    ).toBeInTheDocument();
  });

  it("renders the empty state", () => {
    render(<Home />);

    expect(
      screen.getByText(/start a conversation/i)
    ).toBeInTheDocument();
  });

  it("renders the chat input", () => {
    render(<Home />);

    expect(
      screen.getByPlaceholderText(/ask anything/i)
    ).toBeInTheDocument();
  });

  it("renders the Send button", () => {
    render(<Home />);

    expect(
      screen.getByRole("button", {
        name: /send/i,
      })
    ).toBeInTheDocument();
  });

  it("renders the button state demo controls", () => {
    render(<Home />);

    expect(
      screen.getByRole("button", {
        name: /test success/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /test error/i,
      })
    ).toBeInTheDocument();
  });

  it("renders the motion and accessibility note", () => {
    render(<Home />);

    expect(
      screen.getByText(/motion & accessibility note/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/prefers-reduced-motion/i)
    ).toBeInTheDocument();
  });
});