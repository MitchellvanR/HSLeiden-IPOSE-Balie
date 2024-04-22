const db = require("../database/db");

module.exports = class AssignmentDAO {
  static getAssignments() {
    return db.query("SELECT * FROM assignment ORDER BY name");
  }

  static closeAssignment(id) {
    return db.query("UPDATE assignment SET open = false WHERE id = $1", [id]);
  }

  static openAssignment(id) {
    return db.query("UPDATE assignment SET open = true WHERE id = $1", [id]);
  }
};
