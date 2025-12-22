const { admin } = require("../config/firebase");

// Firebase token verify pannum
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.error("AuthMiddleware: Token missing", req.headers.authorization);
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // uid store aagum
    next();
  } catch (error) {
    console.error("AuthMiddleware: Invalid token", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
