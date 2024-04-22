const express = require("express");

const assignmentController = require("../controllers/AssignmentController");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

// GET /assignments
router.get("/", assignmentController.getAssignments);

router.patch("/open/:assignmentId", isAuth, assignmentController.openAssignment);

router.patch("/close/:assignmentId", isAuth, assignmentController.closeAssignment);

module.exports = router;
