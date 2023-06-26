import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length > 0) {
      res.status(200).json({
        status: true,
        data: users,
        message: "User fetched successfully",
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Users not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const userDetails = req.body;
    const matchedEmail = await User.findOne({ email: userDetails.email });
    if (!matchedEmail) {
      const userCreated = await User.create(userDetails);
      res.status(200).json({
        status: true,
        id: userCreated._id,
        message: "User Created Successfully",
      });
    } else {
      res.status(400).json({
        status: false,
        message: "This email is already in use",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const processLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const matchedPass = await user.matchPassword(password);
      if (matchedPass === true) {
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "1d",
          }
        );
        res.status(200).json({
          status: true,
          message: "User Logged In successfully",
          jwtToken: token,
        });
      } else {
        res.status(400).json({
          status: false,
          message: "Incorrect Username or password",
        });
      }
    } else {
      res.status(400).json({
        status: false,
        message: "Incorrect Username or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const isEmailValid = await User.findOne({ email });
    if (isEmailValid) {
      const resetToken = isEmailValid.createResetToken();
      try {
        const subject = "Password Reset Token - Bootcamp Management System";
        const html = `<b>You have requested the password reset token in Bootcamp Management System so here is the link http://localhost:3030/api/v1/resetPassword/${resetToken} . It will expire in 10 minutes </b>`;
        sendEmail(subject, email, html);
        const resetPasswordToken = isEmailValid.resetPasswordToken;
        const resetPasswordExpire = isEmailValid.resetPasswordExpire;
        const updateData = await User.findOneAndUpdate(
          { email },
          { $set: { resetPasswordToken, resetPasswordExpire } },
          { new: true }
        );
        res.status(200).json({
          status: true,
          message: "Email has been sent successfully.",
        });
      } catch (error) {
        isEmailValid.resetPasswordToken = "";
        isEmailValid.resetPasswordExpire = "";
        const resetPasswordToken = isEmailValid.resetPasswordToken;
        const resetPasswordExpire = isEmailValid.resetPasswordExpire;
        const updateData = await User.findOneAndUpdate(
          { email },
          { $set: { resetPasswordToken, resetPasswordExpire } },
          { new: true }
        );
        res.status(500).json({
          status: false,
          message: error.message,
        });
      }
    } else {
      res.status(400).json({
        status: false,
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const resetPasswordToken = crypto
      .createHash("sha512")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (user) {
      const password = await hashPassword(req.body.password);
      const updatedPass = await User.findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $set: {
            password,
            resetPasswordExpire: "",
            resetPasswordToken: "",
          },
        },
        {
          new: true,
        }
      );
      if (updatedPass) {
        res.status(200).json({
          status: true,
          message: "Password reset successfully",
        });
      }
    } else {
      res.status(400).json({
        status: false,
        message: "Invalid password token or password expired",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};

export const getMyDetails = async (req, res) => {
  try {
    const jwtToken = req.headers.authorization.split(" ")[1];
    const { id } = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const userDetails = await User.findOne({ _id: id });
    res.status(200).json({
      status: true,
      userDetails,
      message: "Data Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const newDetails = req.body;
    const userDetails = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: newDetails,
      },
      { new: true }
    );
    if (userDetails) {
      res.status(200).json({
        status: true,
        userDetails,
        message: "User Data Edited Successfully",
      });
    } else {
      res.status(500).json({
        status: false,
        message: "Failed to update user Data",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const isDeleted = await User.deleteOne({ _id: userId });
    console.log(isDeleted);
    if (
      isDeleted &&
      isDeleted.deletedCount > 0 &&
      isDeleted.acknowledged === true
    ) {
      res.status(200).json({
        status: true,
        message: "User Deleted Successfully",
      });
    } else {
      res.status(500).json({
        status: false,
        message: "Failed to delete the user or User already deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
