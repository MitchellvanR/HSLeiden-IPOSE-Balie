const db = require("../database/db");

module.exports = class ReviewDAO {
  static getOpenReviews() {
    return db.query(`
            SELECT r.id AS id, s.st_number AS student_number, r.request_time AS request_time, a.id AS assignment_id
            FROM review r
            LEFT JOIN student s ON r.student_id = s.id
            LEFT JOIN assignment a ON r.assignment_id = a.id
            WHERE reviewer_id IS NULL AND request_time >= CURRENT_DATE AND r.open = true ORDER BY request_time;
        `);
  }

  static getClosedReviews() {
    return db.query(
      "SELECT * FROM review WHERE reviewer_id IS NOT NULL ORDER BY request_time;"
    );
  }

  static getAllReviews() {
    return db.query("SELECT * FROM review ORDER BY request_time;");
  }

  static getReviewById(id) {
    return db.query("SELECT * FROM review LEFT JOIN reviewer ON reviewer.id = review.reviewer_id WHERE review.id = $1;", [id]);
  }

  static getTakenReviews(id) {
    return db.query(`
      SELECT r.id AS id, s.st_number AS student_number, r.request_time AS request_time, a.id AS assignment_id
      FROM review r
      LEFT JOIN student s ON r.student_id = s.id
      LEFT JOIN assignment a ON r.assignment_id = a.id
      WHERE r.reviewer_id = $1 AND r.open = true AND request_time >= CURRENT_DATE ORDER BY request_time;`,
      [id]
    );
  }

  static async createReview(body) {
    const { studentNumber, assignmentId } = body;

    await db
      .query("SELECT * FROM assignment WHERE id=$1 AND open=true;", [
        assignmentId,
      ])
      .then((assignment) => {
        if (assignment.rows.length <= 0)
          throw new Error("This help counter is not open");
      });

    let studentId = -1;

    await db
      .query("SELECT * FROM student WHERE st_number=$1;", [studentNumber])
      .then((student) => {
        if (student.rows.length <= 0)
          throw new Error("This student is not allowed to request help");
        else studentId = student.rows[0].id;
      });

    let newDate = new Date().toLocaleString();

    return db
      .query(
        `
            SELECT st_number, reviewer_id, request_time
            FROM student
            RIGHT JOIN review ON review.student_id = student.id
            WHERE st_number=$1 AND request_time >= CURRENT_DATE;
        `,
        [studentNumber]
      )
      .then(async (students) => {
        for (let i = 0; i < students.rows.length; i++) {
          if (students.rows[i].reviewer_id == null)
            throw new Error("This student has already requested help");
        }

        return await db.query(
          "INSERT INTO review (student_id, assignment_id, request_time, open) VALUES ($1, $2, $3, $4);",
          [studentId, assignmentId, newDate, true]
        );
      });
  }

  static deleteReplicaById(id) {
    // Escape not needed, DB errors if invalid type
    return db.query("DELETE FROM replica WHERE id=$1;", [id]);
  }

  static setReviewer(reviewId, reviewerId) {
    return db.query("UPDATE review SET reviewer_id = $1 WHERE id = $2;", [
      reviewerId,
      reviewId,
    ]);
  }

  static close(reviewId, reviewerId) {
    return db.query("UPDATE review SET open = false WHERE reviewer_id = $1 AND id = $2;", [
      reviewerId,
      reviewId,
    ]);
  }
};
