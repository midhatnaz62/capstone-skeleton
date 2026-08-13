import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      include: /\.(js|jsx|ts|tsx)$/,
    }),
  ],

  esbuild: {
    loader: "jsx",
    include: /src\/.*\.js$/,
  },

  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.js",
    include: ["__tests__/**/*.test.{js,jsx}"],
    globals: true,
  },
});