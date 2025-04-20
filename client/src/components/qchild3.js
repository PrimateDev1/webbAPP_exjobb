//import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
//import React from "react";
import  { useState, useEffect, useLayoutEffect } from "react";


const QChild3 = ({question, questionindex, showFollowUp, setShowFollowUp, userAnswers, btnStates}) => {

  const navigate = useNavigate();

  const handleNext = () => {
    if (showFollowUp && userAnswers[questionindex] !== null) {
    let ans = btnStates.Ja === true ? "Ja": "Nej"; 
      saveAnswer(ans);
    }
    setShowFollowUp(false);
    navigate(`/question/${question.next}`);
  };

  const handlePrevious = () => {
    if(showFollowUp && userAnswer) {
      saveAnswer(userAnswer);
    }
    if(question.id > 1){
      let previous = question.id -1;
      setShowFollowUp(false);
      navigate(`/question/${previous}`);
    }
  }

  const saveAnswer = (answerToSave) => {
    let answer_ = userAnswers[questionindex] !== null ?
     answerToSave + `: ${userAnswers[questionindex]}`:
     answerToSave; 
     fetch("http://localhost:5000/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, answer : answer_}),
    });
  };

    const styles = {
        container : {
          display : "flex",
          padding : "1em",
          gap : "1em",
          justifyContent : "center",
          alignItems : "center",
          padding : "3em solid red",
          height : "100px",
          width : "100px",
        }
    };

   return (
    <div style = {null}>
        <button onClick={handlePrevious}>Föregående Fråga</button>
        <button onClick={handleNext}>Nästa Fråga</button>
    </div>
   );

}

export default QChild3;