import { Router } from "express";
import {
  getUsers,
  createUser,
  processLogin,
  forgotPassword,
  resetPassword,
  getMyDetails,
  editUser,
  deleteUser,
} from "../controller/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

router.get("/users", authenticateUser, checkRole("admin","user"), getUsers);
router.get("/me", authenticateUser, getMyDetails);
router.post("/create", createUser);
router.post("/login", processLogin);
router.patch(
  "/user/edit/:userId",
  authenticateUser,
  checkRole("admin"),
  editUser
);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:token", resetPassword);
router.delete(
  "/user/delete/:userId",
  authenticateUser,
  checkRole("admin"),
  deleteUser
);

export default router;
