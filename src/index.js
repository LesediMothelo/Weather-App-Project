const SHECODES_API_KEY = "fc574fe29888cce2e4c5b0fo603ta3bc";
const SHECODES_BASE_URL = "https://api.shecodes.io/weather/v1/current";

const CITY_FALLBACKS = {
  roodepoort: {
    city: "Roodepoort",
    temperature: { current: 10, high: 12, low: 8, humidity: 84 },
    wind: { speed: 6 },
    condition: { description: "moderate rain" },
    forecast: [
      { day: "Sunday", icon: "🌧️", high: 10, low: 8 },
      { day: "Monday", icon: "🌤️", high: 12, low: 6 },
      { day: "Tuesday", icon: "⛅", high: 23, low: 14 },
      { day: "Wednesday", icon: "🌧️", high: 20, low: 14 },
      { day: "Thursday", icon: "☁️", high: 21, low: 15 },
      { day: "Friday", icon: "🌤️", high: 25, low: 18 },
      { day: "Saturday", icon: "🌦️", high: 23, low: 16 },
    ],
  },
  johannesburg: {
    city: "Johannesburg",
    temperature: { current: 18, high: 20, low: 14, humidity: 45 },
    wind: { speed: 13 },
    condition: { description: "clear sky" },
    forecast: [
      { day: "Sunday", icon: "☀️", high: 18, low: 14 },
      { day: "Monday", icon: "🌤️", high: 20, low: 15 },
      { day: "Tuesday", icon: "⛅", high: 19, low: 13 },
      { day: "Wednesday", icon: "☀️", high: 21, low: 15 },
      { day: "Thursday", icon: "🌦️", high: 18, low: 12 },
      { day: "Friday", icon: "☀️", high: 22, low: 16 },
      { day: "Saturday", icon: "⛅", high: 20, low: 14 },
    ],
  },
  durban: {
    city: "Durban",
    temperature: { current: 22, high: 25, low: 18, humidity: 78 },
    wind: { speed: 9 },
    condition: { description: "partly cloudy" },
    forecast: [
      { day: "Sunday", icon: "⛅", high: 22, low: 18 },
      { day: "Monday", icon: "☀️", high: 24, low: 19 },
      { day: "Tuesday", icon: "🌤️", high: 23, low: 18 },
      { day: "Wednesday", icon: "🌧️", high: 21, low: 17 },
      { day: "Thursday", icon: "⛅", high: 22, low: 18 },
      { day: "Friday", icon: "☀️", high: 25, low: 20 },
      { day: "Saturday", icon: "🌦️", high: 23, low: 19 },
    ],
  },
  "cape town": {
    city: "Cape Town",
    temperature: { current: 16, high: 18, low: 12, humidity: 64 },
    wind: { speed: 10 },
    condition: { description: "partly cloudy" },
    forecast: [
      { day: "Sunday", icon: "⛅", high: 16, low: 12 },
      { day: "Monday", icon: "🌧️", high: 15, low: 11 },
      { day: "Tuesday", icon: "🌥️", high: 17, low: 13 },
      { day: "Wednesday", icon: "🌦️", high: 16, low: 12 },
      { day: "Thursday", icon: "☀️", high: 18, low: 14 },
      { day: "Friday", icon: "🌤️", high: 19, low: 15 },
      { day: "Saturday", icon: "☁️", high: 17, low: 13 },
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
    let item = forecast[index] || { day: "N/A", icon: "—", high: "--", low: "--" };

    if (forecastDay) {
      forecastDay.textContent = item.day;
    }
    if (forecastIcon) {
      forecastIcon.textContent = item.icon;
    }
    if (forecastTemp) {
      if (item.high !== undefined && item.low !== undefined) {
        forecastTemp.textContent = `${item.high}°C | ${item.low}°C`;
      } else if (item.temp !== undefined) {
        forecastTemp.textContent = `${item.temp}°C`;
      } else {
        forecastTemp.textContent = "--";
      }
    }
  });
}

function getHighTemp(data) {
  return (
    data?.temperature?.high ??
    data?.temperature?.maximum ??
    data?.temperature?.max ??
    data?.temperature?.current
  );
}

function getLowTemp(data) {
  return (
    data?.temperature?.low ??
    data?.temperature?.minimum ??
    data?.temperature?.min ??
    data?.temperature?.current
  );
}

function isNightTime(date) {
  let hour = date.getHours();
  return hour < 6 || hour >= 18;
}

function getCurrentWeatherIcon(description, isNight) {
  let desc = description.toLowerCase();
  if (isNight) {
    if (desc.includes("clear")) return "🌙";
    if (desc.includes("cloud")) return "☁️";
    if (desc.includes("rain")) return "🌧️";
    if (desc.includes("snow")) return "🌨️";
    return "🌙";
  }

  if (desc.includes("clear")) return "☀️";
  if (desc.includes("cloud")) return desc.includes("partly") ? "⛅" : "☁️";
  if (desc.includes("rain")) return "🌧️";
  if (desc.includes("snow")) return "🌨️";
  return "🌤️";
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

  let highTempElement = document.querySelector("#current-high-temp");
  let lowTempElement = document.querySelector("#current-low-temp");
  let highTemp = Math.round(getHighTemp(data));
  let lowTemp = Math.round(getLowTemp(data));

  if (highTempElement) {
    highTempElement.textContent = `${highTemp}°C`;
  }
  if (lowTempElement) {
    lowTempElement.textContent = `${lowTemp}°C`;
  }

  let iconElement = document.querySelector("#current-temperature-icon");
  let night = isNightTime(new Date());
  if (iconElement) {
    iconElement.textContent = getCurrentWeatherIcon(data.condition.description, night);
  }

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
