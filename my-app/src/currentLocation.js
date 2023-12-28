import React, { Component } from "react";
import ReactAnimatedWeather from "react-animated-weather";
import apiKeys from "./apiKeys";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import Clock from "react-live-clock";

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};


const dateBuilder = (d) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

class Weather extends Component {
  state = {
    lat: undefined,
    lon: undefined,
    temperatureC: undefined,
    temperatureF: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: "CLEAR_DAY",
    errorMsg: undefined,
  };

  componentDidMount() {
    if (navigator.geolocation) {
      this.getPosition()
        .then((position) => {
          this.getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch((err) => {
          this.getWeather(28.67, 77.22); // Default to a location (e.g., Delhi) if geolocation is denied
          alert(
            "You have disabled location service. Allow 'This APP' to access your location. Your current location will be used for calculating Real-time weather."
          );
        });
    } else {
      alert("Geolocation not available");
    }

    this.timerID = setInterval(
      () => this.getWeather(this.state.lat, this.state.lon),
      600000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  getPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  getWeather = async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );

      if (!api_call.ok) {
        throw new Error(`Failed to fetch weather data. Status: ${api_call.status}`);
      }

      const data = await api_call.json();

      if (data.main && data.main.temp !== undefined) {
        this.setState({
          lat: lat,
          lon: lon,
          city: data.name,
          temperatureC: Math.round(data.main.temp),
          temperatureF: Math.round(data.main.temp * 1.8 + 32),
          humidity: data.main.humidity,
          description: data.weather[0].description,
          country: data.sys.country,
        });

        this.setWeatherIcon(data.weather[0].main);
      } else {
        throw new Error("Temperature data not available in the API response.");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error.message);
      this.setState({ errorMsg: "Error fetching weather data" });
    }
  };

  setWeatherIcon = (weatherMain) => {
    switch (weatherMain) {
      case "Haze":
        this.setState({ icon: "CLEAR_DAY" });
        break;
      case "Clouds":
        this.setState({ icon: "CLOUDY" });
        break;
      case "Rain":
        this.setState({ icon: "RAIN" });
        break;
      case "Snow":
        this.setState({ icon: "SNOW" });
        break;
      case "Dust":
        this.setState({ icon: "WIND" });
        break;
      case "Drizzle":
        this.setState({ icon: "SLEET" });
        break;
      case "Fog":
      case "Smoke":
        this.setState({ icon: "FOG" });
        break;
      case "Tornado":
        this.setState({ icon: "WIND" });
        break;
      default:
        this.setState({ icon: "CLEAR_DAY" });
    }
  };
  

  render() {
    if (this.state.temperatureC !== undefined) {
      return (
        <>
          <div className="city text-center">
            <div className="title">
              <h2 className="text-black">{this.state.city}</h2>
              <h3 className="text-black">{this.state.country}</h3>
            </div>
            <div className="mb-icon">
              {" "}
              <ReactAnimatedWeather
                icon={this.state.icon}
                color={defaults.color}
                size={defaults.size}
                animate={defaults.animate}
              />
              <p>{this.state.main}</p>
            </div>
            <div className="date-time">
              <div className="dmy">
                <div id="txt"></div>
                <div className="current-time">
                  <Clock format="HH:mm" interval={1000} ticking={true} />
                </div>
                <div className="current-date">{dateBuilder(new Date())}</div>
              </div>
              <div className="temperature ms-5 ps-5">
                <p>
                  {this.state.temperatureC}°<span>C</span>
                </p>
              </div>
            </div>
          </div>
          <Forcast icon={this.state.icon} weather={this.state.description} />
        </>
      );
    } else {
      return (
        <>
          <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} alt="Loading" />
          <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
            Detecting your location
          </h3>
          <h3 style={{ color: "white", marginTop: "10px" }}>
            Your current location wil be displayed on the App <br></br> & used
            for calculating Real time weather.
          </h3>
        </>
      );
    }
  }
}

export default Weather;