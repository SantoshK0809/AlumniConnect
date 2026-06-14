const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  //const token = req.headers.authorization?.split(" ")[1];

  // const token = req.cookies?.accessToken;
  // req.user = null;
  // if (!token) return res.status(401).json({ message: "No token provided" });

  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  
  // Replace the above commented part to get token in cookies
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // contains { id, role }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken };
