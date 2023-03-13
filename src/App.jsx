import { createTheme, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import {
  getTeamInfo,
  getPlayerInfo,
  getTeamLineup,
  getTeamStats,
  getTeamPlayers,
} from "./components/DataManager";
import {
  getAllTeamDataById,
  getTeamFromStorage,
  isTeamInStorage,
} from "./components/getDefaultTeams";
import Landing from "./components/Landing";
import LiveMatch from "./components/LiveMatch";
import { createMatchObject } from "./components/ManageMatchObject";
import Match from "./components/Match";
import { simulateMatch } from "./components/simulation";
import SingleMatchSettings from "./components/SingleMatchSettings";

import defaultTeams from "./data/default.json";

function App() {
  // const [isLoading, setIsLoading] = useState(true);
  // const [matchObject, setMatchObject] = useState();
  // const homeTeamId = 532;
  // const awayTeamId = 604;

  // useEffect(() => {
  //   const homeTeamPromise = getTeamInfo(homeTeamId).then(() =>
  //     getTeamStats(homeTeamId)
  //   );
  //   const awayTeamPromise = getTeamInfo(awayTeamId).then(() =>
  //     getTeamStats(awayTeamId)
  //   );

  //   Promise.all([homeTeamPromise, awayTeamPromise])
  //     .then(async ([homeTeam, awayTeam]) => {
  //       const matchResult = simulateMatch(homeTeam, awayTeam);
  //       const tempMatchObj = createMatchObject(homeTeam, awayTeam, matchResult);
  //       tempMatchObj.homeTeam.lineup = await getTeamLineup(homeTeamId);
  //       tempMatchObj.awayTeam.lineup = await getTeamLineup(awayTeamId);
  //       setMatchObject(tempMatchObj);
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }, []);

  // return isLoading ? <>Loading</> : <LiveMatch match={matchObject} />;

  // second comments
  const [page, setPage] = useState();
  if (!page) return <Landing setPage={setPage} />;
  if (page === "set-single-match")
    return <SingleMatchSettings setPage={setPage} />;
  if (page.startsWith("match")) {
    console.log(page);
    const homeTeamId = parseInt(page.split("-")[1]);
    const awayTeamId = parseInt(page.split("-")[2]);
    return (
      <Match
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        setPage={setPage}
      />
    );
  }
  return <Landing />;

  // useEffect(() => {
  //   // let i = 0;
  //   // for (const group of defaultTeams) {
  //   //   for (const teamId of group) {
  //   //     setTimeout(() => {
  //   //       getAllTeamDataById(teamId);
  //   //     }, i * 20000);
  //   //     i++;
  //   //   }
  //   // }
  //   // getAllTeamDataById(492);
  // }, []);

  return <>Check console</>;
}

export default App;
