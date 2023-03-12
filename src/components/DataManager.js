const football_api_key = "a95663ef232e53f38d2462acc02e5ec1";

let players;
let teams;

function getPlayersFromStorage() {
  if (players) return;
  else {
    players = JSON.parse(localStorage.getItem("players")) || {};
  }
}

function storePlayersToStorage() {
  localStorage.setItem("players", JSON.stringify(players));
}
function getTeamssFromStorage() {
  if (teams) return;
  else {
    teams = JSON.parse(localStorage.getItem("teams")) || {};
  }
}

function storeTeamsToStorage() {
  localStorage.setItem("teams", JSON.stringify(teams));
}

async function getTeamInfo(teamId) {
  getTeamssFromStorage();
  const storedTeamInfo = teams[teamId];

  // Check if the team info is already stored in local storage
  if (storedTeamInfo && storedTeamInfo.players) {
    getTeamLeague(teamId);
    return Promise.resolve(storedTeamInfo);
  } else {
    // If not, make an API call to retrieve the team and player info
    return fetch(
      "https://v3.football.api-sports.io/players/squads?team=" + teamId,
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
        // Update the teams object in local storage with the new team and player info
        const updatedTeamInfo = {
          team: data.response[0].team,
          players: data.response[0].players,
        };
        teams = { ...teams, [teamId]: updatedTeamInfo };
        storeTeamsToStorage();
        getTeamLeague(teamId);
        return updatedTeamInfo;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

function addTeamToStorage(team) {
  console.log("added to storage", team);
  getTeamssFromStorage();
  teams[team.team.id] = team;
  storeTeamsToStorage();
}
function getTeamLeague(teamId) {
  if (teams[teamId].team.league) return Promise.resolve();
  else {
    return fetch(
      "https://v3.football.api-sports.io/leagues?team=" +
        teams[teamId].team.id +
        "&season=2021&type=league",
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
        teams[teamId].team.league = data.response[0].league;
        storeTeamsToStorage();
      });
  }
}
async function getTeamStats(teamId) {
  console.log("getting stats for ", teamId);
  getTeamssFromStorage();
  await getTeamLeague(teamId);
  const team = teams[teamId];
  // Check if the team info is already stored in local storage
  if (team && team.team && team.team.stats) {
    return Promise.resolve(team);
  } else {
    // If not, make an API call to retrieve the team and player info
    return fetch(
      "https://v3.football.api-sports.io/teams/statistics?team=" +
        teamId +
        "&season=2021&league=" +
        team.team.league.id,

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
        const updatedTeamInfo = {
          ...team,
          stats: data.response,
        };
        teams = { ...teams, [teamId]: updatedTeamInfo };
        storeTeamsToStorage();
        return updatedTeamInfo;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

async function getPlayerInfo(playerId, teamId) {
  getPlayersFromStorage();
  const storedPlayerInfo = players[playerId];

  // Check if the player info is already stored in local storage
  if (storedPlayerInfo && storedPlayerInfo) {
    if (storedPlayerInfo.statistics && storedPlayerInfo.statistics.team) {
      return Promise.resolve(storedPlayerInfo);
    }
    if (!storedPlayerInfo.statistics) {
      return Promise.resolve();
    }
    const teamInfo = await getTeamInfo(teamId);
    storedPlayerInfo.statistics.team = teamInfo.team;
    players = { ...players, [playerId]: storedPlayerInfo };
    storePlayersToStorage();
    return Promise.resolve(storedPlayerInfo);
  } else {
    // If not, make an API call to retrieve the player info
    return fetch(
      "https://v3.football.api-sports.io/players?id=" +
        playerId +
        "&season=2021",
      {
        method: "GET",
        // mode: "no-cors",
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": football_api_key,
        },
      }
    )
      .then((response) => {
        // console.log(response);
        return response.json();
      })
      .then(async (data) => {
        console.log(data);
        // Update the players object in local storage with the new player info
        const updatedPlayerInfo = data.response[0];
        if (!data.response[0]) {
          players = { ...players, [playerId]: {} };
        } else {
          updatedPlayerInfo.statistics = combineAttributes(
            updatedPlayerInfo.statistics
          );
          if (teamId) {
            console.log("attaching stats");
            updatedPlayerInfo.statistics.team = await getTeamInfo(teamId).team;
          }
          players = { ...players, [playerId]: updatedPlayerInfo };
        }
        storePlayersToStorage();
        return updatedPlayerInfo;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

function combineAttributes(arr) {
  return arr.reduce((acc, curr) => {
    Object.entries(curr).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (typeof subValue === "number") {
            if (key in acc) {
              if (subKey in acc[key]) {
                acc[key][subKey] += subValue;
              } else {
                acc[key][subKey] = subValue;
              }
            } else {
              acc[key] = { [subKey]: subValue };
            }
          } else {
            if (key in acc) {
              if (subKey in acc[key]) {
                acc[key][subKey] = acc[key][subKey] || subValue;
              } else {
                acc[key][subKey] = subValue !== null ? subValue : null;
              }
            } else {
              acc[key] = { [subKey]: subValue !== null ? subValue : null };
            }
          }
        });
      } else {
        acc[key] = value;
      }
    });
    return acc;
  }, {});
}

async function getTeamPlayers(teamId) {
  const teamInfo = await getTeamInfo(teamId);
  const playerPromises = teamInfo.players.map((player) =>
    getPlayerInfo(player.id, teamId)
  );
  const playerInfos = await Promise.all(playerPromises);
  return playerInfos;
}

async function getTeamLineup(teamId) {
  getPlayersFromStorage();
  await getTeamPlayers(teamId);
  const playerArray = Object.values(players).map((player) =>
    player.statistics && player.statistics.games.appearences > 0
      ? { ...player.player, ...player.statistics }
      : null
  );
  const filteredPlayers = playerArray.filter(
    (player) => player && player.team.id === teamId
  );
  const goalkeeper = filteredPlayers
    .filter((player) => player.games.position === "Goalkeeper")
    .sort((a, b) => b.games.appearences - a.games.appearences)[0];
  const defenders = filteredPlayers
    .filter((player) => player.games.position === "Defender")
    .sort((a, b) => b.games.appearences - a.games.appearences)
    .slice(0, 4);
  const midfielders = filteredPlayers
    .filter((player) => player.games.position === "Midfielder")
    .sort((a, b) => b.games.appearences - a.games.appearences)
    .slice(0, 3);
  const attackers = filteredPlayers
    .filter((player) => player.games.position === "Attacker")
    .sort((a, b) => b.games.appearences - a.games.appearences)
    .slice(0, 3);

  return Promise.resolve([
    goalkeeper,
    ...defenders,
    ...midfielders,
    ...attackers,
  ]);
}

export {
  getTeamInfo,
  getPlayerInfo,
  getTeamPlayers,
  getTeamLineup,
  getTeamStats,
  addTeamToStorage,
};
