const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];  // Extract token from header
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });

    // Log the decoded token to ensure it contains user_id
    console.log("Decoded JWT:", decoded);  

    // Attach decoded user information to request
    req.user = decoded;
    
    // Ensure user_id exists in the token
    if (!req.user.user_id) {
      return res.status(400).json({ message: "Invalid token, missing user_id" });
    }

    next();
  });
}

module.exports = { authenticateJWT };
