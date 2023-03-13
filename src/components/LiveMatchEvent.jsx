export default function LiveMatchEvent({ event, homeTeam, awayTeam }) {
  const team = event.team === "home" ? homeTeam : awayTeam;
  return (
    <div
      style={{
        transition: "opacity 0.5s ease-in-out",
        border: "1px solid white",
        padding: "1rem",
        width: "80%",
        marginBottom: "1rem",
      }}
    >
      {event.type === "goal" ? (
        <>
          {event.min} ': {event.type} for {team.name} by {event.player.name}
        </>
      ) : event.type === "yellow" ? (
        <>
          {event.min} ': {team.name} : Yellow Card for {event.player.name}
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
