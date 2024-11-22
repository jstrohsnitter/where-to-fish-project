const mongoose = require("mongoose");

const fishSchema = new mongoose.Schema({
    species: String,
    size: String,
    tackle: String,
})

const weatherSchema = new mongoose.Schema({
    waveHeight: String,
    waveDirection: String,
    wavePeriod: String,
})

const tripSchema = new mongoose.Schema({
    date: String,
    locationName: String,
    locationCoord: String,
    caughtFish: Boolean,
    fishInfo: [fishSchema],
    timeArrived: String,
    timeDeparted: String,
    weatherInfo: [weatherSchema]
});

const Trip = mongoose.model("Trip", tripSchema); 

module.exports = Trip;