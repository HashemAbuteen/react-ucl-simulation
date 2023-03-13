const football_api_key = "a95663ef232e53f38d2462acc02e5ec1";

async function getAllTeamDataById(teamId) {
  let team = {};
  // get init data contains id, name , logo , players {id , name , age , number , position , photo }
  await fetch(
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
      if (Object.keys(data.errors).length > 0) {
        console.log("Error : ", data.errors);
      } else {
        data = data.response[0];
        team = { ...team, ...data.team, players: data.players };
        console.log("first api response ", team);
        console.log(`init succes for team ${team.name}`);
      }
    });

  //get team league and country
  await fetch(
    "https://v3.football.api-sports.io/leagues?team=" +
      teamId +
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
      if (Object.keys(data.errors).length > 0) {
        console.log("Error : ", data.errors);
      } else {
        data = data.response[0];
        console.log("data", data);
        team = { ...team, country: data.country, league: data.league };
        console.log("second api response ", team);
        console.log(`Added country and league for  ${team.name}`);
      }
    });

  //get Team stats
  await fetch(
    "https://v3.football.api-sports.io/teams/statistics?team=" +
      teamId +
      "&season=2021&league=" +
      team.league.id,

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
      if (Object.keys(data.errors).length > 0) {
        console.log("Error : ", data.errors);
      } else {
        data = data.response;
        team = { ...team, stats: data };
        console.log(`got stats for team ${team.name}`);
        console.log("Third api response ", team);
      }
    })
    .catch((err) => {
      console.log(err);
    });

  console.log("team info is ready", team);
  // now oterating over players
  for (const player of team.players) {
    const storedPlayer = getPlayerFromStorage(player.id);
    if (storedPlayer && storedPlayer.stats) {
      console.log(`player ${player.id} in ${team.name} has already got stats`);
      player.stats = storedPlayer.stats;
      storeTeamToLocalStorage(team);
    } else {
      await fetch(
        "https://v3.football.api-sports.io/players?id=" +
          player.id +
          "&season=2021",
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
          if (Object.keys(data.errors).length > 0) {
            console.log("Error : ", data.errors);
          } else {
            if (data.response[0]) {
              let stats = data.response[0].statistics;
              stats = combineAttributes(stats);
              player.stats = stats;
            }
            console.log("data", data);
            console.log(
              `added stats for player ${player.name} in team ${team.name}`
            );
            console.log("player", player);
            console.log("team", team);
            storeTeamToLocalStorage(team);
            storePlayerToLocalStorage(player);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
  storeTeamToLocalStorage(team);
}

async function getTeamDataOnly(teamId) {
  let team = {};
  // get init data contains id, name , logo , players {id , name , age , number , position , photo }
  await fetch(
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
      if (Object.keys(data.errors).length > 0) {
        console.log("Error : ", data.errors);
      } else {
        data = data.response[0];
        team = { ...team, ...data.team, players: data.players };
        console.log("first api response ", team);
        console.log(`init succes for team ${team.name}`);
      }
    });
  storeTeamToLocalStorage(team);
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

function storeTeamToLocalStorage(team) {
  localStorage.setItem(`team-${team.id}`, JSON.stringify(team));
}
function storePlayerToLocalStorage(player) {
  localStorage.setItem(`player-${player.id}`, JSON.stringify(player));
}

function isTeamInStorage(teamId) {
  const team = JSON.parse(localStorage.getItem(`team-${teamId}`));
  if (!team) return false;
  if (!team.players || !team.stats) return false;
  return true;
}

function isTeamInStorageWithoutStats(teamId) {
  const team = JSON.parse(localStorage.getItem(`team-${teamId}`));
  if (!team) return false;
  return true;
}

function getTeamFromStorage(teamId) {
  if (isTeamInStorage(teamId) || isTeamInStorageWithoutStats(teamId)) {
    return JSON.parse(localStorage.getItem(`team-${teamId}`));
  } else {
    return null;
  }
}

function getPlayerFromStorage(playerId) {
  return JSON.parse(localStorage.getItem(`player-${playerId}`)) || false;
}

function makeLineUp(team) {
  const playersArray = team.players.filter((player) => {
    if (player.number < 10) player.number = player.number + " ";
    return player && player.stats && player.stats.games.lineups > 0;
  });

  console.log(playersArray);

  const goalkeeper = playersArray
    .filter((player) => player.position === "Goalkeeper")
    .sort((a, b) => b.stats.games.lineups - a.stats.games.lineups)[0];
  const defenders = playersArray
    .filter((player) => player.position === "Defender")
    .sort((a, b) => b.stats.games.lineups - a.stats.games.lineups)
    .slice(0, 4);
  const midfielders = playersArray
    .filter((player) => player.position === "Midfielder")
    .sort((a, b) => b.stats.games.lineups - a.stats.games.lineups)
    .slice(0, 3);
  const attackers = playersArray
    .filter((player) => player.position === "Attacker")
    .sort((a, b) => b.stats.games.lineups - a.stats.games.lineups)
    .slice(0, 3);

  return [goalkeeper, ...defenders, ...midfielders, ...attackers];
}

export {
  getAllTeamDataById,
  getTeamFromStorage,
  storeTeamToLocalStorage,
  isTeamInStorage,
  getTeamDataOnly,
  isTeamInStorageWithoutStats,
  makeLineUp,
};
