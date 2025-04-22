//import React, { useState, useEffect } from "react";
import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
import React from "react";


const QChild2 = ({question, questionindex, showFollowUp, setShowFollowUp,
  userAnswers, setUserAnswers, btnStates, setBtnStates
}) => {


  
  const navigate = useNavigate();
  
  const handleAnswer = (answer) => {

    setBtnStates(prev => ({
      ...prev,
      [questionindex]: {
        Ja : evalStringStart("Ja", answer),
        Nej : evalStringStart("Nej", answer),
      }
    }));

    let textAnswer = (answer === "Nej") ? undefined : userAnswers[questionindex];

    if(btnStates[questionindex]?.Nej){
      setUserAnswers(prev => ({
        ...prev,
        [questionindex]: undefined,
      }));
    }
    saveAnswer(answer, textAnswer);

    function evalStringStart  (aStr, searchStr){
      const regex = new RegExp(`^${aStr}`);
      return regex.test(searchStr);
    }

    if (question?.followUp && question?.followUp[answer]) {
      setShowFollowUp(true);
    } else if (question?.next) {
      setShowFollowUp(false);
      navigate(`/question/${question?.next}`);
      
    } else {
      navigate("/done");
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setUserAnswers(prev => ({
      ...prev,
      [questionindex]: newValue
    }));
  };

  const saveAnswer = (answerToSave, textAnswer) => {
    let completedAnswer = answerToSave;
    if(textAnswer !== undefined)
      completedAnswer += `: ${userAnswers[questionindex]}`;
    fetch("http://localhost:5000/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, answer: completedAnswer }),
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
      
      { question?.followUp["Ja"] !== null && btnStates[questionindex]?.Ja && (
        <div>
          <p>{question?.followUp["Ja"]}</p>
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