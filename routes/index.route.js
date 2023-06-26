import express from "express";
import userRouter from "./user.route.js";
import bootCampRouter from "./bootcamp.route.js"
const router = express.Router();

router.use("/", userRouter);
router.use("/bootcamp/",bootCampRouter)

export default router;
