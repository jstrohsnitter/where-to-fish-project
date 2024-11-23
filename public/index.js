let globalLat = 0;
let globalLng = 0;

async function initMap() {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const myLatlng = {lat: 41.365806156514495, lng: -71.48221425841729 };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 13,
      center: myLatlng,
    });
    // Create the initial InfoWindow.
    let infoWindow = new google.maps.InfoWindow({
      content: "Click the map to get Lat/Lng!",
      position: myLatlng,
    });
  
    infoWindow.open(map);
    // Configure the click listener.
    map.addListener("click", (mapsMouseEvent) => {
      // Close the current InfoWindow.
      infoWindow.close();

    //Update global latitude and longitude FROM CHAT GPT
    const clickedLatLng = mapsMouseEvent.latLng.toJSON(); //this moethod returns a copy of the attributes as an object and sets them as a variable so they can be accessed later
    globalLat = clickedLatLng.lat;
    globalLng = clickedLatLng.lng;

    console.log(`Latitude: ${globalLat}, Longitude: ${globalLng}`);

    // Send the coordinates to the server LOOK THIS UP
    fetch('http://localhost:3000/save-coordinates', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat: globalLat, lng: globalLng }),
  })
  .then((response) => response.json())
  .then((data) => console.log('Server response:', data))
  .catch((error) => console.error('Error:', error));
      // Create a new InfoWindow.
      infoWindow = new google.maps.InfoWindow({
        position: mapsMouseEvent.latLng,
      });
      infoWindow.setContent(
        JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2),
      );
      infoWindow.open(map);
      console.log(mapsMouseEvent.latLng);
    });
  }
 
  initMap();
