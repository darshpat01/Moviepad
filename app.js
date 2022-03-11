
if(process.env.NODE_ENV !== 'production'){
    require('dotenv/config');
}

const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors');
const path = require('path');
const app = express();
const session = require('express-session');
const Movie = require('./models/movie'); 
const bodyParser = require('body-parser');
const passport = require('passport');
const ejsMate = require('ejs-mate'); 
const MongoStore = require('connect-mongo');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const User = require('./models/user')


mongoose.connect(process.env.db_connection, {});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
  }));


app.use(bodyParser.json())



app.use(passport.initialize());
app.use(passport.session()); 
// passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 
const secret = process.env.secret || 'randomsecret';
const store = new MongoStore({
    mongoUrl: process.env.DATABASE_KEY, secret, touchAfter: 24 * 3600
  })
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      /*secure:'true',*/
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }

  app.use(session(sessionConfig));
  passport.use(new LocalStrategy({
    usernameField: 'email'
  }, User.authenticate()));

app.get('/', async(req,res)=>{
    const movies = await Movie.find({});
    res.render('home',{movies});
})

app.get('/addmovie',(req,res)=>{
    res.render('movieform')
})

app.get('/login',(req,res)=>{
    res.render('login')
})



app.post('/',async(req,res)=>{  
    try{
        const movie = new Movie(req.body.movie);    
    await movie.save();
    console.log(movie);    
    res.redirect('/');
    } catch(e){
        console.log(e); 
    }
    
})



const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})