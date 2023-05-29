import app from "./script.js";
import { radius } from "./script.js";

const mapInput = document.getElementById("pac-input");
const searchBtn = document.querySelector(".btn-search");
export let places = [];
export let coords = "";

export default function initAutocomplete() {
  const map = new google.maps.Map(document.getElementById("map"), {
    mapId: "3a331c8e77351734",
    center: { lat: 51.849, lng: 17.758 },
    zoom: 4,
    // styles:
  });

  const searchBox = new google.maps.places.SearchBox(mapInput);

  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });
  let markers = [];

  searchBox.addListener("places_changed", () => {
    places = searchBox.getPlaces();
    document.querySelector(".container-map").classList.remove("hidden");
    document.querySelector(".container-video").classList.add("hidden");
    mapInput.blur();
    if (places.length == 0) {
      return;
    }

    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      coords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      if (!place.geometry || !place.geometry.location) {
        alert("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        })
      );
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
    app.startSearch();

    let cityCircle;
    searchBtn.addEventListener("click", () => {
      if (cityCircle && cityCircle.setMap) cityCircle.setMap(null);
      const cityMap = {
        center: { lat: coords.lat, lng: coords.lng },
      };
      cityCircle = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.05,
        map,
        center: cityMap.center,
        radius: radius * 1000,
      });
    });
  });
}
