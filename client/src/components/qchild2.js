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

    let textAnswer = (answer === "Nej") ? undefined :
     "";

    if(btnStates[questionindex]?.Nej){
      setUserAnswers(prev => ({
        ...prev,
        [questionindex]: Object.keys(prev[questionindex] || {})
        .reduce((undefinedMap, i) =>{
          undefinedMap[i] = undefined;
          return undefinedMap;
        }, {})
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

  const handleInputChange = (e, i) => {
    const newValue = e.target.value;
    setUserAnswers(prev => ({
      ...prev,
      [questionindex]: {
        ...(prev[questionindex] || {}),
        [i] : newValue
      }
    }));
  };

  const saveAnswer = (answerToSave, textAnswer) => {
    let completedAnswer = answerToSave;
    if(textAnswer !== undefined)
      completedAnswer += textAnswer;
    fetch("http://localhost:5000/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, answer: completedAnswer }),
    });
  };

    const followUpStyle = {
      container : {
        display  :"flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",     
        marginLeft: "0px",
        padding: "1em",              // Optional: spacing inside the container
        gap: "1em",    
      },
      text : {
        margin : 0.3,
        lineHeight : "1.5",
      },
      input : {
        width : "400px",
        height : "2.0em",
        padding : "0em",
      }
    }

    const btnStylesYesNo = {
        container : {
          display: "flex",             // Make it a flex container
          flexDirection: "column",     // Stack children vertically
          justifyContent: "flex-start", // Align items to the top (main axis)
          alignItems: "center",     
          marginLeft: "40px",
          padding: "1em",              // Optional: spacing inside the container
          gap: "0em",      
          width : "600px",
          height : "300px",
          overflow : "auto",
          backgroundColor : "	#87CEEB",
          border : "3px solid black"
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

      
      
      { question?.followUp["Ja"] !== null && btnStates[questionindex]?.Ja &&
      question?.followUp["Ja"]?.map((fq, i) => (
        <div key={fq.text} style={followUpStyle.container}>
          <p style={followUpStyle.text}>{fq.text}</p>
          <input
            style={{
              width : "400px",
              height : "2.0em",
              padding : "0em"}}
            type="text"
            value={userAnswers[questionindex]?.[i] || ""}
            placeholder="Skriv ditt svar här..."
            onChange={(e) => handleInputChange(e, i)}
          />
        </div>
      ))}
      
    </div>
    );      
    

};

export default QChild2;