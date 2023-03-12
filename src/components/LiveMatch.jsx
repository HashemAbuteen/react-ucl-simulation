import LiveMatchEvent from "./LiveMatchEvent";
import "../style/LiveMatch.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import useStorage from "../customhooks/useStorage";
import { simulateMatch } from "./simulation";
import { createMatchObject } from "./ManageMatchObject";

export default function LiveMatch({ match }) {
  const [homeTeam, setHomeTeam] = useStorage("homeTeam", null);
  const [awayTeam, setAwayTeam] = useStorage("awayTeam", null);
  const [events, setEvents] = useState();
  useLayoutEffect(() => {
    if (match) {
      setHomeTeam(match.homeTeam);
      setAwayTeam(match.awayTeam);
      setEvents(match.events);
    } else {
      simulateMatch(homeTeam, awayTeam).then((result) => {
        const matchObj = createMatchObject(homeTeam, awayTeam, result);
        setEvents(matchObj.events);
      });
    }
  }, []);

  const [currentTime, setCurrentTime] = useState({ clock: 0, rest: 0 });
  const [eventsDone, setEventsDone] = useState([]);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const updateTimeInterval = useRef();

  useEffect(() => {
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
      }, 200);
      console.log(events);
      // console.log("home line up: ", match.homeTeam.lineup);
      // console.log("away line up: ", match.awayTeam.lineup);
      return () => clearInterval(updateTimeInterval.current);
    }
  }, [events]);

  function updateEvents(time) {
    const eventsNow = events.filter((event) => event.time === time);
    if (eventsNow.length > 0) {
      setEventsDone((currentArray) => [...eventsNow, ...currentArray]);
      for (let event of eventsNow) {
        if (event.type === "goal") {
          if (event.for === "home") {
            setScore((score) => ({ ...score, home: score.home + 1 }));
          } else {
            setScore((score) => ({ ...score, away: score.away + 1 }));
          }
        }
      }
    }
  }
  return (
    <div className="LiveMatch">
      <div className="LiveMatchUpperPart">
        <div className="teamNameAndPadge home">
          <img src={homeTeam.team.logo} alt={homeTeam.team.name + " logo"} />
          <h2>{homeTeam.team.name}</h2>
        </div>
        <div className="liveMatchScoreAndTime">
          <div className="LiveMatchScore">
            {score.home + " : " + score.away}
          </div>
          <div className="LiveMatchTime">{currentTime.clock} '</div>
        </div>
        <div className="teamNameAndPadge away">
          <img src={awayTeam.team.logo} alt={awayTeam.team.name + " logo"} />
          <h2>{awayTeam.team.name}</h2>
        </div>
      </div>
      <div className="liveMatchEventsTimeLine">
        <TransitionGroup>
          {eventsDone.map((event) => (
            <CSSTransition key={event.id} timeout={500} classNames="game-event">
              <LiveMatchEvent
                event={event}
                homeTeam={homeTeam.team}
                awayTeam={awayTeam.team}
              ></LiveMatchEvent>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    </div>
  );
}
