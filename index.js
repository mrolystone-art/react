// Import dependencies
const express = require("express");
const morgan = require("morgan");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware
app.use(morgan("dev")); // logs requests

// API key & base URLs (OpenWeatherMap free API)
const API_KEY = "fbc86c03bcd3b4aa44d72af0c5bdd2d5"; // get free from openweathermap.org
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Route: Home
app.get("/", (req, res) => {
  res.send("🌤️ Welcome to Tiny Weather API Server");
});

// Route: Get weather for a city
app.get("/weather/:city", async (req, res) => {
  const city = req.params.city;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });
    const data = response.data;
    res.json({
      city: data.name,
      temperature: `${data.main.temp} °C`,
      condition: data.weather[0].description,
    });
  } catch (error) {
    res.status(404).json({ error: "City not found or API error" });
  }
});

// Route: Get forecast for a city
app.get("/forecast/:city", async (req, res) => {
  const city = req.params.city;
  try {
    const response = await axios.get(FORECAST_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });
    const data = response.data;
    // Get the first forecast entry for each day (5 days)
    const seenDates = new Set();
    const forecast = [];
    for (const item of data.list) {
      const dateOnly = item.dt_txt.split(' ')[0];
      if (!seenDates.has(dateOnly)) {
        seenDates.add(dateOnly);
        forecast.push({
          date: item.dt_txt,
          temperature: `${item.main.temp} °C`,
          condition: item.weather[0].description
        });
      }
      if (forecast.length === 5) break;
    }
    res.json({
      city: data.city.name,
      forecast
    });
  } catch (error) {
    res.status(404).json({ error: "City not found or API error" });
  }
});



// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
