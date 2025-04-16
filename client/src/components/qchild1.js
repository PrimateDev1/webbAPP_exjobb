
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
import React from "react";

const QChild1 = () => {
    const { id } = useParams();
  const navigate = useNavigate();

  const styles1 = {
    container: {
      display: "flex",             // Make it a flex container
      flexDirection: "column",     // Stack children vertically
      justifyContent: "flex-end", // Align items to the top (main axis)
      alignItems: "center",     
      marginLeft: "40px",
      padding: "1em",              // Optional: spacing inside the container
      gap: "1em",      
      width : "600px",
      height : "300px",
      overflow : "auto",
    },
  };


  const questionIndex = parseInt(id) - 1;
  const question = questions[questionIndex];

  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  useEffect(() => {
    setShowFollowUp(false);
    setUserAnswer("");
  }, [id]);

  useEffect(() => {
    if (id === "1") {
      fetch("http://localhost:5000/api/reset", { method: "POST" });
    }
  }, [id]);

  if (!question) {
    return <h2>Frågan finns inte.</h2>;
  }

  <div className="container">
    <div className="question-box" style={styles1.container}>
        <h1>Fråga {question.id}</h1 >
        <p>{question.text}</p>
    </div>
  </div>
}

export default QChild1;