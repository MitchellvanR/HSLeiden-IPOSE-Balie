const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthDAO = require('../dao/AuthDAO');
const escape = require('validator/lib/escape');
const matches = require('validator/lib/matches');
const isStrongPassword = require('validator/lib/isStrongPassword');

require('dotenv').config()

const { JWT_SECRET, SECURE, REGISTER_KEY } = process.env;

exports.getLoggedIn = (req, res, next) => {
    let loggedIn = true;
    let decodedToken = ''

    const { token } = req.cookies

    if (!token) {
        loggedIn = false;
    } else {
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            loggedIn = false;
        }
    }

    if (typeof decodedToken.username != 'string') return res.status(200).json({ loggedIn: false });

    AuthDAO.getAccountByUsername(escape(decodedToken.username))
    .then(user => {
        if (!user.rows[0]) {
            res.status(200).json({ })
        } else {
            // Initial check whether user is logged in (On front-end app load)
            // Based on valid decodable token
            res.status(200).json({
                id: user.rows[0].id,
                username: user.rows[0].username
            });
        }
    })
}

exports.login = (req, res, next) => {
    const { username, password } = req.body;
    let loadedUser;

    if (!username || !password) return res.status(401).json({ message: 'No username and/or password sent.' });

    AuthDAO.getFullAccountByUsername(escape(username).trim())
    .then(user => {
        loadedUser = user.rows[0];

        if (!loadedUser)
            return res.status(401).json({ message: 'Invalid login.' });

        return bcrypt.compare(password, loadedUser.password);
    })
    .then(isEqual => {
        if (!isEqual) return res.status(401).json({ message: 'Invalid login.' });

        const token = jwt.sign(
            {
                id: loadedUser.id,
                username: loadedUser.username
            }, JWT_SECRET, {expiresIn: '1h'}
        ); //Generate token for client with an expire time of 1 hour.

        // Setting path to '/' so HTTP Cookie is retrievable across website
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; ${ SECURE == 'true' ? 'Secure;' : '' } expires=${+new Date(new Date().getTime()+(86409000 * 2.5)).toUTCString()}; path=/`);
        res.status(200).json({
            message: 'Logged in succesfully',
            id: loadedUser.id,
            username: loadedUser.username,
        });
        return res.send();
    })
    .catch(() => {
        return res.status(401).json({ message: 'Invalid login.' });
    });
}

exports.logout = (req, res, next) => {
    res.setHeader('Set-Cookie', `token=deleted; HttpOnly; ${ SECURE == 'true' ? 'Secure;' : '' } expires=${Date.now()}; path=/`);
    res.status(200);
    res.send();
}

exports.register = async (req, res, next) => {
    const { body } = req;

    if (!REGISTER_KEY || !body.key || body.key != REGISTER_KEY)
        return res.status(422).json({ message: 'Not allowed to register'});

    if (body.username) body.username = escape(body.username).trim();

    if (!matches(body.username, '^[a-zA-Z0-9_\.\-]*$'))
        return res.status(422).json({ message: 'Invalid characters in username'});
    else if (body.username.length < 5)
        return res.status(422).json({ message: 'Username too short'});

    if (!isStrongPassword(body.password, { minSymbols: 0 }))
        return res.status(422).json(
            { message: 'Password is too weak.\nUse lowercase letter(s), uppercase letter(s) and number(s).\nShould be atleast 8 characters long.'}
        );

    body.password = await bcrypt.hash(body.password, 12);

    AuthDAO.registerAccount(body)
    .then((data) => {
        const token = jwt.sign(
            {
                id: data.rows[0].id,
                username: body.username
            }, JWT_SECRET, {expiresIn: '1h'}
        ); //Generate token for client with an expire time of 1 hour.

        // Setting path to '/' so HTTP Cookie is retrievable across website
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; ${ SECURE == 'true' ? 'Secure;' : '' } expires=${+new Date(new Date().getTime()+(86409000 * 2.5)).toUTCString()}; path=/`);
        res.status(200).json({
            message: 'Created reviewer successfully.',
            username: body.username,
        })
    })
    .catch(() => {
        res.status(401).json({ message: 'Could not register.' });
    });
}
