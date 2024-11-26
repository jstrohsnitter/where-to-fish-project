const dotenv = require("dotenv"); //require package
dotenv.config(); //loads the evnironment variables from .env file
const express = require("express");
const mongoose = require("mongoose"); //require package
const methodOverride = require("method-override"); 
const morgan = require("morgan"); 
const app = express();
const axios = require("axios");


mongoose.connect(process.env.MONGODB_URI); //connect to mongoDB using the connection string in the .env file
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
  });

const Trip = require("./models/trip.js")
const Fish = require("./models/fish.js")


//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); // new
app.use(express.static('public'));
app.use(express.static('assets')); //was trying this for showing images but was having some trouble, worked around with imgur instead


app.get("/", async (req, res) => {
   res.render("index.ejs")
})

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
    if(foundTrip.weatherInfo.length < 1) {
     function getData() {
     let lat = foundTrip.latitude;
     let lng = foundTrip.longitude
     console.log(`lat: ${lat}`)
     let data = JSON.stringify({ //from this down to line 155 came from postman's embed code option. i added in all the math code for taking an average and then adding it to the trip schema as a sub document
        "lat": lat, 
        "lon": lng, 
        "model": "gfsWave",
        "parameters": [
          "waves"
        ],
        "levels": [
          "surface"
        ],
        "key": `${process.env.WINDY_KEY}`
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity, //this is an axios request configuration, allows an unlimited request body. allows a large request to be made. this info is from chatgpt
        url: 'https://api.windy.com/api/point-forecast/v2',
        headers: { //from chatgpt: this is specifying HTTP headers to include with the request. "it informs the server about the type of data being sent in the body of the request. application/json indicated that the payload is formatted as JSON (JavaScript Object Notation. the request is being sent as a JSON string, so with this you're telling the server to interpret the body as JSON"
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios.request(config) //from chatGPT "Axios is a popular JavaScript library (a pre-written collection of JavaScript code that provides reusable functions, methods, or tools to simplify common tasks in web development.) used to make HTTP requests from web browsers or Node.js environments. it simplifies the process of sending requests to APIs and handling responses"
      .then((response) => { //original 'end' of postman nodejs script w/ a console.log(JSON.stringify(response.data)); as the function
          const waveHeight = response.data["waves_height-surface"] //got help from chatgpt writing this function (some of it, the math syntax on finding an average, originally it gave me a function using some stuff i had never seen before, so i rewrote using a for each loop, and set new variables and what not)
          const waveDirection = response.data["waves_direction-surface"]
          const wavePeriod = response.data["waves_period-surface"]
          //calculate average wave heightt
          function calculateSumHeight() {
          let sum = 0
          waveHeight.forEach(banana => {
              sum += banana
          });
          return sum
          }
          const waveSum = calculateSumHeight(waveHeight)
          function calculateAverageHeight() {
              return waveSum / waveHeight.length
          }
          const waveHeightAverage = calculateAverageHeight()
          console.log("Wave Height Average:", waveHeightAverage);
          //calculate average wave direction
          function calculateSumDirection() {
              let sum = 0
              waveDirection.forEach(banana => {
                   sum += banana
              });
              return sum
              }
              const waveSumDirection = calculateSumDirection(waveDirection)
              function calculateAverageDirection() {
                  return waveSumDirection / waveDirection.length
                  }
              const waveDirectionAverage = calculateAverageDirection()
          console.log("Wave Direction Average:", waveDirectionAverage);
          //calculate average period
          function calculateSumPeriod() {
              let sum = 0
              wavePeriod.forEach(banana => {
                   sum += banana
              });
              return sum
              }
              const waveSumPeriod = calculateSumPeriod(wavePeriod)
              function calculateAveragePeriod() {
                  return waveSumPeriod / wavePeriod.length
                  }
              const wavePeriodAverage = calculateAveragePeriod()
          console.log("Wave Period Average:", wavePeriodAverage);
        function roundToThousandth(num) {
            return Math.round(num * 1000) / 1000;
          }
      const height = roundToThousandth(waveHeightAverage)
      const direction = roundToThousandth(waveDirectionAverage)
      const period = roundToThousandth(wavePeriodAverage)
      const averages = { "waveHeight": height, "waveDirection" : direction, "wavePeriod" : period }
      console.log(averages) 
      //const averagesString = JSON.stringify(averages)   
      const newWeather = foundTrip.weatherInfo.push(averages); //had to set this as a new variable in order to push the averages to the model
      console.log(newWeather)
      foundTrip.save()
      res.render("trips/show.ejs", {trip: foundTrip});
  }) //then response close function syntax
} getData()// getData closing bracket
    } else { //if closing bracket, else for rendering page. what this is is doing is saying if the weatherInfo doesn't exist, run this getData function. at the end of the get data function, once all the variables are defined via call to the API, averages taken, render the show page with all the info set to trip
        res.render("trips/show.ejs", {trip: foundTrip});
    }
}) //app.get closing syntax

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

  //GET /fish/new
app.get("/trips/:tripId/fish/new", async (req, res) => {
    const foundTrip = await Trip.findById(req.params.tripId);
    res.render("fish/new.ejs", {trip: foundTrip})
})

// POST /fish
app.post("/trips/:tripId/fish", async (req, res) => {
      const newFishData = await Fish.create(req.body);
      const tripToUpdate = await Trip.findById(req.params.tripId)
      const newFish = tripToUpdate.fishInfo.push(newFishData)
      await tripToUpdate.save()
      console.log(newFish)
      res.redirect(`/trips/${req.params.tripId}`);
  });

//GET /maps
// //app.get("/maps", async (req,res) => {
//  //  res.sendFile("/Users/macbook/code/ga/labs/where-to-fish-project/public/map.html");
// })

app.get('/maps', (req, res) => { //got this technique from chat gpt to directly inject a html file. pretty clunky. had no idea this was an option
    const apiKey = process.env.GOOGLE_KEY; // Get API key from environment variables
    res.send(`
      <!doctype html>
      <html>
        <head>
          <title>Add Map</title>
          <link rel="stylesheet" type="text/css" href="/style.css" />
          <script type="module" src="/link.js"></script>
          <script type="module" src="/index.js"></script>
        </head>
        <body id="google-map">
          <h3>Where did you fish?</h3><a href="/trips/new">Set these coordinates for your trip</a>
          <div id="map"></div>
          <script async defer id="google-script" src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap"></script>
        </body>
        <style>
          #map {
            height: 100%;
          }
          html, body {
            height: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </html>
    `);
  });

app.listen(3000, () => { //created an express web server where server.js is the main entry point and configuration file
    console.log("Listening on port 3000")
})

//===================================TRASH====================================

     //  // res.redirect("/trips/:tripId/fish/new") //need to check whether the s on trips on line 30 effects this code
       // //app.get("/trips/:tripId/fish/new", (req, res) => {
          // // console.log("new fish");
           ////res.render("fish/new.ejs");

      // //const fishId = (req.params.fishId)
    // //  const updatedFish = await Fish.findByIdAndUpdate(
    //   //  fishId,
    //   //  {assignee: (req.params.tripId)},
    //   //  {new:true}
    // //  );

    // // const foundFish = await Fish.find(req.params.tripId); // this finds a string of the trip Id. it can't be turned into fish because it is a string not an object.  don't know how to retrieve the whole object

    // try {
    //     const response = await axios.get("https://api.windy.com/api/point-forecast/v2");
    //     const apiData = response.data;

    //     const savedItems = await Weather.insertMany(
    //         apiData.map((item) => ({
    //             timeStamp: [item.ts],
    //             units: item.units,
    //             waveHeight: [item.waves_height-surface],
    //             waveDirection: [item.waves_direction-surface],
    //             wavePeriod: [item.waves_Period-surface],
    //         }))
    //     );
    //     res.status(200).json({ message: "Data fetched and saved successfully", savedItems });
    // }   catch (error) {
    //     console.error("Error fetching API data:", error.message);
    //     res.status(500).json({ error: "Failed to fetch API data" });
    //  // }

    //==========================================FETCHING WAVE DATA FROM WINDY API===================================================
// if(req.params.tripId.weatherInfo.length < 1) {
//     function getData() {
//     let data = JSON.stringify({
//         "lat": 41.363,
//         "lon": -71.48,
//         "model": "gfsWave",
//         "parameters": [
//           "waves"
//         ],
//         "levels": [
//           "surface"
//         ],
//         "key": "CGSJWdI2k43RDFeHmw8fidU3AzubK2r9"
//       });
      
//       let config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: 'https://api.windy.com/api/point-forecast/v2',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         data : data
//       };
      
//       axios.request(config)
//       .then((response) => {
//           const waveHeight = response.data["waves_height-surface"]
//           const waveDirection = response.data["waves_direction-surface"]
//           const wavePeriod = response.data["waves_period-surface"]
//           function calculateSumHeight() {
//           let sum = 0
//           waveHeight.forEach(banana => {
//               sum += banana
//           });
//           return sum
//           }
//           const waveSum = calculateSumHeight(waveHeight)
//           function calculateAverageHeight() {
//               return waveSum / waveHeight.length
//           }
//           const waveHeightAverage = calculateAverageHeight()
//               console.log("Wave Height Average:", waveHeightAverage);
    
//           function calculateSumDirection() {
//               let sum = 0
//               waveDirection.forEach(banana => {
//                    sum += banana
//               });
//               return sum
//               }
//               const waveSumDirection = calculateSumDirection(waveDirection)
//               function calculateAverageDirection() {
//                   return waveSumDirection / waveDirection.length
//                   }
//               const waveDirectionAverage = calculateAverageDirection()
//           console.log("Wave Direction Average:", waveDirectionAverage);
    
//           function calculateSumPeriod() {
//               let sum = 0
//               wavePeriod.forEach(banana => {
//                    sum += banana
//               });
//               return sum
//               }
//               const waveSumPeriod = calculateSumPeriod(wavePeriod)
//               function calculateAveragePeriod() {
//                   return waveSumPeriod / wavePeriod.length
//                   }
//               const wavePeriodAverage = calculateAveragePeriod()
//           console.log("Wave Period Average:", wavePeriodAverage);
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//     } getData()
//     } 
//=====================================================================================================================================================================

// <body >
    

// <form action="/trips/<%=trip._id%>?_method=PUT"  method="POST">
//     <label for="date">Date (MM/DD/YYYY):</label>
//     <input type="text" name="date" id="editDate" value="<%= trip.date %>"/>

//     <label for="locationName">Location Name:</label>
//     <input type="text" name="locationName" id="editLocationName"  />

//     <label for="latitude">Latitude:</label>
//     <input type="text" name="latitude" id="latitude" />

//     <label for="longitude">Longitude:</label>
//     <input type="text" name="longitude" id="longitude" value="<%= trip.longitude %>"/>

//     <label for="timeArrived">Time Arrived:</label>
//     <input type="text" name="timeArrived" id="editTimeArrived" value="<%= trip.timeArrived %>"/>

//     <label for="timeArrived">Time Departed:</label>
//     <input type="text" name="timeDeparted" id="editTimeDeparted" value="<%= trip.timeDeparted %>"/>

//     <label for="caughtFish">Catch Anything?</label>
//     <input type="checkbox" name="caughtFish" id="editCaughtFish" <% if (trip.caughtFish) { %>checked<% } %> />

//     <button type="submit">Update Trip</button>
//   </form>
//   <a href="/trips/">Back to Trips</a>
// </body>

// //app.use(morgan("dev")); 

// //app.post('/save-coordinates', (req, res) => { //LOOK ALL THIS UP
//  //   const { lat, lng } = req.body; // Extract latitude and longitude from request body

//   //  console.log(`Received coordinates: Latitude=${lat}, Longitude=${lng}`);
//     //globalLat = lat;
//  //   globalLng = lng;
//     // Example: Store or process the coordinates as needed
//     // You can save them to a database, file, or use them immediately

//    // res.json({ message: 'Coordinates received successfully!', received: { lat, lng } });
// });


  //// app.get('/get-coordinates', (req, res) => {
    //     if (globalLatitude !== null && globalLongitude !== null) {
    //  //       res.json({ lat: globalLat, lng: globalLng });
    //     } else {
    //    //     res.status(404).json({ error: 'No coordinates available' });
    //     }
   // });

     //   //Update global latitude and longitude FROM CHAT GPT
  //   const clickedLatLng = mapsMouseEvent.latLng.toJSON(); //this moethod returns a copy of the attributes as an object and sets them as a variable so they can be accessed later
  //   globalLat = clickedLatLng.lat;
  //   globalLng = clickedLatLng.lng;

  //   console.log(`Latitude: ${globalLat}, Longitude: ${globalLng}`);

  //   // Send the coordinates to the server LOOK THIS UP
  //   fetch('http://localhost:3000/save-coordinates', {
  //     method: 'POST',
  //     headers: {
  //         'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ lat: globalLat, lng: globalLng }),
  // })
  // .then((response) => response.json())
  // .then((data) => console.log('Server response:', data))
  // .catch((error) => console.error('Error:', error));

  // const {google} = require('googleapis');
// const {authenticate} = require('@google-cloud/local-auth');
// const path = require('path');
// const bodyParser = require('body-parser'); //LOOK THIS UP
// let globalLat = 0;
// let globalLng = 0;
// console.log(`Latitude: ${globalLat}, Longitude: ${globalLng}`);
// app.locals.lat = globalLat;
// app.locals.lng = globalLng;

// //app.use(bodyParser.json()); //LOOK THIS UP