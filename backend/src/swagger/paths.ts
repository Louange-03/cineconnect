import type { OpenAPIV3 } from "openapi-types"

export const swaggerPaths: OpenAPIV3.PathsObject = {
  "/health": {
    get: {
      tags: ["Auth"],
      summary: "Healthcheck API",
      responses: {
        "200": {
          description: "API OK",
        },
      },
    },
  },
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Inscription utilisateur",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterInput" },
          },
        },
      },
      responses: {
        "200": { description: "Utilisateur inscrit" },
        "400": { description: "Payload invalide" },
      },
    },
  },
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Connexion utilisateur",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginInput" },
          },
        },
      },
      responses: {
        "200": { description: "Connexion OK" },
        "401": { description: "Identifiants invalides" },
      },
    },
  },
  "/api/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Utilisateur courant",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Profil courant" },
        "401": { description: "Non autorisé" },
      },
    },
  },
  "/api/films": {
    get: {
      tags: ["Films"],
      summary: "Lister/rechercher les films",
      parameters: [
        { in: "query", name: "q", schema: { type: "string" } },
        { in: "query", name: "category", schema: { type: "string" } },
        { in: "query", name: "limit", schema: { type: "integer" } },
      ],
      responses: {
        "200": { description: "Liste des films" },
      },
    },
  },
  "/api/films/categories": {
    get: {
      tags: ["Films"],
      summary: "Lister les catégories de films",
      responses: { "200": { description: "Liste des catégories" } },
    },
  },
  "/api/films/{id}": {
    get: {
      tags: ["Films"],
      summary: "Détail d'un film",
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "Film trouvé" },
        "404": { description: "Film non trouvé" },
      },
    },
  },
  "/api/reviews/film/{filmId}": {
    get: {
      tags: ["Reviews"],
      summary: "Lister les avis d'un film",
      parameters: [{ in: "path", name: "filmId", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "Liste des avis" } },
    },
  },
  "/api/reviews": {
    post: {
      tags: ["Reviews"],
      summary: "Ajouter un avis",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ReviewInput" },
          },
        },
      },
      responses: {
        "201": { description: "Avis créé" },
        "400": { description: "Payload invalide" },
        "401": { description: "Non autorisé" },
      },
    },
  },
  "/api/reviews/{id}": {
    put: {
      tags: ["Reviews"],
      summary: "Modifier un avis",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ReviewUpdateInput" },
          },
        },
      },
      responses: {
        "200": { description: "Avis modifié" },
        "403": { description: "Interdit" },
        "404": { description: "Introuvable" },
      },
    },
    delete: {
      tags: ["Reviews"],
      summary: "Supprimer un avis",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
      responses: {
        "200": { description: "Avis supprimé" },
        "403": { description: "Interdit" },
        "404": { description: "Introuvable" },
      },
    },
  },
  "/api/users": {
    get: {
      tags: ["Users"],
      summary: "Lister les utilisateurs",
      security: [{ bearerAuth: [] }],
      responses: {
        "200": { description: "Liste utilisateurs" },
        "401": { description: "Non autorisé" },
      },
    },
  },
  "/api/users/me/favorites": {
    get: {
      tags: ["Users"],
      summary: "Lister mes favoris",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Favoris" } },
    },
  },
  "/api/friends": {
    get: {
      tags: ["Friends"],
      summary: "Lister mes amis",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Amis" } },
    },
  },
  "/api/messages/start": {
    post: {
      tags: ["Messages"],
      summary: "Démarrer ou récupérer une conversation",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: { userId: { type: "string" } },
              required: ["userId"],
            },
          },
        },
      },
      responses: { "200": { description: "Conversation prête" } },
    },
  },
  "/api/conversations": {
    get: {
      tags: ["Conversations"],
      summary: "Lister mes conversations",
      security: [{ bearerAuth: [] }],
      responses: { "200": { description: "Conversations" } },
    },
  },
  "/api/conversations/{id}/messages": {
    get: {
      tags: ["Conversations"],
      summary: "Lister les messages d'une conversation",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "Messages" } },
    },
  },
}
