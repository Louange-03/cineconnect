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

router.post("/", authMiddleware, createReview)
router.get("/:id", authMiddleware, getReview)
router.get("/film/:filmId", authMiddleware, getReviewsByFilm)
router.get("/user/:userId", authMiddleware, getReviewsByUser)
router.patch("/:id", authMiddleware, updateReview)
router.delete("/:id", authMiddleware, deleteReview)

export default router
