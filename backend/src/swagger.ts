import type { OpenAPIV3 } from "openapi-types"

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
  paths: {
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
  },
  components: {
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
  },
}

import type { OpenAPIV3 } from "openapi-types"

const openapi: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "CinéConnect API",
    description:
      "API REST de l'application CinéConnect (authentification, catalogue de films, avis, messagerie temps réel).",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Serveur de développement local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", description: "JWT à utiliser dans Authorization: Bearer <token>" },
          user: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              username: { type: "string" },
            },
          },
        },
      },
      Film: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          imdbId: { type: "string", example: "tt0133093" },
          title: { type: "string", example: "The Matrix" },
          year: { type: "string", example: "1999" },
          posterUrl: { type: "string", nullable: true },
          synopsis: { type: "string", nullable: true },
          categories: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          filmId: { type: "string", format: "uuid" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [],
  paths: {
    "/health": {
      get: {
        summary: "Healthcheck de l'API",
        tags: ["system"],
        responses: {
          200: {
            description: "API opérationnelle",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Connexion utilisateur",
        tags: ["auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Connexion réussie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: { description: "Identifiants invalides" },
        },
      },
    },
    "/api/films": {
      get: {
        summary: "Lister les films du catalogue",
        tags: ["films"],
        parameters: [
          {
            in: "query",
            name: "q",
            schema: { type: "string" },
            description: "Rechercher par titre",
          },
          {
            in: "query",
            name: "category",
            schema: { type: "string" },
            description: "Filtrer par catégorie",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 60 },
            description: "Nombre maximum de films retournés",
          },
        ],
        responses: {
          200: {
            description: "Liste des films",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    films: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Film" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/films/{id}": {
      get: {
        summary: "Détail d'un film",
        description: "Récupère un film par son UUID interne ou par son imdbId (tt0133093).",
        tags: ["films"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Film trouvé",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    film: { $ref: "#/components/schemas/Film" },
                  },
                },
              },
            },
          },
          404: { description: "Film non trouvé" },
        },
      },
    },
    "/api/films/omdb/search": {
      get: {
        summary: "Recherche OMDb (externe) pour import",
        tags: ["films"],
        parameters: [
          {
            in: "query",
            name: "q",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Résultats OMDb",
          },
        },
      },
    },
    "/api/films/import": {
      post: {
        summary: "Importer un film depuis OMDb dans la base locale",
        tags: ["films"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["imdbID"],
                properties: {
                  imdbID: { type: "string", example: "tt0133093" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Film importé",
          },
          400: { description: "Données invalides" },
          401: { description: "Non authentifié" },
        },
      },
    },
    "/api/reviews/film/{filmId}": {
      get: {
        summary: "Lister les avis pour un film",
        tags: ["reviews"],
        parameters: [
          {
            in: "path",
            name: "filmId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Avis du film",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Review" },
                },
              },
            },
          },
        },
      },
    },
    "/api/reviews": {
      post: {
        summary: "Créer ou mettre à jour un avis pour un film",
        tags: ["reviews"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["filmId", "rating"],
                properties: {
                  filmId: { type: "string", format: "uuid" },
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  comment: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Avis enregistré" },
          401: { description: "Non authentifié" },
        },
      },
    },
  },
}

export default openapi

