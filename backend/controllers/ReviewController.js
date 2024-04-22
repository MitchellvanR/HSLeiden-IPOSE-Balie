const ReviewDAO = require("../dao/ReviewDAO");
const isNumeric = require("validator/lib/isNumeric");
const isURL = require("validator/lib/isURL");

exports.getOpenReviews = (req, res, next) => {
  ReviewDAO.getOpenReviews()
    .then((reviews) => {
      res.status(200).json({
        message: "Fetched reviews successfully.",
        reviews: reviews.rows,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getReplicaById = (req, res, next) => {
  ReviewDAO.getReplicaById(req.params.id)
    .then((replica) => {
      res.status(200).json({
        message: "Fetched replica successfully.",
        replica: replica.rows[0],
      });
    })
    .catch(() => {
      res.status(404).json({
        message: "Could not find replica by given ID",
      });
    });
};

exports.getTakenReviews = (req, res, next) => {
  ReviewDAO.getTakenReviews(req.decoded.id)
    .then((reviews) => {
      res.status(200).json({
        message: "Taken reviews loaded",
        reviews: reviews.rows,
      });
    })
    .catch(() => {
      res.status(404).json({
        message: "No reviews taken",
      });
    });
};

exports.createReview = (req, res, next) => {
  let { studentNumber, assignmentId } = req.body;

  if (!studentNumber || !assignmentId)
    return res.status(422).json({
      message: "Invalid request",
    });

  if (
    typeof studentNumber != "string" ||
    !studentNumber.match(/([(s|S)]{1}[0-9]{7})/)
  )
    return res.status(422).json({
      message:
        "Invalid studentnumber... Please type in following format: s1120364",
    });

  req.body.studentNumber = studentNumber.toLowerCase();

  if (typeof assignmentId != "number")
    return res.status(422).json({
      message: "Invalid assignment ID",
    });

  ReviewDAO.createReview(req.body)
    .then(() => {
      res.status(200).json({
        message: "Created review request succesfully!",
      });
    })
    .catch((e) => {
      res.status(422).json({
        message: e.message || "Could not create review request...",
      });
    });
};

exports.updateReplicaById = (req, res, next) => {
  if (!req.body.imageUrl || !isURL(req.body.imageUrl))
    return res.status(422).json({ message: "Invalud replica URL " });
  if (!req.params.id)
    return res.status(422).json({ message: "Invalid replica ID " });

  ReviewDAO.updateReplicaById(req.body, req.params.id)
    .then(() => {
      res.status(200).json({
        message: "Updated replica successfully.",
      });
    })
    .catch(() => {
      res.status(422).json({
        message: "Could not update replica",
      });
    });
};

exports.getReviewById = (req, res, next) => {
  const id = req.params.reviewId;
  ReviewDAO.getReviewById(id)
    .then(() => {
      return res.status(200).json({
        message: "Review loaded",
      });
    })
    .catch((e) => {
      return res.status(404).json({
        message: e.message || "Review not found",
      });
    });
};

exports.closeReview = async (req, res, next) => {
  if (!req.decoded)
  return res.status(401).json({
    message: "No authorization data",
  });

  const reviewId = req.params.reviewId * 1;
  const reviewerId = req.decoded.id;

  return ReviewDAO.close(reviewId, reviewerId)
  .then(() => {
    return res.status(200).json({
      message: "Review closed",
    });
  })
  .catch(() => {
    return res.status(422).json({
      message: "Could not close review",
    });
  })
}

exports.setReviewer = async (req, res, next) => {
  if (!req.decoded)
    return res.status(401).json({
      message: "No authorization data",
    });

  const reviewId = req.params.reviewId * 1;
  const reviewerId = req.decoded.id;

  let review = {}

  await ReviewDAO.getReviewById(reviewId)
    .then((data) => {
      review = data.rows[0];
    })
    .catch(() => {});

  if (review.reviewer_id != null)
    return res.status(409).json({
      ninja: review.username,
    });

  if (!reviewerId || !reviewId)
    return res.status(422).json({
      message: "No reviewer or review ID passed",
    });

  if (
    (typeof reviewerId != "number" && reviewerId != NaN) ||
    (typeof reviewId != "number" && reviewerId != NaN)
  )
    return res.status(422).json({
      message: "Invalid reviewer or review ID passed",
    });

  ReviewDAO.setReviewer(reviewId, reviewerId)
    .then(() => {
      return res.status(200).json({
        message: "Reviewer set",
      });
    })
    .catch((e) => {
      return res.status(422).json({
        message: e.message || "Could not set reviewer",
      });
    });
};
