//import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
//import React from "react";
import  { useState, useEffect, useLayoutEffect } from "react";


const QChild3 = ({question, questionindex}) => {

  const navigate = useNavigate();
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

  const handleNext = () => {
    if (showFollowUp && userAnswer) {
      saveAnswer(userAnswer);
    }
    navigate(`/question/${question.next}`);
  };

  const handlePrevious = () => {
    if(showFollowUp && userAnswer) {
      saveAnswer(userAnswer);
    }
    if(question.id > 1){
      let previous = question.id -1;
      navigate(`/question/${previous}`);
    }
  }

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