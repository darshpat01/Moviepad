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
const { not } = require("ip");
const Booking = require('./models/booking');

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

// passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "email",
//     },
//     User.authenticate()
//   )
// );

// app.use((req, res, next) => {
//   res.locals.currentUser = req.user;
//   res.locals.error = console.log("error");
//   next();
// });
passport.use(User.createStrategy());
/*
-------------------------------------------------------
                        ROUTES
-------------------------------------------------------
*/

//login route
app.get("/login", (req, res) => {
  const user = req.user;
  res.render("login", { user });
});

// register route
app.get("/register", (req, res) => {
  const user = req.user;
  res.render("register", { user });
});

app.get("/logout", async (req, res) => {
  req.logout();
  console.log(req);
  res.redirect("/");
});

// post route to register
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

// post route to login
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/error",
  }),
  async (req, res) => {
    const redirectUrl = req.session.returnTo || "/";
    console.log("successfully logged in");
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

/*
-------------------------------------------------------
                    MEMBER ROUTES
-------------------------------------------------------
*/

//homepage
app.get("/", async (req, res) => {
  const movies = await Movie.find({});
  const user = req.user;
  console.log(user);
  res.render("home", { movies, user });
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

app.get("/booknow/:id", isLoggedIn, async (req, res) => {
  try {
    const user = req.user;
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
    res.render("booknow", { movie, movies: moviesrem, user });
  } catch (e) {
    console.log(e);
  }
});

app.get("/movie/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) {
    console.log("Movie doesnt exist");
    return res.redirect("/");
  }
  const user = req.user;
  res.render("movieinfo", { movie, user });
});

app.post("/bookshow", isLoggedIn, isMember, async (req, res) => {
  try {
    console.log('movie request'); 
  const movie = await Movie.findById(req.body.booking.movie);     
  const user = req.user;
  const noofseats = parseInt(req.body.booking.noofseats);
  const totalamount = noofseats*300; 
  const time = req.body.booking.time; 
  const date = req.body.booking.date; 
  
  const newbooking = new Booking({
    user:user, 
    movie:movie,
    totalamount:totalamount,
    bookingdate:date,
    bookingtime:time,
    noofseats:noofseats,
  });
  await newbooking.save(); 
  console.log("booking saved");
  res.redirect(`/payment/${newbooking._id}`); 
    
  } catch (error) {
    console.log(error,'ERROR!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  }  
 
});
/*
-------------------------------------------------------
                    PAYMENT ROUTES
-------------------------------------------------------
*/

app.get("/payment/:id", async(req, res)=>{
  const id = req.params.id; 
  const user = req.user; 
  const booking = await Booking.findById(id); 
  res.render('payment',{booking, user});
}); 

app.post("/payment/:id", async(req,res)=>{
  const id = req.params.id; 
  const user = req.user; 
  const booking = await Booking.findById(id); 
  res.redirect(`/receipt/${booking._id}`); 
}); 

app.get('/receipt/:id', async (req,res)=>{
  const id = req.params.id; 
  const user = req.user; 
  const booking = await Booking.findById(id); 
  res.render('receipt',{booking, user});
}); 

/*
-------------------------------------------------------
                    ADMIN ROUTES
-------------------------------------------------------
*/

// admin homepage
app.get("/adminhome", isLoggedIn, isAdmin, async (req, res) => {
  const user = req.user;
  res.render("adminpages/adminhome", { user });
});

// addmovie
app.get("/addmovie", isLoggedIn, isAdmin, (req, res) => {
  const user = req.user;

  res.render("adminpages/movieform", { user });
});

//my account
app.get("/accountinfo", isLoggedIn, isAdmin, (req, res) => {
  const user = req.user;

  res.render("adminpages/adminacc", { user });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
