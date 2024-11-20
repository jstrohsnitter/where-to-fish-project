const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    date: String,
    locationName: String,
    locationCoord: String,
    caughtFish: Boolean,
    timeArrived: String,
    timeDeparted: String,
});

const Trip = mongoose.model("Trip", tripSchema); 

module.exports = Trip;