if (process.env.NODE_ENV !== "production") {
  require("dotenv/config");
}
const { isLoggedIn, isMember, isAdmin } = require("./middleware");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const session = require("express-session");
const Movie = require("./models/movie");
const bodyParser = require("body-parser");
const passport = require("passport");
const ejsMate = require("ejs-mate");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const catchAsync = require("./utils/catchAsync");
// const ExpressError = require('./utils/ExpressError')
const User = require("./models/user");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

mongoose.connect(process.env.db_connection, {});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());

const secret = process.env.secret || "randomsecret";
const store = new MongoStore({
  mongoUrl: process.env.db_connection,
  secret,
  touchAfter: 24 * 3600,
});
store.on("error", function (e) {
  console.log("Session store error!", e);
});
const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    /*secure:'true',*/
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    User.authenticate()
  )
);

//homepage
app.get("/", async (req, res) => {
  const movies = await Movie.find({});
  res.render("home", { movies });
});

app.post("/", async (req, res) => {
  try {
    const movie = new Movie(req.body.movie);
    await movie.save();
    console.log(movie);
    res.redirect("/");
  } catch (e) {
    console.log(e);
  }
});

// addmovie
app.get("/addmovie", (req, res) => {
  res.render("movieform");
});

//login route
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const redirectUrl = req.session.returnTo || "/";
  console.log("successfully logged in");
  console.log(redirectUrl);
  delete req.session.returnTo;
  res.redirect(redirectUrl);
});

// register route
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    console.log(req.body);
    const { email, username, password, role } = req.body;
    const user = new User({ email, username, role });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        console.log(err);
      }
      console.log("user created");
      res.redirect("/");
    });
  } catch (e) {
    console.log(e);
    res.redirect("error");
  }
});

app.get("/booknow/:id", isLoggedIn, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      console.log("Movie doesnt exist");
      return res.redirect("/");
    }
    const movies = await Movie.find({});
    console.log(movies);
    const moviesrem = await movies.filter(
      (movierem) => movierem.name != movie.name
    );
    console.log(moviesrem);
    res.render("booknow", { movie, movies: moviesrem });
  } catch (e) {
    console.log(e);
  }
});

//admin routes

app.get("/admindashboard", isLoggedIn, isAdmin, async (req, res) => {
  res.render("admin");
});

app.get("/movie/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    console.log("Movie doesnt exist");
    return res.redirect("/");
  }
  res.render("movieinfo", { movie });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
