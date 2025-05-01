import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";
//import React from "react";
import QChild1 from "./qchild1.js";
import QChild2 from "./qchild2.js";
import QChild3 from "./qchild3.js";

const QParent = () => {

  const styles = {
    container: {
      display : "flex",
      flexDirection : "column",
      justifyContent : "center",
      alignItems : "center",
      width : "800px",
      height : "90vh",
      //border: '3px solid red', //debug border
      margin: "0 auto",
      //backgroundColor: "#f0f0f0"
    }
  };
  
  const { id } = useParams();
  const questionIndex_ = parseInt(id) - 1;
  const question_ = questions[questionIndex_];
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [btnStates, setBtnStates] = useState({});

  return (
    <div style={styles.container}>
      <QChild1 question = {question_} />
      <QChild2 
        question = {question_}
        questionindex = {questionIndex_}
        showFollowUp = {showFollowUp}
        setShowFollowUp = {setShowFollowUp}
        userAnswers={userAnswers}
        setUserAnswers={setUserAnswers}
        btnStates = {btnStates}
        setBtnStates = {setBtnStates}
       />
      <QChild3 
        question = {question_}
        questionindex = {questionIndex_}
        showFollowUp = {showFollowUp}
        setShowFollowUp = {setShowFollowUp}
        userAnswers = {userAnswers}
        btnStates = {btnStates}
        />
    </div>
  );
};

export default QParent;
/*
const QuestionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  const saveAnswer = (answerToSave) => {
    fetch("http://localhost:5000/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, answer: answerToSave }),
    });
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

  const styles = {
    container: {
      display: "flex",             // Make it a flex container
      flexDirection: "column",     // Stack children vertically
      justifyContent: "flex-end", // Align items to the top (main axis)
      alignItems: "center",     
      marginLeft: "40px",
      padding: "1em",              // Optional: spacing inside the container
      gap: "1em",      
      width : "600px",
      height : "400px",
      overflow : "auto",
    },
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

  const btnStylesNextPrev = {
    container : {
      display : "flex",
      padding : "1em",
      gap : "1em",
      justifyContent : "flex-end",
      alignItems: "center"
    }
  }

  

  return (
    <div className="container">
      <div className="question-box" style={styles.container}>
      <h1>Fråga {question.id}</h1 >
      <p>{question.text}</p>

      //yes and no buttons
      {question.followUp ? (
        <div style = {btnStylesYesNo.container}>
          <button onClick={() => handleAnswer("Ja")}>Ja</button>
          <button onClick={() => handleAnswer("Nej")}>Nej</button>
        </div>
      ) : question.next ? (
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

      {/* Show Follow-Up Question & Input Field }
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

      {/* Back Button }
      <div style = {btnStylesNextPrev.container}>
        <button onClick={handleBack}>← Föregående fråga</button>
        <button onClick={handleNext}>Nästa fråga </button>
        </div>
      </div>
    </div>
  );
};
*/
//export default QuestionPage;
