import express from "express";
import { dbConnection } from "./config/db.config.js";
import "dotenv/config";
import indexRouter from "./routes/index.route.js";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
const app = express();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running on Port", PORT);
});

dbConnection();
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use("/api/v1", indexRouter);


//Error Handling for unmatched routes
app.use((req, res, next) => {
  const error = new Error();
  error.status = 404;
  error.message = "Page not found";
  next(error);
});

//Error handler middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: false,
    message: error.message,
  });
});
