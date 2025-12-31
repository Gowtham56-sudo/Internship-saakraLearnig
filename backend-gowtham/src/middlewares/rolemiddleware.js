const { db } = require("../config/firebase");

// Role check middleware - accepts a single role string or an array of allowed roles
const checkRole = (requiredRoleOrRoles) => {
  return async (req, res, next) => {
    try {
      const userDoc = await db
        .collection("users")
        .doc(req.user.uid)
        .get();

      const userRole = userDoc.data().role;

      if (Array.isArray(requiredRoleOrRoles)) {
        if (!requiredRoleOrRoles.includes(userRole)) {
          return res.status(403).json({ message: "Access denied – role mismatch" });
        }
      } else {
        if (userRole !== requiredRoleOrRoles) {
          return res.status(403).json({ message: "Access denied – role mismatch" });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = checkRole;
