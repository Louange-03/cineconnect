import express from "express"
import cors from "cors"
import { createServer } from "http"
import swaggerUi from "swagger-ui-express"

import { authRoutes } from "./routes/auth.routes"
import { filmsRoutes } from "./routes/films.routes"
import { usersRoutes } from "./routes/users.routes"
import { reviewsRoutes } from "./routes/reviews.routes"
import friendsRoutes from "./routes/friends.routes"
import messagesRoutes from "./routes/messages.routes"
import conversationsRoutes from "./routes/conversations.routes"
import { initSocket } from "./socket"
import { openApiDocument } from "./swagger"
import { pool } from "./db/client"
import { ensurePasswordResetSchema } from "./db/ensurePasswordResetSchema.js"
import { isSmtpFullyConfigured } from "./utils/mailer"

const app = express()

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173"
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }))
app.use(express.json())

app.get("/health", (_req, res) => res.json({ ok: true }))
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument))
app.get("/api/docs-json", (_req, res) => res.json(openApiDocument))

// Optionally respond to the root URL for people checking if the API is up
app.get("/", (_req, res) => {
	res.json({ ok: true, name: "Cineconnect API is running" })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/films", filmsRoutes)
app.use("/api/users", usersRoutes)
app.use("/api/reviews", reviewsRoutes)
app.use("/api/friends", friendsRoutes)
app.use("/api/messages", messagesRoutes)
app.use("/api/conversations", conversationsRoutes)

const port = Number(process.env.PORT ?? 3007)

async function start() {
	if (!process.env.DATABASE_URL) {
		console.error("DATABASE_URL manquant dans l'environnement")
		process.exit(1)
	}

	await ensurePasswordResetSchema()

	const httpServer = createServer(app)
	initSocket(httpServer, FRONTEND_ORIGIN as string)

	httpServer.listen(port, () => {
		console.log(`API listening on http://localhost:${port}`)
		if (isSmtpFullyConfigured()) {
			console.log("[mail] SMTP configuré — les e-mails de réinitialisation de mot de passe seront envoyés.")
		} else {
			console.log(
				"[mail] SMTP non configuré (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM). " +
					"Mot de passe oublié : lien uniquement dans les logs serveur.",
			)
		}
	})
}

start().catch((err) => {
	console.error("Impossible de démarrer le serveur:", err)
	pool.end().catch(() => undefined)
	process.exit(1)
})