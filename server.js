const dotenv = require("dotenv"); //require package
dotenv.config(); //loads the evnironment variables from .env file
const express = require("express");
const mongoose = require("mongoose"); //require package
const methodOverride = require("method-override"); 
const morgan = require("morgan"); 
const app = express();

mongoose.connect(process.env.MONGODB_URI); //connect to mongoDB using the connection string in the .env file
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
  });

const Trip = require("./models/trip.js")

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); // new
// //app.use(morgan("dev")); 

app.get("/", async (req, res) => {
    res.render("index.ejs")
})

// GET /trips
app.get("/trips", async (req, res) => {
    const allTrips = await Trip.find();
    const allTripsSorted = await allTrips.sort((a, b) => new Date(b.date) - new Date(a.date)); //got help from stack overflow with this one. the Date creates a string out of a,b.date. the new turns it into an object. the date alone is a utility function, and spits out the current date and time.  with the new operator, the date turns into a constructor function, and converts the a.date and b.date strings into objects to be sorted 
    //console.log(allTrips)
    res.render("trips/index.ejs", {trips: allTripsSorted });
})

//GET /trips/new
app.get("/trips/new", (req, res) => {
    res.render("trips/new.ejs")
})

// POST /trips
app.post("/trips", async (req, res) => {
    if (req.body.caughtFish === "on") {
        req.body.caughtFish = true;
        // res.redirect("/trips/:tripId/fish/new")
        // //app.get("/trips/:tripId/fish/new", (req, res) => {
        //   //  console.log("new fish");
        //     //res.send("new fish")
        //})
      } else {
        req.body.caughtFish = false;
      }
      await Trip.create(req.body);
      res.redirect("/trips");
  });

  //GET /trips/:tripId
  app.get("/trips/:tripId", async (req,res) => {
    const foundTrip = await Trip.findById(req.params.tripId);
    res.render("trips/show.ejs", { trip: foundTrip});
  })

//DELETE Trip
app.delete("/trips/:tripId", async (req, res) => {
    await Trip.findByIdAndDelete(req.params.tripId);
    res.redirect("/trips");
  });

app.listen(3000, () => { //created an express web server where server.js is the main entry point and configuration file
    console.log("Listening on port 3000")
})