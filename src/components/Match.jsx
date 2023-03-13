import { useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import {
  getAllTeamDataById,
  getTeamFromStorage,
  isTeamInStorage,
  makeLineUp,
} from "./getDefaultTeams";
import "../style/Match.css";
import { simulateEvents } from "./simulation";
import LiveMatchEvent from "./LiveMatchEvent";
import singleWhistle from "../sounds/single.mp3";

function Match({ homeTeamId, awayTeamId, tournament, setTournament, setPage }) {
  const [homeTeam, setHomeTeam] = useState();
  const [awayTeam, setAwayTeam] = useState();
  const [error, setError] = useState();
  const [simulation, setSimulation] = useState();
  const [lineUp, setLinup] = useState({});
  const [events, setEvents] = useState();
  const updateTimeInterval = useRef();
  const [currentTime, setCurrentTime] = useState({ clock: -5, rest: 0 });
  const [eventsDone, setEventsDone] = useState([]);
  const [score, setScore] = useState({ home: 0, away: 0 });

  const singleWhislteRed = useRef();

  useEffect(() => {
    if (isTeamInStorage(homeTeamId)) {
      setHomeTeam(getTeamFromStorage(homeTeamId));
      console.log(getTeamFromStorage(homeTeamId));
    } else {
      getAllTeamDataById(homeTeamId).then(() => {
        if (isTeamInStorage(homeTeamId)) {
          setHomeTeam(getTeamFromStorage(homeTeamId));
        } else {
          setError("An error occured while loading the home team data");
        }
      });
    }
    if (isTeamInStorage(awayTeamId)) {
      setAwayTeam(getTeamFromStorage(awayTeamId));
      console.log(getTeamFromStorage(awayTeamId));
    } else {
      getAllTeamDataById(awayTeamId).then(() => {
        if (isTeamInStorage(awayTeamId)) {
          setAwayTeam(getTeamFromStorage(awayTeamId));
        } else {
          setError("An error occured while loading the away team data");
        }
      });
    }
  }, []);

  useEffect(() => {
    let homeLineup = lineUp.home;
    let awayLineup = lineUp.away;
    if (homeTeam && !homeLineup) {
      homeLineup = makeLineUp(homeTeam);
      console.log(homeLineup);
    }
    if (awayTeam && !awayLineup) {
      awayLineup = makeLineUp(awayTeam);
      console.log(awayLineup);
    }
    setLinup({ home: homeLineup, away: awayLineup });
    if (homeTeam && awayTeam) {
      setEvents(simulateEvents(homeTeam, awayTeam, homeLineup, awayLineup));
      setSimulation(true);
    }
  }, [homeTeam, awayTeam]);

  useEffect(() => {
    console.log("events", events);
    if (events) {
      updateTimeInterval.current = setInterval(() => {
        setCurrentTime((currentTime) => {
          if (currentTime.clock !== 90 && currentTime.clock !== 45) {
            updateEvents(currentTime.clock + 1);
            return { clock: currentTime.clock + 1, rest: 0 };
          }
          if (currentTime.clock === 45 && currentTime.rest < 15) {
            return { clock: 45, rest: currentTime.rest + 1 };
          }
          if (currentTime.clock === 45 && currentTime.rest === 15) {
            updateEvents(46);
            return { clock: 46, rest: 0 };
          } else {
            return currentTime;
          }
        });
      }, 600);
      console.log(events);
      // console.log("home line up: ", match.homeTeam.lineup);
      // console.log("away line up: ", match.awayTeam.lineup);
      return () => clearInterval(updateTimeInterval.current);
    }
  }, [events]);

  useEffect(() => {
    console.log("eventsdone", eventsDone);
  }, eventsDone);

  function updateEvents(time) {
    const eventsNow = events.filter((event) => event.min === time);
    if (eventsNow.length > 0) {
      setEventsDone((currentArray) => [...eventsNow, ...currentArray]);
      for (let event of eventsNow) {
        if (event.type === "goal") {
          if (event.team === "home") {
            setScore((score) => ({ ...score, home: score.home + 1 }));
          } else {
            setScore((score) => ({ ...score, away: score.away + 1 }));
          }
        }
        if (event.type === "yellow") {
          playSingleWhistle();
        }
      }
    }
    if (time === 0) {
      playSingleWhistle();
    }
  }
  function playSingleWhistle() {
    const audio = singleWhislteRed.current;
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  }
  const sounds = (
    <>
      <audio ref={singleWhislteRed} src={singleWhistle} />
    </>
  );

  const backButton = (
    <button className="back-button" onClick={() => setPage("set-single-match")}>
      New Match
    </button>
  );

  if (error) {
    return (
      <div className="match-container">
        {backButton}
        <div className="error-messsage">{error}</div>
      </div>
    );
  }
  if (!homeTeam || !awayTeam || !simulation) {
    return (
      <div className="match-container">
        {backButton}
        <div className="loading-div">Loading</div>
      </div>
    );
  }

  return (
    <div className="LiveMatch">
      {backButton}
      {sounds}
      <div className="LiveMatchUpperPart">
        <div className="teamNameAndPadge home">
          <img src={homeTeam.logo} alt={homeTeam.name + " logo"} />
          <h2>{homeTeam.name}</h2>
        </div>
        <div className="liveMatchScoreAndTime">
          <div className="LiveMatchScore">
            {score.home + " : " + score.away}
          </div>
          <div className="LiveMatchTime">
            {currentTime.clock > 0 ? currentTime.clock : 0} '
          </div>
        </div>
        <div className="teamNameAndPadge away">
          <img src={awayTeam.logo} alt={awayTeam.name + " logo"} />
          <h2>{awayTeam.name}</h2>
        </div>
      </div>
      <div className="live-match-lower-part">
        <div className="home-lineup">
          <ul className="lineup">
            <TransitionGroup>
              {lineUp.home.map((player) => (
                <li style={{ whiteSpace: "pre" }} key={player.id}>
                  <CSSTransition
                    timeout={2000}
                    classNames="lineup-player"
                    appear={true}
                    in={true}
                  >
                    <div>{`${player.number}\t${player.name}`}</div>
                  </CSSTransition>
                </li>
              ))}
            </TransitionGroup>
          </ul>
        </div>
        <div className="liveMatchEventsTimeLine">
          {eventsDone.map((event) => (
            <CSSTransition
              key={event.id}
              timeout={1000}
              classNames="game-event"
              appear={true}
              in={true}
            >
              <LiveMatchEvent
                event={event}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              ></LiveMatchEvent>
            </CSSTransition>
          ))}
        </div>
        <div className="away-lineup">
          <ul className="lineup">
            <TransitionGroup>
              {lineUp.away.map((player) => (
                <li style={{ whiteSpace: "pre" }} key={player.id}>
                  <CSSTransition
                    timeout={2000}
                    classNames="lineup-player"
                    appear={true}
                    in={true}
                  >
                    <div>{`${player.number}\t${player.name}`}</div>
                  </CSSTransition>
                </li>
              ))}
            </TransitionGroup>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Match;
