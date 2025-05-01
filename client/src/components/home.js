
import { BrowserRouter as Router, Routes, Route, Link, useNavigate , useParams } from "react-router-dom";


const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContensts: "flex-end",
    alignItems: "center",  // Align them to the left (or use "center" or "flex-end")
    padding: "2em",
    gap: "1em",                // Adds space between elements
   // border : "3px solid red",
  },
};


const Home = () => {

  const navigate = useNavigate();

  const handleStart = async () => {
    try{
     await fetch("http://localhost:5000/api/reset", {
      method : "POST",
    });
    navigate("/question/1");
  }
  catch (err){
    console.error("could not fetch server endpoint api/reset");
    }
};

  return(
    <div style={styles.container}>
      <h1>Välkommen till Hälsodeklarationen</h1>
      <nav>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
          <button onClick={handleStart} style={{ padding: "10px 20px", cursor: "pointer" }}>
              Starta Hälsodeklaration
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
};

export default Home;