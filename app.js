// Load environment variables FIRST
import "./server/config/env.js";

import express from "express";
import expressLayout from "express-ejs-layouts";
import cookieParser from "cookie-parser";
import mongoStore from "connect-mongo";
import session from "express-session";
import adminRoutes from "./server/routes/admin.js";
import mainRoutes from "./server/routes/main.js";
import connectDB from "./server/config/db.js";
import methodOverride from "method-override";
import { checkAuth } from "./server/routes/admin.js";
import { isActiveRoute } from "./server/helpers/routeHelpers.js";
import compression from "compression";

// Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Body Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Compression Middleware
app.use(compression());

// Method Override Middleware
app.use(methodOverride("_method"));

// Cookie Parser
app.use(cookieParser());

// Check authentication for all routes
app.use(checkAuth);

// Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Toast Messages Middleware
app.use((req, res, next) => {
  res.locals.toast = req.session.toast;
  if (req.session.toast) {
    delete req.session.toast;
  }
  next();
});

// Static Files
app.use(express.static("public"));

// Templating Engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");

// Make isActiveRoute available in all views
app.locals.isActiveRoute = isActiveRoute;

// Routes
app.use("/", mainRoutes);
app.use("/", adminRoutes);

// Catch-all 404 -> /home
app.use((req, res) => {
  res.redirect("/home");
});

// Listen on port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
