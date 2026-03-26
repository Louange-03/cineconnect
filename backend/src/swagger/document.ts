import type { OpenAPIV3 } from "openapi-types"
import { swaggerComponents } from "./components.js"
import { swaggerPaths } from "./paths.js"

const port = Number(process.env.PORT ?? 3001)

export const openApiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "CineConnect API",
    version: "1.0.0",
    description:
      "Documentation de l'API CineConnect (auth, films, avis, amis, messages, conversations).",
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: "Serveur local",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Films" },
    { name: "Reviews" },
    { name: "Users" },
    { name: "Friends" },
    { name: "Messages" },
    { name: "Conversations" },
  ],
  paths: swaggerPaths,
  components: swaggerComponents,
}
