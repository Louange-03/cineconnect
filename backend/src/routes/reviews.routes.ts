import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.js"
import {
  createReview,
  getReview,
  getReviewsByFilm,
  getReviewsByUser,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js"

const router = Router()

// ✅ Public read (affichage avis)
router.get("/film/:filmId", getReviewsByFilm)

// (Optionnel) public read by user
router.get("/user/:userId", getReviewsByUser)

// ✅ Protected (créer/modifier/supprimer)
router.post("/", authMiddleware, createReview)
router.get("/:id", authMiddleware, getReview)
router.patch("/:id", authMiddleware, updateReview)
router.delete("/:id", authMiddleware, deleteReview)

export default router