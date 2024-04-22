const AssignmentDAO = require("../dao/AssignmentDAO");

exports.getAssignments = (req, res, next) => {
  AssignmentDAO.getAssignments()
    .then((data) => {
      return res.status(200).json({
        message: "Assignments loaded",
        assignments: data.rows,
      });
    })
    .catch(() => {
      return res.status(404).json({
        message: "Could not find assignments",
        assignments: null,
      });
    });
};

exports.closeAssignment = (req, res, next) => {
  id = req.params.assignmentId;
  AssignmentDAO.closeAssignment(id)
    .then(() => {
      return res.status(200).json({
        message: "Assignment closed",
      });
    })
    .catch(() => {
      return res.status(422).json({
        message: "Could not close assignment",
      });
    });
};

exports.openAssignment = (req, res, next) => {
  id = req.params.assignmentId;
  AssignmentDAO.openAssignment(id)
    .then(() => {
      return res.status(200).json({
        message: "Assignment opened",
      });
    })
    .catch(() => {
      return res.status(422).json({
        message: "Could not open assignment",
      });
    });
};
