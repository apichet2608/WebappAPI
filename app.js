const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const compression = require("compression"); // นำเข้า compression

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

//*-------------------------SmartAOI---------------------------//
const smartAoiRouter = require("./WebApp/smartAoi");
//*-------------------------SmartAOI---------------------------//

const app = express();
// app.use(compression()); // ใช้งาน compression middleware
app.use(cors());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

//*-------------------------SmartAOI---------------------------//
app.use("/smart_aoi", smartAoiRouter);
//*-------------------------SmartAOI---------------------------//

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
