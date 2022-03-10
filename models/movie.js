const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 
const MovieSchema = new Schema({
    name: String, 
    movieCertificate: {
        type: String, 
        enum:['U','U/A','A','S'] 
    },
    movieLanguage: String,
    movieType: String,
    duration: String,
    director: String,
    casting: String, 
    releaseDate: String,
    premier: String,
    trailerURL :String,
    description: String,
    photoURL: String
}); 

module.exports = mongoose.model('Movie', MovieSchema); 