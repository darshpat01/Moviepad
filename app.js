
if(process.env.NODE_ENV !== 'production'){
    require('dotenv/config');
}

const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors');
const path = require('path');
const app = express();
const Movie = require('./models/movie'); 
const bodyParser = require('body-parser');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')

mongoose.connect(process.env.db_connection, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
  }));

// parse application/json
app.use(bodyParser.json())

// app.use(methodOverride('_method'));

app.get('/', async(req,res)=>{
    const movies = await Movie.find({});
    res.render('home',{movies});
})

app.get('/addmovie',(req,res)=>{
    res.render('movieform')
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