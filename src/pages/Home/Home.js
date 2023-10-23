import React from "react";
import { useState, useEffect } from "react";
import Error from "../../components/Error/Error";
import SongCard from "../../components/SongCard/SongCard";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { fetchConfig } from "../../utils/fetchConfig";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // Track checkbox state

  const [weatherData, setWeatherData] = useState(null);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [accessToken, setAccessToken] = useState(null);
  const [songs, setSongs] = useState([]);

  const [trackStatus, setTrackStatus] = useState("Search for Tracks!");

  const weatherToGenreMapping = {
    Thunderstorm: "heavy-metal",
    Drizzle: "jazz",
    Rain: "blues",
    Snow: "classical",
    Mist: "ambient",
    Smoke: "electronic",
    Haze: "chill",
    Dust: "folk",
    Fog: "new-age",
    Sand: "world-music",
    Ash: "industrial",
    Squall: "punk",
    Tornado: "metalcore",
    Clear: "acoustic",
    Clouds: "alternative",
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
  };

  const handleCheckboxClick = async () => {
    setIsChecked(!isChecked);
    if (isChecked) {
      setWeatherData("");
    } else {
      await getLocation();
    }
  };

  const setCoordinates = async () => {
    try {
      const backendURL = await fetchConfig();
      const weatherIpResponse = await fetch(`${backendURL}/weather/ip/`);
      const ipData = await weatherIpResponse.json();
      const ipAddress = ipData.ip;
      const weatherCoordinatesResponse = await fetch(
        `${backendURL}/weather/coordinates?ip=${ipAddress}`
      );
      const coordinatesData = await weatherCoordinatesResponse.json();

      setLatitude(coordinatesData.lat);
      setLongitude(coordinatesData.lon);
    } catch (error) {
      console.error(error);
      setError(error);
    }
  };

  useEffect(() => {
    setCoordinates();
  }, []);

  const getLocation = async () => {
    try {
      setLoading(true);
      const backendURL = await fetchConfig();
      const response = await fetch(
        `${backendURL}/weather/conditions?lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setWeatherData(data[0].main);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpotifyToken = async () => {
    const backendURL = await fetchConfig();
    setLoading(true);
    try {
      const response = await fetch(`${backendURL}/spotify/token`);
      const data = await response.json();
      setAccessToken(data);
      return data;
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistID = async (accessTokenResult) => {
    const backendURL = await fetchConfig();
    try {
      const response = await fetch(
        `${backendURL}/spotify/artist?artistName=${searchInput}&accessToken=${accessTokenResult}`
      );
      if (response.status === 500) {
        setError("Invalid Artist Name");
        return;
      }
      const data = await response.json();
      return data.artistID;
    } catch (error) {
      console.error(error);
      setError(error);
      setSongs(null);
    }
  };

  const fetchRecommendations = async (artistID, accessTokenResult) => {
    const backendURL = await fetchConfig();
    const response = await fetch(
      `${backendURL}/spotify/recommendations?artistID=${artistID}&accessToken=${accessTokenResult}`
    );
    const data = await response.json();
    return data.tracks;
  };

  const fetchWeatherRecommendations = async (
    artistID,
    genre,
    accessTokenResult
  ) => {
    const backendURL = await fetchConfig();
    const response = await fetch(
      `${backendURL}/spotify/weatherRecommendations?artistID=${artistID}&genre?=${genre}&accessToken=${accessTokenResult}`
    );
    const data = await response.json();
    return data.tracks;
  };

  const getSongRecommendations = async (accessTokenResult) => {
    setLoading(true);
    try {
      const artistID = await fetchArtistID(accessTokenResult);
      if (!artistID) {
        return; // Exit early if there's no artist ID
      }
      let recommendations = null;
      if (weatherData) {
        const weatherGenre = getGenreForWeather(weatherData);
        recommendations = await fetchWeatherRecommendations(
          artistID,
          weatherGenre,
          accessTokenResult
        );
      } else {
        recommendations = await fetchRecommendations(
          artistID,
          accessTokenResult
        );
      }
      setSongs(recommendations);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getGenreForWeather = (weatherCondition) => {
    const genre = weatherToGenreMapping[weatherCondition];
    return genre || "Unknown";
  };

  const onSearchClick = async () => {
    if (searchInput) {
      const accessTokenResult = await fetchSpotifyToken();
      if (!accessTokenResult) {
        console.error("Error retrieving access Token.");
      }
      const songResults = await getSongRecommendations(accessTokenResult);
      if (!songResults) {
        setTrackStatus("No Tracks Found");
      } else {
        setTrackStatus("");
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      onSearchClick();
    }
  };

  if (error) {
    return (
      <Error
        name="Network"
        type="500"
        description="Error occurred retrieving data. Please try again later."
      ></Error>
    );
  }

  return (
    <div
      style={{
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        paddingTop: "1rem",
      }}
    >
      <h2>Moodify</h2>
      <h4>Discover new music based on your mood</h4>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          id="search"
          placeholder="Enter your favourite artist!"
          className="form-control"
          onChange={handleSearchChange}
          onKeyUp={handleKeyPress}
          style={{
            width: "50vw",
            height: "3vw",
            textAlign: "center",
            marginTop: "1rem",
          }}
        ></input>
      </div>
      <div style={{ justifyContent: "left", cursor: "pointer" }}>
        <div onClick={toggleAdvancedOptions}>
          <span style={{ marginRight: "0.5rem" }}>Advanced</span>
          <span
            style={{
              fontSize: "0.8em", // Adjust the font size for the smaller triangle
              verticalAlign: "middle", // Center the triangle vertically
            }}
          >
            {showAdvancedOptions ? "▲" : "▼"}{" "}
            {/* Smaller triangle arrow icon */}
          </span>
        </div>
        {showAdvancedOptions && (
          <div>
            <input
              type="checkbox"
              id="advancedCheckbox"
              onClick={() => handleCheckboxClick()}
            />
            <label htmlFor="advancedCheckbox" style={{ paddingLeft: "0.5rem" }}>
              Use your weather for song recommendations
            </label>
            <br></br>

            {weatherData ? (
              <label>Your weather condition is '{weatherData}'</label>
            ) : (
              <></>
            )}
          </div>
        )}
        <div>{loading ? <LoadingSpinner></LoadingSpinner> : <div></div>}</div>
        {songs ? (
          <div>
            <SongCard data={songs}></SongCard>
          </div>
        ) : (
          <div>{trackStatus}</div>
        )}
      </div>
    </div>
  );
}
