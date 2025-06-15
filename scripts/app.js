
const form = document.getElementById("city-form");
const input = document.getElementById("city-input");
const currentBlock = document.getElementById("current-weather");
const forecastBlock = document.getElementById("forecast");
const bgOverlay = document.getElementById("background-overlay");
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

const WEATHER_API_KEY = "eff5142b426699f64d77f3731d66bd17";
const UNSPLASH_API_KEY = "Pa-EEIoiuqUbvjsTKtpQe9xQaDgtrpNUB0AipCO1mXY";

document.addEventListener("DOMContentLoaded", () => {

  const saved = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", saved);

  themeToggle.textContent = saved === "dark" ? "☀️" : "🌙";
});

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";

  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);

  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = input.value.trim();
  if (!city) return;

  currentBlock.innerHTML = "";
  forecastBlock.innerHTML = "";
  bgOverlay.style.backgroundImage = "";

  currentBlock.textContent = "Loading…";

  try {

    const weather = await fetchCurrentWeather(city);
    renderCurrentWeather(weather);

    const forecast = await fetchForecast(city);
    renderForecast(forecast);

    const imageUrl = await fetchImage(city);
    bgOverlay.style.backgroundImage = `url(${imageUrl})`;
  } catch (err) {
    currentBlock.textContent = "Error: " + err.message;
  }
});

async function fetchCurrentWeather(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`
  );
  if (!res.ok) throw new Error("City not found");
  return res.json();
}

async function fetchForecast(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&cnt=40&appid=${WEATHER_API_KEY}`
  );
  if (!res.ok) throw new Error("Forecast error");
  const data = await res.json();
  const days = data.list.filter((_, i) => i % 8 === 0).slice(0, 5);
  return days;
}

async function fetchImage(city) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(city)}&orientation=landscape&per_page=1`,
    {
      headers: { Authorization: `Client-ID ${UNSPLASH_API_KEY}` },
    }
  );
  if (!res.ok) throw new Error("Image not found");
  const data = await res.json();
  return data.results[0]?.urls.regular;
}

function renderCurrentWeather(data) {
  currentBlock.innerHTML = `
    <div class="weather-card">
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
           alt="${data.weather[0].description}" />
      <div>
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>${Math.round(data.main.temp)}°C, ${data.weather[0].description}</p>
        <p>Влажность: ${data.main.humidity}%</p>
      </div>
    </div>
  `;
}

function renderForecast(days) {
  forecastBlock.innerHTML = days
    .map((d) => {
      const date = new Date(d.dt * 1000);
      const day = date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "numeric" });
      return `
      <div class="card">
        <h3>${day}</h3>
        <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png" alt="" />
        <p>${Math.round(d.main.temp)}°C</p>
      </div>
      `;
    })
    .join("");
}
