const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BookingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  movie: {
    type: Schema.Types.ObjectId,
    ref: "Movies",
  },
  totalamount: {
    type: Number,
    required: true,
  },
  bookingdate: {
    type: Date,
    required: true,
  },
  bookingtime: {
    type: String,
    required: true,
  },
  noofseats:{
    type: Number, 
    required: true,
  }
});

module.exports = mongoose.model("Booking", BookingSchema);
