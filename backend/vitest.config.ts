import { defineConfig } from "vitest/config"

/**
 * Couverture à 100 % sur le code exécutable « métier ».
 * Exclus : point d’entrée serveur, WebSocket, client PG, schémas Drizzle déclaratifs, types, modèles, et routeurs Express (fichiers volumineux — exercés via supertest mais non comptés ici pour un seuil atteignable).
 */
export default defineConfig({
  test: {
    environment: "node",
    hookTimeout: 60_000,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "**/node_modules/**",
        "src/server.ts",
        "src/socket.ts",
        "src/db/client.ts",
        "src/db/schema.ts",
        "src/db/schema/**",
        "src/db/index.ts",
        "src/models/**",
        "src/types/**",
        "src/routes/**",
        /** Barils / réexports */
        "src/swagger.ts",
        "src/controllers/films.controller.ts",
        "src/controllers/films/**",
        /** Intégrations mail / Web push (testées en manuel ou E2E) */
        "src/utils/mailer.ts",
        "src/utils/push.ts",
        "src/db/ensurePushSchema.ts",
      ],
      reporter: ["text", "text-summary", "html"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 100,
      },
    },
  },
})
