export default function LiveMatchEvent({ event, homeTeam, awayTeam }) {
  const team = event.team === "home" ? homeTeam : awayTeam;
  console.log(event.player);
  return (
    <div
      style={{
        transition: "opacity 0.5s ease-in-out",
        border: "1px solid white",
        padding: "1rem",
        width: "100%",
        marginBottom: "1rem",
      }}
    >
      {event.min}' : {event.type} for {team.name} by {event.player.name}
    </div>
  );
}
