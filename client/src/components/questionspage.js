import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";

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

  return (
    <div className="container">
      <h1>Fråga {question.id}</h1>
      <p>{question.text}</p>

      {/* Yes/No Buttons */}
      {question.followUp ? (
        <div>
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

      {/* Show Follow-Up Question & Input Field */}
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

      {/* Back Button */}
      <div style={{ marginTop: "1em" }}>
        <button onClick={handleBack}>← Föregående fråga</button>
      </div>
    </div>
  );
};

export default QuestionPage;
