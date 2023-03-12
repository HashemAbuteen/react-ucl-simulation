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
    if (isTeamInStorage(defaultHome)) {
      setHomeTeam(getTeamFromStorage(defaultHome));
    } else {
      getTeamDataOnly(defaultHome);
      setTimeout(() => {
        if (isTeamInStorageWithoutStats(defaultHome)) {
          setHomeTeam(getTeamFromStorage(defaultHome));
        } else {
          setError("An error occured while loading the home team data");
        }
      }, 1500);
    }
    const defaultAway = 541;
    if (isTeamInStorage(defaultAway)) {
      setAwayTeam(getTeamFromStorage(defaultAway));
    } else {
      getTeamDataOnly(defaultAway);
      setTimeout(() => {
        if (isTeamInStorageWithoutStats(defaultAway)) {
          setAwayTeam(getTeamFromStorage(defaultAway));
        } else {
          setError("An error occured while loading the away team data");
        }
      }, 1500);
    }
  }, []);

  if (!homeTeam || !awayTeam) {
    return (
      <div className="single-match-settings">
        <div className="match-container">
          <div className="loading-div">Loading</div>
        </div>
      </div>
    );
  }
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
