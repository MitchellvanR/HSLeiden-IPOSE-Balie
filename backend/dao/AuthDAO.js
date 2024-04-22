const db = require('../database/db');
const escape = require('validator/lib/escape')

module.exports = class AuthDAO {
    static getAccountByUsername(username) {
        return db.query(`SELECT id, username FROM reviewer WHERE username=$1;`, [username]);
    }

    static getFullAccountByUsername(username) {
        return db.query(`SELECT reviewer.id, username, password FROM reviewer WHERE username=$1;`, [username]);
    }

    static registerAccount(body) {
        const { username, password } = body;

        return db.query(
            'INSERT INTO reviewer (username, password) ' +
            'VALUES ($1, $2) RETURNING id;',
            [username, password]
        );
    }
}