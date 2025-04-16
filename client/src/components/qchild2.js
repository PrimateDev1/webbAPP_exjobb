import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
import React from "react";


const QChild2 = () => {


  const { id } = useParams();
  const navigate = useNavigate();

  const questionIndex = parseInt(id) - 1;
  const question = questions[questionIndex];

  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");


  const handleAnswer = (answer) => {
    saveAnswer(answer);

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
    if (questionIndex > 0) {
      const prevId = questions[questionIndex - 1].id;
      navigate(`/question/${prevId}`);
    } else {
      navigate("/");
    }
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
          display : "flex",
          padding : "1em",
          gap : "1em",
          justifyContent : "center",
          alignItems : "center"
        },
      };

    if(questions.followup){
        <div style = {btnStylesYesNo.container}>
        <button onClick={() => handleAnswer("Ja")}>Ja</button>
        <button onClick={() => handleAnswer("Nej")}>Nej</button>
      </div>
    }
    else if(questions.next){
        <button onClick={handleNext}>Nästa fråga</button>
    }
    else{
        
    }

    {showFollowUp && (
      <div>
        <p>{question.followUp["Ja"]}</p>
        <input
          type="text"
          placeholder="Skriv ditt svar här..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
        {question.next ? (
          <button onClick={handleNext}>Nästa fråga</button>
        ) : (
          <button
            onClick={() => {
              if (userAnswer) {
                saveAnswer(userAnswer);
              }
              navigate("/done");
            }}
          >
            Avsluta formulär
          </button>
        )}
      </div>
    )}

}

export default QChild2;