//import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
//import React from "react";
import  { useState, useEffect, useLayoutEffect } from "react";


const QChild3 = ({question, questionindex, showFollowUp, setShowFollowUp, userAnswers, btnStates}) => {

  const navigate = useNavigate();
  //TODO se till att man inte kan navigera out of bounds för frågorna
  //TODO BUGG: svar defaultar till Nej när man trycker på nästa fråga även om man markerat Ja

  const handleNext = () => {
    if (showFollowUp && userAnswers[questionindex] ) {
    let ans = btnStates[questionindex]?.Ja === true ? "Ja": "Nej";
      saveAnswer(ans);
    }
    setShowFollowUp(false);
    navigate(`/question/${question.next}`);
  };

  const handlePrevious = () => {
    if (showFollowUp && userAnswers[questionindex] !== null) {
      let ans = btnStates[questionindex]?.Ja === true ? "Ja": "Nej"; 
        saveAnswer(ans);
      }
    if(question.id > 1){
      let previous = question.id -1;
      setShowFollowUp(false);
      navigate(`/question/${previous}`);
    }
    else navigate("/");
  }

  const saveAnswer = (answerToSave) => {
    let followupText = ": " + Object.values(userAnswers[questionindex]).join(", ");
     fetch("http://localhost:5000/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, answer : answerToSave + followupText }),
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