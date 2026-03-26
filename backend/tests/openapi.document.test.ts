import { describe, expect, it } from "vitest"
import { openApiDocument } from "../src/swagger"

describe("Document OpenAPI", () => {
  it("structure minimale valide", () => {
    expect(openApiDocument.openapi).toMatch(/^3\.\d/)
    expect(openApiDocument.info?.title).toBeTruthy()
    expect(openApiDocument.paths).toBeDefined()
    expect(Object.keys(openApiDocument.paths ?? {}).length).toBeGreaterThan(0)
    expect(openApiDocument.components?.securitySchemes?.bearerAuth).toBeDefined()
  })
})
