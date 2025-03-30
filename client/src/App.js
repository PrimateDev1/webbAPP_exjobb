import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import QuestionPage from "./components/questionspage.js";
import Chatbot from "./components/chatbot.js";
import FormDone from "./components/formDone.js";




function Home() {
  return (
    <div className="container">
      <h1>Välkommen till Hälsodeklarationen</h1>
      <nav>
        <ul>
          <li><Link to="/question/1">Starta Hälsodeklaration</Link></li>
        </ul>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div> {/* ✅ Wrap everything inside a parent div */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/question/:id" element={<QuestionPage />} />
          <Route path="/done" element={<FormDone />} />
        </Routes>
        <Chatbot /> {/* ✅ Chatbot should always be visible */}
      </div>
    </Router>
  );
}

export default App;
