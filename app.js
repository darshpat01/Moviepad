if(process.env.NODE_ENV !== 'production'){
    require('dotenv/config');
}

const express = require('express'); 
const mongoose = require('mongoose'); 
const cors = require('cors');
const path = require('path');
const app = express();

mongoose.connect(process.env.db_connection, {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(express.json());
app.use(cors());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res)=>{
    res.render('home');
})

app.get('/addmovie',(req,res)=>{
    res.render('movieform')
})



const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})