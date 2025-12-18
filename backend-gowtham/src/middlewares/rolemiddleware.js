const { db } = require("../config/firebase");

// Role check middleware
const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const userDoc = await db
        .collection("users")
        .doc(req.user.uid)
        .get();

      const userRole = userDoc.data().role;

      if (userRole !== requiredRole) {
        return res.status(403).json({
          message: "Access denied – role mismatch",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = checkRole;
