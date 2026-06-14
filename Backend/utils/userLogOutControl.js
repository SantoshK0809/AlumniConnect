const jwt = require('jsonwebtoken');

const handleLogout = async (req, res) => {
  //const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;
  if (accessToken) {
    const decoded = jwt.decode(accessToken);
    if (decoded) {
      await User.findByIdAndUpdate(decoded.id, { accessToken: null });
    }
  }
  // if (refreshToken) {
  //   const decoded = jwt.decode(refreshToken);
  //   if (decoded) {
  //     await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
  //   }
  // }

  res.clearCookie("accessToken");
  //res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

module.exports = {handleLogout};