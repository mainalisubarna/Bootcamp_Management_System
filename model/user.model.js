import mongoose from "mongoose";
import bcrycpt from "bcrypt";
import crypto from "crypto";
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is a required field"],
    },
    email: {
      type: String,
      required: [true, "Email is a required field"],
      unique: [true, "This email is already registered to our system"],
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Email address must be valid",
      ],
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "publisher"],
    },
    password: {
      type: String,
      required: [true, "Password is a required field"],
      match: [
        /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
        "Minimum eight characters, at least one uppercase letter, one lowercase letter, one special character and one number",
      ],
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    passwordExpire: {
      type: Date,
    },
    jwtToken: String,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  const salt = await bcrycpt.genSalt(10);
  this.password = await bcrycpt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (pass) {
  return bcrycpt.compare(pass, this.password);
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha512")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
