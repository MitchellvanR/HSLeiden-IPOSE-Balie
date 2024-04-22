const express = require("express");

const reviewController = require("../controllers/ReviewController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.post("/", reviewController.createReview);

router.get("/", reviewController.getOpenReviews);

router.patch('/close/:reviewId', isAuth, reviewController.closeReview)

// GET /review/taken
router.get("/taken", isAuth, reviewController.getTakenReviews);

// PATCH /review/close/:id
router.patch("/close/:reviewId", isAuth, reviewController.closeReview);

// PATCH /review/:id
router.patch("/:reviewId", isAuth, reviewController.setReviewer);

// GET /review/:id
router.get("/:reviewId", isAuth, reviewController.getReviewById);

module.exports = router;
