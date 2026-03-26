import path from "path"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"

/** Fichiers pour lesquels on exige 100 % (reste du `src` hors périmètre volontairement). */
const COVERAGE_FILES = [
  "src/lib/api.ts",
  "src/lib/apiClient.ts",
  "src/lib/auth.ts",
  "src/lib/omdb.ts",
  "src/lib/reviews.ts",
  "src/lib/socket.ts",
  "src/lib/theme.ts",
  "src/lib/userApi.ts",
  "src/components/ui/CompactSearchInput.tsx",
  "src/components/ui/Reveal.tsx",
  "src/hooks/useAuth.ts",
  "src/hooks/useCategories.ts",
  "src/hooks/useDebounce.ts",
  "src/hooks/useFilms.ts",
  "src/hooks/useFilms.omdb.ts",
  "src/hooks/useInView.ts",
  "src/hooks/useMessages.ts",
  "src/hooks/useOmdb.ts",
  "src/hooks/useReviews.ts",
]

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      reportsDirectory: "./coverage",
      all: true,
      include: COVERAGE_FILES,
      exclude: ["**/*.test.*", "**/*.spec.*", "src/test/**"],
      thresholds: {
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 100,
      },
    },
  },
})
