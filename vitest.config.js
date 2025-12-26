import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./frontend/src/test/setup.js"],
    css: true,
    include: [
      "frontend/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "backend/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
  },
})
