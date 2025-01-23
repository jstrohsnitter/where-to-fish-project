const dotenv = require('dotenv');; //require package
dotenv.config(); //loads the evnironment variables from .env file

const scriptElement = document.getElementById('google-script')
scriptElement.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_KEY}&callback=initMap`)
