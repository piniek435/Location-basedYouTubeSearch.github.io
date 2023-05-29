import initAutocomplete from "./maps.js";
import { places, coords } from "./maps.js";
/**
 * todo: Refactor, catch errors
 */

const searchBtn = document.querySelector(".btn-search");
const containerVideos = document.querySelector(".videos");
const radiusInput = document.querySelector(".radius-input");
const orderInput = document.querySelector(".sort-input");
const mapInput = document.getElementById("pac-input");

let loading = "";
let next = "";
let order = "date";
export let radius = 5;

class App {
  constructor() {
    this.loadEmbedded();
    this.getData = this.getData.bind(this);
    searchBtn.addEventListener("click", () => {
      this.startSearch();
    });
    document.addEventListener("keydown", (e) => {
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
    if (radiusInput.value > 0 && radiusInput.value < 1000) radius = radiusInput.value;
  }
  async getData() {
    try {
      this.setRadius();
      const response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&location=${coords.lat}%2C${coords.lng}&locationRadius=${radius}km&order=${order}&maxResults=15&type=video&key=AIzaSyBfGV0MUj9ckxJhNRnExMk8zBs1BlY2I9Y&pageToken=${next}`);
      const data = await response.json();
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
        </div>`;

        this.displayData(html);
        if (document.querySelector(".loading-indicator")) document.querySelector(".loading-indicator").remove();
      });

      containerVideos.insertAdjacentHTML(
        "beforeend",
        `<p class="loading"></p>
        <p class="loading-indicator">Loading...</p>`
      );

      loading = document.querySelector(".loading");

      if (containerVideos.childElementCount >= 3) {
        document.querySelector(".noVideo").classList.add("hidden");
      } else {
        document.querySelector(".noVideo").classList.remove("hidden");
      }

      this.loadNextPage();
    } catch (err) {
      console.error(err);
      alert("Error occurred while fetching data! Please try again later.");
    }
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
export default app;
window.initAutocomplete = initAutocomplete;
