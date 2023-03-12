import Search from "./Search";
import "../style/SingleMatchSettings.css";
import { useEffect, useState } from "react";
import { getTeamInfo } from "./DataManager";
import useStorage from "../customhooks/useStorage";
import {
  getTeamDataOnly,
  getTeamFromStorage,
  isTeamInStorage,
  isTeamInStorageWithoutStats,
} from "./getDefaultTeams";

function SingleMatchSettings({ setPage }) {
  const [homeTeam, setHomeTeam] = useState();
  const [awayTeam, setAwayTeam] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    const defaultHome = 529;
    console.log(`Fetching home team data for ID ${defaultHome}...`);
    if (isTeamInStorage(defaultHome)) {
      console.log(`Home team data found in storage for ID ${defaultHome}`);
      setHomeTeam(getTeamFromStorage(defaultHome));
    } else {
      console.log(
        `Home team data not found in storage for ID ${defaultHome}. Fetching from API...`
      );
      getTeamDataOnly(defaultHome);
      setTimeout(() => {
        if (isTeamInStorageWithoutStats(defaultHome)) {
          console.log(
            `Home team data fetched successfully for ID ${defaultHome}`
          );
          setHomeTeam(getTeamFromStorage(defaultHome));
        } else {
          console.error(
            `An error occurred while loading the home team data for ID ${defaultHome}`
          );
          setError("An error occurred while loading the home team data");
        }
      }, 3000);
    }

    const defaultAway = 541;
    console.log(`Fetching away team data for ID ${defaultAway}...`);
    if (isTeamInStorage(defaultAway)) {
      console.log(`Away team data found in storage for ID ${defaultAway}`);
      setAwayTeam(getTeamFromStorage(defaultAway));
    } else {
      console.log(
        `Away team data not found in storage for ID ${defaultAway}. Fetching from API...`
      );
      getTeamDataOnly(defaultAway);
      setTimeout(() => {
        if (isTeamInStorageWithoutStats(defaultAway)) {
          console.log(
            `Away team data fetched successfully for ID ${defaultAway}`
          );
          setAwayTeam(getTeamFromStorage(defaultAway));
        } else {
          console.error(
            `An error occurred while loading the away team data for ID ${defaultAway}`
          );
          setError("An error occurred while loading the away team data");
        }
      }, 3000);
    }
  }, []);

  if (!homeTeam || !awayTeam) {
    console.log(homeTeam, awayTeam);
    console.log("One or both teams are still loading...");
    return (
      <div className="single-match-settings">
        <div className="match-container">
          <div className="loading-div">Loading</div>
        </div>
      </div>
    );
  }

  console.log(
    `Both teams loaded successfully: ${homeTeam.name} vs ${awayTeam.name}`
  );
  return (
    <div className="single-match-settings">
      <div className="single-match-teams">
        <div className="home">
          {homeTeam ? (
            <div>
              <img src={homeTeam.logo} alt="home-team-logo" />
              <h2>{homeTeam.name}</h2>
            </div>
          ) : (
            <></>
          )}
          <Search setTeam={setHomeTeam} />
        </div>
        <div className="away">
          {awayTeam ? (
            <div>
              <img src={awayTeam.logo} alt="away-team-logo" />
              <h2>{awayTeam.name}</h2>
            </div>
          ) : (
            <></>
          )}
          <Search setTeam={setAwayTeam} />
        </div>
      </div>
      <div className="single-match-setting-buttons">
        <button onClick={() => setPage("")}>back</button>
        <button onClick={() => setPage(`match-${homeTeam.id}-${awayTeam.id}`)}>
          start
        </button>
      </div>
    </div>
  );
}

export default SingleMatchSettings;
