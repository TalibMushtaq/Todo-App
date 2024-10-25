const jwt = require("jsonwebtoken");

const JWT_SECRET = "skjkdfkjlkj"  

function auth(req, res, next) {
    const token = req.headers.token;
    try {
        const decodedData = jwt.verify(token, JWT_SECRET);
        req.userId = decodedData.id;
        next();
    } catch (error) {
        res.status(403).json({
            message: "Incorrect credentials"
        });
    }
}

module.exports = {
    auth,
    JWT_SECRET
};