const mongoose = require("mongoose");

// const fishSchema = new mongoose.Schema({
//     species: String,
//     size: String,
//     tackle: String,
// })


const tripSchema = new mongoose.Schema({
    date: String,
    locationName: String,
    locationCoord: String,
    caughtFish: Boolean,
    ////fishInfo: [fishSchema],
    timeArrived: String,
    timeDeparted: String,
});

const Trip = mongoose.model("Trip", tripSchema); 

module.exports = Trip;