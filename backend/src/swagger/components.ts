import type { OpenAPIV3 } from "openapi-types"

export const swaggerComponents: OpenAPIV3.ComponentsObject = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  schemas: {
    RegisterInput: {
      type: "object",
      required: ["email", "username", "password"],
      properties: {
        email: { type: "string", format: "email" },
        username: { type: "string" },
        password: { type: "string", minLength: 6 },
      },
    },
    LoginInput: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string" },
      },
    },
    ReviewInput: {
      type: "object",
      required: ["filmId", "rating"],
      properties: {
        filmId: { type: "string" },
        rating: { type: "number", minimum: 1, maximum: 5 },
        comment: { type: "string" },
      },
    },
    ReviewUpdateInput: {
      type: "object",
      required: ["rating"],
      properties: {
        rating: { type: "number", minimum: 1, maximum: 5 },
        comment: { type: "string" },
      },
    },
  },
}
