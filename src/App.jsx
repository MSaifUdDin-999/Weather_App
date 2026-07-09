import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchEngine from "./SearchEngine";
import Forecast from "./Forecast";

import "./styles.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState({
    loading: true,
    data: {},
    error: false,
  });

  const search = async (event) => {
    event.preventDefault();
    if (event.type === "click" || (event.type === "keypress" && event.key === "Enter")) {
      setWeather({ ...weather, loading: true });
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`;

      try {
        const res = await axios.get(url);

        const mappedData = {
          city: res.data.name,
          country: res.data.sys.country,
          temperature: { current: res.data.main.temp, humidity: res.data.main.humidity },
          condition: {
            description: res.data.weather[0].description,
            // Change '@2x.png' to '@4x.png' for sharp rendering
            icon_url: `https://openweathermap.org/img/wn/${res.data.weather[0].icon}@4x.png`
          },
          wind: { speed: res.data.wind.speed }
        };
        setWeather({ data: mappedData, loading: false, error: false });

      } catch (error) {
        setWeather({ ...weather, data: {}, error: true });
        console.error("Error fetching weather data:", error);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=Lahore&appid=${apiKey}&units=metric`;

      try {
        const response = await axios.get(url);

        const mappedData = {
          city: response.data.name,
          country: response.data.sys.country,
          temperature: { current: response.data.main.temp, humidity: response.data.main.humidity },
          condition: {
            description: response.data.weather[0].description,
            icon_url: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@4x.png`
          },
          wind: { speed: response.data.wind.speed }
        };
        setWeather({ data: mappedData, loading: false, error: false });

      } catch (error) {
        setWeather({ data: {}, loading: false, error: true });
        console.error("Error fetching initial weather data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <SearchEngine query={query} setQuery={setQuery} search={search} />

      {weather.loading && (
        <>
          <br />
          <br />
          <h4>Searching...</h4>
        </>
      )}

      {weather.error && (
        <>
          <br />
          <br />
          <span className="error-message">
            <span style={{ fontFamily: "font" }}>
              Sorry, city not found. Please try again.
            </span>
          </span>
        </>
      )}

      {weather && weather.data && weather.data.condition && (
        <Forecast weather={weather} />
      )}
    </div>
  );
}

export default App;