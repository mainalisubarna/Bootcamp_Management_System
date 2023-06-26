import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../model/user.model.js";
export const authenticateUser = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];
      const verifiedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const isValid = await User.findOne({ _id: verifiedUser.id });
      if (isValid) {
        req.user = verifiedUser;
        next();
      } else {
        res.status(401).json({
          status: false,
          message: "Unauthorized user",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Authorization failed",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
