import { getTeamInfo, getTeamStats } from "./DataManager";

async function simulateMatch(homeTeam, awayTeam) {
  if (!homeTeam.stats) {
    await getTeamStats(homeTeam.team.id);
    homeTeam = await getTeamInfo(homeTeam.team.id);
  }
  if (!awayTeam.stats) {
    await getTeamStats(awayTeam.team.id);
    awayTeam = await getTeamInfo(awayTeam.team.id);
  }

  const homeGoalAvg = parseFloat(homeTeam.stats.goals.for.average.home);
  const awayGoalAvg = parseFloat(awayTeam.stats.goals.for.average.away);
  const homeGoalAvgAgainst = parseFloat(
    homeTeam.stats.goals.against.average.home
  );
  const awayGoalAvgAgainst = parseFloat(
    awayTeam.stats.goals.against.average.away
  );

  const homeScore = Math.max(
    0,
    Math.round(
      (homeGoalAvg + awayGoalAvgAgainst) / 2 + (Math.random() * 3 - 1.5)
    )
  );
  const awayScore = Math.max(
    0,
    Math.round(
      (awayGoalAvg + homeGoalAvgAgainst) / 2 + (Math.random() * 3 - 1.5)
    )
  );

  const homeWeights = calculateWeights(homeScore);
  const awayWeights = calculateWeights(awayScore);

  const homeGoalsTime = Array(Math.max(homeScore, 0)).fill(null);
  if (homeScore > 0) {
    for (let i = 0; i < homeScore; i++) {
      const minute = selectRandomMinute(homeWeights);
      homeGoalsTime[i] = minute;
      homeWeights[minute - 1] = 0;
    }
    homeGoalsTime.sort((a, b) => a - b);
  }

  const awayGoalsTime = Array(Math.max(awayScore, 0)).fill(null);
  if (awayScore > 0) {
    for (let i = 0; i < awayScore; i++) {
      const minute = selectRandomMinute(awayWeights);
      awayGoalsTime[i] = minute;
      awayWeights[minute - 1] = 0;
    }
    awayGoalsTime.sort((a, b) => a - b);
  }

  return Promise.resolve({
    homeScore,
    awayScore,
    homeGoalsTime,
    awayGoalsTime,
  });
}

function simulateEvents(homeTeam, awayTeam, homeLineup, awayLineup) {
  console.log("hometeam", homeTeam);
  let homeAvg = parseFloat(homeTeam.stats.goals.for.average.total);
  let awayAvg = parseFloat(awayTeam.stats.goals.for.average.total);
  const homeCountry = homeTeam.country.name;
  const awayCountry = awayTeam.country.name;

  const countryCoeffiecent = {
    Spain: 100,
    England: 100,
    France: 80,
    Italy: 80,
    Germany: 70,
  };

  const homeCountryFacor = countryCoeffiecent[homeCountry] || 35;
  const awayCountryFacor = countryCoeffiecent[awayCountry] || 35;
  homeAvg = (homeAvg * homeCountryFacor) / awayCountryFacor;
  awayAvg = (awayAvg * awayCountryFacor) / homeCountryFacor;

  const homeScore = homeAvg + Math.random() * 4 - 2;
  const awayScore = awayAvg + Math.random() * 4 - 2;

  let id = 0;
  const events = [];
  for (let i = 1; i < homeScore; i++) {
    const random = Math.random();
    const scorrerPosition =
      random < 0.6 ? "Attacker" : random < 0.9 ? "Midfielder" : "Defender";
    const minute = Math.floor(Math.random() * 90 + 1);
    const playersFiltered = homeLineup.filter(
      (player) => player.position === scorrerPosition
    );
    const player =
      playersFiltered[Math.floor(Math.random() * playersFiltered.length)];
    const newEvent = {};
    newEvent.type = "goal";
    newEvent.min = minute;
    newEvent.player = player;
    newEvent.team = "home";
    newEvent.id = id++;
    events.push(newEvent);
  }
  for (let i = 1; i < awayScore; i++) {
    const random = Math.random();
    const scorrerPosition =
      random < 0.6 ? "Attacker" : random < 0.9 ? "Midfielder" : "Defender";
    const minute = Math.floor(Math.random() * 90 + 1);
    const playersFiltered = awayLineup.filter(
      (player) => player.position === scorrerPosition
    );
    const player =
      playersFiltered[Math.floor(Math.random() * playersFiltered.length)];
    const newEvent = {};
    newEvent.type = "goal";
    newEvent.min = minute;
    newEvent.player = player;
    newEvent.team = "away";
    newEvent.id = id++;
    events.push(newEvent);
  }

  //cards

  const homeYellow =
    homeScore > awayScore
      ? Math.ceil(Math.random() * 3)
      : Math.ceil(Math.random() * 5);
  const awayYellow =
    awayScore > homeScore
      ? Math.ceil(Math.random() * 3)
      : Math.ceil(Math.random() * 5);

  const homeCarders = getRandomSubarray(homeLineup, homeYellow);
  const awayCarders = getRandomSubarray(awayLineup, awayYellow);

  for (const player of homeCarders) {
    const newEvent = {};
    newEvent.type = "yellow";
    const minute = Math.floor(Math.random() * 90 + 1);
    newEvent.min = minute;
    newEvent.player = player;
    newEvent.team = "home";
    newEvent.id = id++;
    events.push(newEvent);
  }
  for (const player of awayCarders) {
    const newEvent = {};
    newEvent.type = "yellow";
    const minute = Math.floor(Math.random() * 90 + 1);
    newEvent.min = minute;
    newEvent.player = player;
    newEvent.team = "away";
    newEvent.id = id++;
    events.push(newEvent);
  }

  return events;
}

function getRandomSubarray(arr, size) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

function calculateWeights(score) {
  const weights = Array(90).fill(0);

  for (const [minuteInterval, { total, percentage }] of Object.entries(
    scoringDistribution
  )) {
    const [start, end] = minuteInterval.split("-");
    const weight =
      percentage !== null ? (parseFloat(percentage) / 100) * score : 0;
    for (let i = start; i <= end; i++) {
      weights[i - 1] += weight / (end - start + 1);
    }
  }

  return weights;
}

function selectRandomMinute(weights) {
  const nonNullWeights = weights.filter((w) => w !== null);

  for (let i = 0; i < nonNullWeights.length; i++) {
    if (isNaN(nonNullWeights[i])) {
      nonNullWeights[i] = 0;
    }
  }

  const totalWeight = nonNullWeights.reduce((sum, w) => sum + w);

  const threshold = Math.random() * totalWeight;

  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] !== null) {
      acc += weights[i];
      if (acc >= threshold) {
        return i + 1;
      }
    }
  }
}

const scoringDistribution = {
  "0-15": {
    total: 68,
    percentage: "14.71%",
  },
  "16-30": {
    total: 68,
    percentage: "17.65%",
  },
  "31-45": {
    total: 68,
    percentage: "14.71%",
  },
  "46-60": {
    total: 68,
    percentage: "20.59%",
  },
  "61-75": {
    total: 68,
    percentage: "8.82%",
  },
  "76-90": {
    total: 68,
    percentage: "11.76%",
  },
  "91-105": {
    total: 68,
    percentage: "11.76%",
  },
  "106-120": {
    total: 68,
    percentage: null,
  },
};

export { simulateMatch, simulateEvents };
