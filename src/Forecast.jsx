import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimatedWeather from "react-animated-weather";
// This safely extracts the component whether Vite wrapped it in an object or not
const ReactAnimatedWeather = AnimatedWeather.default || AnimatedWeather;

function Forecast({ weather }) {
  const { data } = weather;
  const [forecastData, setForecastData] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);

  useEffect(() => {
    const fetchForecastData = async () => {
      if (!data || !data.city) return;

      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${data.city}&appid=${apiKey}&units=metric`;

      try {
        const response = await axios.get(url);
        
        const dailyForecasts = {};

        response.data.list.forEach((reading) => {
          const date = reading.dt_txt.split(" ")[0]; 

          if (!dailyForecasts[date]) {
            // 1. Initialize the day with the first reading we find
            dailyForecasts[date] = {
              time: reading.dt,
              condition: {
                description: reading.weather[0].description,
                icon_url: `https://openweathermap.org/img/wn/${reading.weather[0].icon.replace('n', 'd')}@4x.png`
              },
              temperature: {
                minimum: reading.main.temp_min,
                maximum: reading.main.temp_max
              },
              hasDaytimeData: false // Custom flag to track if we found true daylight
            };
          } else {
            // 2. Continuously check for absolute min and max temperatures across all 24 hours
            if (reading.main.temp_min < dailyForecasts[date].temperature.minimum) {
              dailyForecasts[date].temperature.minimum = reading.main.temp_min;
            }
            if (reading.main.temp_max > dailyForecasts[date].temperature.maximum) {
              dailyForecasts[date].temperature.maximum = reading.main.temp_max;
            }
          }

          // 3. The Magic Fix: Lock in the actual daytime weather condition!
          // If we haven't found a daytime reading yet, and this reading has a 'd' (day)...
          if (!dailyForecasts[date].hasDaytimeData && reading.weather[0].icon.includes('d')) {
            dailyForecasts[date].condition.description = reading.weather[0].description;
            dailyForecasts[date].condition.icon_url = `https://openweathermap.org/img/wn/${reading.weather[0].icon}@4x.png`;
            dailyForecasts[date].hasDaytimeData = true; // Mark as found so we don't overwrite it again
          }
        });

        const mappedForecast = Object.values(dailyForecasts);
        setForecastData(mappedForecast);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    };

    fetchForecastData();
  }, [data.city]);

  const formatDay = (dateString) => {
    const options = { weekday: "short" };
    const date = new Date(dateString * 1000);
    return date.toLocaleDateString("en-US", options);
  };

  const getCurrentDate = () => {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius((prevState) => !prevState);
  };

  const convertToFahrenheit = (temperature) => {
    return Math.round((temperature * 9) / 5 + 32);
  };

  const renderTemperature = (temperature) => {
    return isCelsius
      ? Math.round(temperature)
      : convertToFahrenheit(temperature);
  };

  return (
    <div>
      <div className="city-name">
        <h2>
          {data.city}, <span>{data.country}</span>
        </h2>
      </div>
      <div className="date">
        <span>{getCurrentDate()}</span>
      </div>
      <div className="temp">
        {/* Using your custom sun favicon here instead of the default API image */}
        <img
          src={data.condition.icon_url}
          alt={data.condition.description}
          className="temp-icon"
        />
        {renderTemperature(data.temperature.current)}
        <sup className="temp-deg" onClick={toggleTemperatureUnit}>
          {isCelsius ? "°C" : "°F"} | {isCelsius ? "°F" : "°C"}
        </sup>
      </div>
      <p className="weather-des">{data.condition.description}</p>
      <div className="weather-info">
        <div className="col">
          <div style={{ marginRight: "10px", display: "flex" }}>
            <ReactAnimatedWeather icon="WIND" color="#1e2432" size={35} animate={true} />
          </div>
          <div>
            <p className="wind">{data.wind.speed} m/s</p>
            <p>Wind speed</p>
          </div>
        </div>
        <div className="col">
          <div style={{ marginRight: "10px", display: "flex" }}>
            <ReactAnimatedWeather icon="RAIN" color="#1e2432" size={35} animate={true} />
          </div>
          <div>
            <p className="humidity">{data.temperature.humidity}%</p>
            <p>Humidity</p>
          </div>
        </div>
      </div>
      <div className="forecast">
        <h3>5-Day Forecast:</h3>
        <div className="forecast-container">
          {forecastData &&
            forecastData.slice(0, 5).map((day) => (
              <div className="day" key={day.time}>
                <p className="day-name">{formatDay(day.time)}</p>
                {/* Using your custom sun favicon for the daily breakdown cards too */}
                <img
                  className="day-icon"
                  src={day.condition.icon_url}
                  alt={day.condition.description}
                />
                <p className="day-temperature">
                  {Math.round(day.temperature.minimum)}° /{" "}
                  <span>{Math.round(day.temperature.maximum)}°</span>
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Forecast;