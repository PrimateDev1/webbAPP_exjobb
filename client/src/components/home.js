import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";



const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContensts: "flex-end",
    alignItems: "center",  // Align them to the left (or use "center" or "flex-end")
    padding: "2em",
    gap: "1em",                // Adds space between elements
  },
};

const Home = () => {
  return (
    <div style={styles.container}>
      <h1>Välkommen till Hälsodeklarationen</h1>
      <nav>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <Link to="/question/1">Starta Hälsodeklaration</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
