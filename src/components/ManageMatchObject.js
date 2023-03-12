function createMatchObject(homeTeam, awayTeam, matchResult) {
  const events = [];
  let id = 0;
  for (let time of matchResult.homeGoalsTime) {
    const event = { time, for: "home", type: "goal", id };
    id++;
    events.push(event);
  }
  for (let time of matchResult.awayGoalsTime) {
    const event = { time, for: "away", type: "goal", id };
    id++;
    events.push(event);
  }
  const currentTime = 0;
  const homeScore = 0;
  const awayScore = 0;
  const home = homeTeam.team;
  const away = awayTeam.team;

  events.sort((a, b) => a.time - b.time);

  return {
    homeTeam: home,
    awayTeam: away,
    currentTime,
    homeScore,
    awayScore,
    events,
  };
}

export { createMatchObject };
