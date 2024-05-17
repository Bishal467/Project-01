const apiKey = "0db95e9190d12bd871cb3af7f15bd765";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const defaultCity = "Rajshahi";
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const locationBtn = document.getElementById("locationBtn");
const weatherIcon = document.querySelector(".weather-icon");
const errorContainer = document.querySelector(".error");
const suggestionsContainer = document.querySelector(".suggestions");
const forecastContainer = document.querySelector(".forecast");

searchBox.addEventListener("input", () => {
  const inputValue = searchBox.value.trim().toLowerCase();
  const filteredCities = cityList.filter(city => {
    return city.toLowerCase().startsWith(inputValue) && city.toLowerCase() !== inputValue;
  });
  displaySuggestions(filteredCities);
});

function displaySuggestions(suggestions) {
  suggestionsContainer.innerHTML = "";

  suggestions.forEach(suggestion => {
    const suggestionElement = document.createElement("div");
    suggestionElement.textContent = suggestion;
    suggestionElement.classList.add("suggestion");
    suggestionElement.addEventListener("click", () => {
      searchBox.value = suggestion;
      suggestionsContainer.innerHTML = "";
      searchWeather();
    });
    suggestionsContainer.appendChild(suggestionElement);
  });
}

async function checkWeather(city) {
  try {
    const response = await fetch(`${apiUrl}${city}&appid=${apiKey}`);
    const data = await response.json();

    if (response.ok) {
      updateWeatherInfo(data);
      errorContainer.style.display = "none";
      fetchForecast(city);
    } else {
      handleApiError(data.message);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    handleApiError("Failed to fetch weather data. Please try again.");
  }
}

function handleApiError(errorMessage) {
  errorContainer.innerHTML = `<p>${errorMessage}</p>`;
  errorContainer.style.display = "block";
}

function updateWeatherInfo(data) {
  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
  document.querySelector(".feels_like").innerHTML = Math.round(data.main.feels_like) + "°C";
  document.querySelector(".max_temp").innerHTML = Math.round(data.main.temp_max) + "°C";
  document.querySelector(".min_temp").innerHTML = Math.round(data.main.temp_min) + "°C";

  const temperatureCelsius = Math.round(data.main.temp);
  const humidity = data.main.humidity;

  const pressurehPa = data.main.pressure;
  const pressureAtm = pressurehPa * 0.000986923;
  document.querySelector(".pressure").innerHTML =pressureAtm.toFixed(4) + " atm";

  const sunriseTimestamp = data.sys.sunrise * 1000;
  const sunsetTimestamp = data.sys.sunset * 1000;

  const sunriseTime = new Date(sunriseTimestamp);
  const sunsetTime = new Date(sunsetTimestamp);
  const formattedSunrise = sunriseTime.toLocaleTimeString();
  const formattedSunset = sunsetTime.toLocaleTimeString();
  document.querySelector(".sunrise").innerHTML = formattedSunrise;
  document.querySelector(".sunset").innerHTML = formattedSunset;

  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

  if (temperatureCelsius < 0) {
    weatherIcon.src = "images/snow.png";
  } else if (temperatureCelsius >= 30 && humidity > 70) {
    weatherIcon.src = "images/rain.png";
  } else if (temperatureCelsius >= 30 && humidity <= 70) {
    weatherIcon.src = "images/clear.png";
  } else if (temperatureCelsius >= 20 && temperatureCelsius < 30 && humidity > 70) {
    weatherIcon.src = "images/rain.png"; 
  } else if (temperatureCelsius >= 20 && temperatureCelsius < 30 && humidity <= 70) {
    weatherIcon.src = "images/clouds.png";
  } else if (temperatureCelsius >= 10 && temperatureCelsius < 20) {
    weatherIcon.src = "images/drizzle.png";
  } else if (temperatureCelsius >= 0 && temperatureCelsius < 10) {
    weatherIcon.src = "images/mist.png";
  } else {
    weatherIcon.src = "images/default.png";
  }
}

async function fetchForecast(city) {
  const apiUrlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrlForecast);
    const data = await response.json();

    if (response.ok) {
      renderForecast(data);
      errorContainer.style.display = "none";
    } else {
      handleApiError(data.message);
    }
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    handleApiError("Failed to fetch forecast data. Please try again.");
  }
}

function renderForecast(data) {
  forecastContainer.innerHTML = "";

  let currentDate = null;

  data.list.forEach(forecast => {
    const date = new Date(forecast.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });

    if (day !== currentDate) {
      currentDate = day;

      const temp = Math.round(forecast.main.temp);
      const humidity = forecast.main.humidity;
      const windSpeed = forecast.wind.speed;
      const weatherIcon = forecast.weather[0].icon;

      const forecastCard = document.createElement("div");
      forecastCard.classList.add("forecast-card");
      forecastCard.innerHTML = `
        <p>${day}</p>
        <img src="http://openweathermap.org/img/wn/${weatherIcon}.png" alt="${forecast.weather[0].description}">
        <p>Temperature: ${temp}°C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} km/h</p>
      `;
      forecastContainer.appendChild(forecastCard);
    }
  });
}

fetchForecast(defaultCity);

function updateWeatherInfoForDefaultCity() {
  checkWeather(defaultCity);
}

function searchWeather() {
  checkWeather(searchBox.value);
}

searchBtn.addEventListener("click", (event) => {
  event.preventDefault();
  searchWeather();
});

locationBtn.addEventListener("click", () => {
  getLocation();
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log("Latitude:", latitude, "Longitude:", longitude);

        checkWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Can't found the city.Please re enter."
        );
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    alert(
      "Geolocation is not supported. Please re-enter a city."
    );
  }
}

async function checkWeatherByCoordinates(latitude, longitude) {
  const apiUrlByCoordinates = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrlByCoordinates);
    const data = await response.json();

    if (response.ok) {
      updateWeatherInfo(data);
      errorContainer.style.display = "none";
      fetchForecast(data.name);
    } else {
      handleApiError(data.message);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    handleApiError("Failed to fetch weather data. Please try again.");
  }
}
checkWeather(defaultCity);
