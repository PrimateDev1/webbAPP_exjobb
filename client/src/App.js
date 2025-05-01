import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QuestionPage from "./components/questionspage.js";
import Chatbot from "./components/chatbot.js";
import FormDone from "./components/formDone.js";
import Home from "./components/home.js"
import QParent from "./components/questionspage.js";
import "./index.css";


const appstyle = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "20px",
    flexWrap: "wrap",  // Allow wrapping on smaller screens
    backgroundColor : "#B0E0E6",
  },
};




function App() {

  return (
    <Router>
      <div style={appstyle.container}>
        <Chatbot /> 
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/question/:id" element={<QParent/>}  />
            <Route path="/done" element={<FormDone />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
