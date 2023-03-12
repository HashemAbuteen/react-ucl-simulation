import "../style/Landing.css";
import Search from "./Search";
import SingleMatchSettings from "./SingleMatchSettings";

function Landing({ setPage }) {
  return (
    <div className="landing-page">
      <div className={"landing-page-buttons"}>
        <button>New Turnament</button>
        <button>Load a Turnament</button>
        <button onClick={() => setPage("set-single-match")}>
          Kick off a Single Match
        </button>
      </div>
    </div>
  );
}

export default Landing;
