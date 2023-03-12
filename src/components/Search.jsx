import React, { useState, useRef, useEffect } from "react";
import useDebounce from "../customhooks/useDebounce";
import "../style/Search.css";
import { addTeamToStorage } from "./DataManager";
import { isTeamInStorage, storeTeamToLocalStorage } from "./getDefaultTeams";

const football_api_key = "a95663ef232e53f38d2462acc02e5ec1";

function Search({ setTeam }) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const [showOptions, setShowOptions] = useState(false);
  const [teams, setTeams] = useState([]);
  const optionsListRef = useRef(null);

  const handleTeamSelect = (team) => {
    setTeam(team);
    setShowOptions(false);
    if (!isTeamInStorage(team.id)) {
      storeTeamToLocalStorage(team);
    }
    setSearchTerm("");
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setShowOptions(true);
  };

  const handleOptionListClick = (event) => {
    if (
      optionsListRef.current &&
      !optionsListRef.current.contains(event.target)
    ) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchTerm.length >= 3) {
      fetch(
        "https://v3.football.api-sports.io/teams/?search=" +
          debouncedSearchTerm,

        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": football_api_key,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          const teams = data.response.slice(0, 10);
          setTeams(teams);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="select-menu-container">
      <div className="select-menu" onClick={() => setShowOptions(!showOptions)}>
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
      </div>
      {showOptions && (
        <ul
          ref={optionsListRef}
          className="options-list"
          onClick={handleOptionListClick}
        >
          {teams.map((team) => (
            <li key={team.team.id} onClick={() => handleTeamSelect(team.team)}>
              <img
                src={team.team.logo}
                width="20px"
                height="20px"
                alt={team.team.name + "badge"}
              />
              {team.team.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Search;
