("use strict");

/**
 * todo: Refactor, catch errors
 */

const searchBtn = document.querySelector(".btn-search");
const containerVideos = document.querySelector(".videos");
const radiusInput = document.querySelector(".radius-input");
const orderInput = document.querySelector(".sort-input");
const mapInput = document.getElementById("pac-input");

let loading = "";
let coords = { lat: 0, lng: 0 };
let next = "";
let places = [];
let radius = 5;
let order = "date";
let test = "test";

class App {
  constructor() {
    this.loadEmbedded();
    this.getData = this.getData.bind(this);
    searchBtn.addEventListener("click", () => {
      this.startSearch();
    });
    document.addEventListener("keydown", (e) => {
      console.log(document.activeElement);
      if (e.key === "Enter" && document.activeElement !== mapInput) this.startSearch();
    });
  }

  startSearch() {
    document.querySelector(".container-map").classList.remove("hidden");
    document.querySelector(".container-video").classList.add("hidden");
    if (places.length == 1) {
      order = orderInput.value;
      containerVideos.innerHTML = "";
      next = "";
      this.getData();
    } else alert("Please provide valid data");
  }

  setRadius() {
    if (radiusInput.value > 0 && radiusInput.value < 1000) {
      radius = radiusInput.value;
    }
  }
  getData() {
    this.setRadius();
    fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&location=${coords.lat}%2C${coords.lng}&locationRadius=${radius}km&order=${order}&maxResults=15&type=video&key=AIzaSyBfGV0MUj9ckxJhNRnExMk8zBs1BlY2I9Y&pageToken=${next}`)
      // fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&location=${coords.lat}%2C${coords.lng}&locationRadius=${radius}km&order=${order}&maxResults=6&type=video&key=AIzaSyAEIknK8qz2R6cGiDHyGGPF10VUHgAalNU&`)
      .then((resp) => {
        return resp.json();
      })
      .then((data) => {
        next = data.nextPageToken;
        data.items.forEach((curr) => {
          const html = `<div class="video" id="${curr.id.videoId}">
          <img src="${curr.snippet.thumbnails.default.url}"/>
          <div>${curr.snippet.title}
          <p class="date">Author: ${curr.snippet.channelTitle} <br> Published: ${new Date(curr.snippet.publishedAt).toLocaleDateString(navigator.language, {
            hour: "numeric",
            minute: "numeric",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}</p>
          </div>
          <img src="svg/dropdown.svg" class="enter-icon" />
          </div>
          `;
          this.displayData(html);
          if (document.querySelector(".loading-indicator")) document.querySelector(".loading-indicator").remove();
        });
        containerVideos.insertAdjacentHTML(
          "beforeend",
          `<p class="loading"></p>
        <p class="loading-indicator">Loading...</p>`
        );
        loading = document.querySelector(".loading");
        if (containerVideos.childElementCount >= 3) document.querySelector(".noVideo").classList.add("hidden");
        else document.querySelector(".noVideo").classList.remove("hidden");
        this.loadNextPage();
      });
  }
  displayData(html) {
    containerVideos.innerHTML += "";
    containerVideos.insertAdjacentHTML("beforeend", html);
  }
  loadNextPage() {
    let loaded = false;
    const loadingObserver = new IntersectionObserver(
      () => {
        if (loaded == false) loaded = true;
        else {
          console.log("Load");
          this.getData();
          loading.remove();
          loaded = false;
          loadingObserver.unobserve(loading);
        }
      },
      { root: null, threshold: 0.15 }
    );
    loadingObserver.observe(loading);
  }
  loadEmbedded() {
    containerVideos.addEventListener("click", (e) => {
      const videoLink = e.target.closest(".video").id;
      document.querySelector(".container-map").classList.add("hidden");
      document.querySelector(".container-video").classList.remove("hidden");
      document.querySelector(".player").src = `https://www.youtube-nocookie.com/embed/${videoLink}`;
    });
  }
}
const app = new App();

function initAutocomplete() {
  map = new google.maps.Map(document.getElementById("map"), {
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
        console.log("Returned place contains no geometry");
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
window.initAutocomplete = initAutocomplete;
