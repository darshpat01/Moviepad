const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MovieSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  certificate: {
    type: String,
    enum: ["U", "U/A", "A", "S"],
  },
  language: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  casting: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: String,
    required: true,
  },
  time: {
    type: Array,
    // enum: ["8:00AM", "10:00AM", "2:00PM", "4:00PM", "6:00PM", "8:00PM"],
    default: ["8:00AM", "10:00AM", "2:00PM", "4:00PM", "6:00PM", "8:00PM"],
  },

  // premier: {
  //     type: String,
  //     required: true
  // },
  // trailerURL :{
  //     type: String,
  //     required: true
  // },
  // description: {
  //     type: String,
  //     required: true
  // },
  // photoURL: {
  //     type: String,
  //     required: true
  // }
});

module.exports = mongoose.model("Movies", MovieSchema);
