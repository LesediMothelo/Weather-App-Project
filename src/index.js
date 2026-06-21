const SHECODES_API_KEY = "fc574fe29888cce2e4c5b0fo603ta3bc";
const SHECODES_BASE_URL = "https://api.shecodes.io/weather/v1/current";

const CITY_FALLBACKS = {
  roodepoort: {
    city: "Roodepoort",
    temperature: { current: 24, humidity: 87 },
    wind: { speed: 7.2 },
    condition: { description: "moderate rain" },
    forecast: [
      { day: "Sunday", icon: "🌧️", temp: 24 },
      { day: "Monday", icon: "🌦️", temp: 22 },
      { day: "Tuesday", icon: "⛅", temp: 23 },
      { day: "Wednesday", icon: "🌧️", temp: 20 },
      { day: "Thursday", icon: "☁️", temp: 21 },
      { day: "Friday", icon: "🌤️", temp: 25 },
      { day: "Saturday", icon: "🌦️", temp: 23 },
    ],
  },
  johannesburg: {
    city: "Johannesburg",
    temperature: { current: 18, humidity: 45 },
    wind: { speed: 13 },
    condition: { description: "clear sky" },
    forecast: [
      { day: "Sunday", icon: "☀️", temp: 18 },
      { day: "Monday", icon: "🌤️", temp: 20 },
      { day: "Tuesday", icon: "⛅", temp: 19 },
      { day: "Wednesday", icon: "☀️", temp: 21 },
      { day: "Thursday", icon: "🌦️", temp: 18 },
      { day: "Friday", icon: "☀️", temp: 22 },
      { day: "Saturday", icon: "⛅", temp: 20 },
    ],
  },
  "cape town": {
    city: "Cape Town",
    temperature: { current: 16, humidity: 64 },
    wind: { speed: 10 },
    condition: { description: "partly cloudy" },
    forecast: [
      { day: "Sunday", icon: "⛅", temp: 16 },
      { day: "Monday", icon: "🌧️", temp: 15 },
      { day: "Tuesday", icon: "🌥️", temp: 17 },
      { day: "Wednesday", icon: "🌦️", temp: 16 },
      { day: "Thursday", icon: "☀️", temp: 18 },
      { day: "Friday", icon: "🌤️", temp: 19 },
      { day: "Saturday", icon: "☁️", temp: 17 },
    ],
  },
};

function getFallbackWeather(city) {
  return CITY_FALLBACKS[city.trim().toLowerCase()] || null;
}

function getForecastForCity(city) {
  let fallback = CITY_FALLBACKS[city.trim().toLowerCase()];
  if (fallback && fallback.forecast) {
    return fallback.forecast;
  }

  return CITY_FALLBACKS.roodepoort.forecast;
}

function displayForecast(forecast) {
  let cards = document.querySelectorAll(".forecast-card");
  cards.forEach((card, index) => {
    let forecastDay = card.querySelector(".forecast-day");
    let forecastIcon = card.querySelector(".forecast-icon");
    let forecastTemp = card.querySelector(".forecast-temp");
    let item = forecast[index] || { day: "N/A", icon: "—", temp: "--" };

    if (forecastDay) {
      forecastDay.textContent = item.day;
    }
    if (forecastIcon) {
      forecastIcon.textContent = item.icon;
    }
    if (forecastTemp) {
      forecastTemp.textContent = `${item.temp}°C`;
    }
  });
}

// Function to format the time correctly (e.g., 09:05)
function formatTime(now) {
  let day = days[now.getDay()];
  let hours = now.getHours();
  if (hours < 10) {
    hours = `0${hours}`; // Add leading zero
  }

  let minutes = now.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`; // Add leading zero
  }

  return `${day} ${hours}:${minutes}`;
}

// Function to display the temperature and other weather data
function displayWeather(response) {
  let data = response.data;
  let cityElement = document.querySelector(".current-city");
  let temperatureElement = document.querySelector("#current-temperature");
  let detailsElement = document.querySelector(".current-details");
  let searchButton = document.querySelector(".search-button");

  if (searchButton) {
    searchButton.textContent = "Search";
  }

  if (cityElement) {
    cityElement.textContent = data.city;
  }
  temperatureElement.textContent = Math.round(data.temperature.current);

  if (detailsElement) {
    detailsElement.innerHTML = `
      <span class="currentDayTime">${formatTime(new Date())}</span>, ${data.condition.description}
      <br />
      Humidity: <strong>${data.temperature.humidity}%</strong>, Wind: <strong>${Math.round(data.wind.speed)} km/h</strong>
    `;
  }

  displayForecast(data.forecast || getForecastForCity(data.city));
}

function searchCity(city) {
  let fallback = getFallbackWeather(city);
  let searchButton = document.querySelector(".search-button");

  if (searchButton) {
    searchButton.textContent = "Loading...";
  }

  if (fallback) {
    displayWeather({ data: fallback });
    if (searchButton) {
      searchButton.textContent = "Search";
    }
    return;
  }

  let query = encodeURIComponent(city);
  let apiUrl = `${SHECODES_BASE_URL}?query=${query}&key=${SHECODES_API_KEY}&units=metric`;

  axios
    .get(apiUrl)
    .then(displayWeather)
    .catch((error) => {
      let message = "City not found. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      alert(message);
      console.error("API Error:", error);
    })
    .finally(() => {
      if (searchButton) {
        searchButton.textContent = "Search";
      }
    });
}

// The main function to handle the form submission
function handleSearch(event) {
  event.preventDefault();
  let searchInputElement = document.querySelector("#search-input");
  let city = searchInputElement.value.trim();
  if (!city) {
    return;
  }

  let cityElement = document.querySelector(".current-city");
  let detailsElement = document.querySelector(".current-details");

  if (cityElement) {
    cityElement.textContent = city;
  }

  if (detailsElement) {
    detailsElement.innerHTML = `
      <span class="currentDayTime">${formatTime(new Date())}</span>, searching...
    `;
  }

  searchCity(city);
}

// --- Main Program Execution ---

// Set up date and time variables
let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function updateClock() {
  let currentTimeElement = document.querySelector(".currentDayTime");
  if (!currentTimeElement) {
    return;
  }
  currentTimeElement.textContent = formatTime(new Date());
}

updateClock();
setInterval(updateClock, 1000);

// Attach the main search function to the form
let weatherForm = document.querySelector("form");
weatherForm.addEventListener("submit", handleSearch);

// Load Roodepoort by default
searchCity("Roodepoort");
