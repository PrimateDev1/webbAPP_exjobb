//import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
//import React from "react";
import  { useState, useEffect, useLayoutEffect } from "react";


const QChild3 = ({question, questionindex, showFollowUp, setShowFollowUp, userAnswers, btnStates}) => {

  const navigate = useNavigate();

  const handleNext = () => {
    if (showFollowUp && userAnswers[questionindex] ) {
    let ans = btnStates[questionindex]?.Ja === true ? "Ja": "Nej";
      saveAnswer(ans);
    }
    setShowFollowUp(false);
    if(question.next !== undefined)
      navigate(`/question/${question.next}`);
    else{
      fetch("http://localhost:5000/api/check", {
        method : "GET",
      }).then(res => {
        if(!res.ok) console.error(res);
        return res.json();
      }).then( missing => {
        if(Array.isArray(missing) && missing.length === 0)
          navigate("/done");
        else{
          let min =  missing.reduce((acc, curr) => {
            return (acc < curr) ? acc : curr; 
          });
          alert("Alla frågor är inte besvarade! Obesvarade frågor: " + missing.join(", "));
          navigate(`/question/${min}`);  
        }
      });
    }
  };

  const handlePrevious = () => {
    let ua = userAnswers[questionindex];
    console.log(ua);
    if (showFollowUp && userAnswers[questionindex] !== undefined) {
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
          width : "1000px",
        },
        button : {
          style : {
            backgroundColor:  'gray',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            height : "40px",
            width : "200 px",
          }
        }
    };

   return (
    <div style={styles.container}>
        <button style={styles.button.style} onClick={handlePrevious}>Föregående Fråga</button>
        <button style={styles.button.style} onClick={handleNext}>Nästa Fråga</button>
    </div>
   );

}

export default QChild3;