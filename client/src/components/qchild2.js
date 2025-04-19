//import React, { useState, useEffect } from "react";
import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
import React from "react";


const QChild2 = ({question, questionindex}) => {


  
  const navigate = useNavigate();
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [btnStates, setBtnStates] = useState({});


  const handleAnswer = (answer) => {
    saveAnswer(answer);
    setBtnStates(prev => ({
      ...prev,
      [questionindex]: {
        Ja : answer === "Ja",
        Nej : answer === "Nej"
      }
    }));
    

    if (question.followUp && question.followUp[answer]) {
      setShowFollowUp(true);
    } else if (question.next) {
      
      navigate(`/question/${question.next}`);
    } else {
      navigate("/done");
    }
  };

  const handleNext = () => {
    if (showFollowUp && userAnswer) {
      saveAnswer(userAnswer);
    }
    navigate(`/question/${question.next}`);
  };

  const handleBack = () => {
    if (questionindex > 0) {
      const prevId = questions[questionindex - 1].id;
      navigate(`/question/${prevId}`);
    } else {
      navigate("/");
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
  
    setUserAnswers(prev => ({
      ...prev,
      [questionindex]: newValue
    }));
  };

  const saveAnswer = (answerToSave) => {
    fetch("http://localhost:5000/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, answer: answerToSave }),
    });
  };

    const btnStylesYesNo = {
        container : {
          display: "flex",             // Make it a flex container
          flexDirection: "column",     // Stack children vertically
          justifyContent: "flex-start", // Align items to the top (main axis)
          alignItems: "center",     
          marginLeft: "40px",
          padding: "1em",              // Optional: spacing inside the container
          gap: "1em",      
          width : "600px",
          height : "300px",
          overflow : "auto",
          border : "3px solid red"
        },
      };
      
    return (
        
    <div style = {btnStylesYesNo.container}>
      <div style={{ display: 'flex', gap: '10px' }}>
      <button 
        onClick={() => handleAnswer("Ja")}
        style={{
        backgroundColor: btnStates[questionindex]?.Ja ? 'green' : 'gray',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>Ja </button>

      <button 
        onClick={() => handleAnswer("Nej")}
        style={{
        backgroundColor: btnStates[questionindex]?.Nej ? 'green' : 'gray',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>Nej </button>  
      </div>
      
      {showFollowUp && (
        <div>
          <p>{question.followUp["Ja"]}</p>
          <input
            type="text"
            placeholder="Skriv ditt svar här..."
            value={userAnswers[questionindex] || ""}
            onChange={handleInputChange}
          />
          </div>
      )}
      
    </div>
    );      
    

};

export default QChild2;