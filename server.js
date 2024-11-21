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
const Fish = require("./models/fish.js")

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); // new
// //app.use(morgan("dev")); 

app.get("/", async (req, res) => {
    res.render("index.ejs")
})

//GET /fish/new
app.get("/trips/:tripId/fish/new", async (req, res) => {
    const foundTrip = await Trip.findById(req.params.tripId);
    res.render("fish/new.ejs", {trip: foundTrip})
})

// POST /fish
app.post("/fish", async (req, res) => {
      await Fish.create(req.body);
      const fishId = (req.params.fishId)
      const updatedFish = await Fish.findByIdAndUpdate(
        fishId,
        {assignee: (req.params.tripId)},
        {new:true}
      );
      res.redirect("/trips");
  });

// GET /trips <----- Do this for fish under log a fish in trips/:tripId
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
      } else {
        req.body.caughtFish = false;
      }
      await Trip.create(req.body);
      res.redirect("/trips");
  });

  //GET /trips/:tripId
  app.get("/trips/:tripId", async (req,res) => {
    const foundTrip = await Trip.findById(req.params.tripId);
    const foundFish = await Fish.find(req.params.tripId); // this finds a string of the trip Id. it can't be turned into fish because it is a string not an object.  don't know how to retrieve the whole object
    res.render("trips/show.ejs", { trip: foundTrip, fish: foundFish});
  })

//DELETE Trip
app.delete("/trips/:tripId", async (req, res) => {
    await Trip.findByIdAndDelete(req.params.tripId);
    res.redirect("/trips");
  });

// GET localhost:3000/trips/:tripId/edit
app.get("/trips/:tripId/edit", async (req, res) => {
    const foundTrip = await Trip.findById(req.params.tripId);
    console.log(foundTrip);
    res.render("trips/edit.ejs", {
        trip: foundTrip,
    });
});

//PUT Edit trip /trips/:tripId

app.put("/trips/:tripId", async (req, res) => {
    // Handle the 'caughtFish' checkbox data
    if (req.body.caughtFish === "on") {
        req.body.caughtFish = true;
      } else {
        req.body.caughtFish = false;
      }
    // Update the trip in the database
    await Trip.findByIdAndUpdate(req.params.tripId, req.body);
  
    // Redirect to the trip's show page to see the updates
    res.redirect(`/trips/${req.params.tripId}`);
  });


app.listen(3000, () => { //created an express web server where server.js is the main entry point and configuration file
    console.log("Listening on port 3000")
})

//===================================TRASH====================================

     //  // res.redirect("/trips/:tripId/fish/new") //need to check whether the s on trips on line 30 effects this code
       // //app.get("/trips/:tripId/fish/new", (req, res) => {
          // // console.log("new fish");
           ////res.render("fish/new.ejs");