import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("jwt", token, {
    maxAge:3* 24 * 60 * 60 * 1000,
    httpOnly: true, // cookie cannot be accessed by client side scripts and prevents XSS attacks (Cross-Site Scripting attacks)
    sameSite: "strict", //prevent CSRF attacks (Cross-Site Request Forgery attacks)
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};
