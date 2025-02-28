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

  // Reset state when moving to a new question
  useEffect(() => {
    setShowFollowUp(false);
    setUserAnswer("");
  }, [id]);

  if (!question) {
    return <h2>Frågan finns inte.</h2>;
  }

  const handleNext = () => {
    navigate(`/question/${question.next}`);
  };

  const handleAnswer = (answer) => {
    if (question.followUp && question.followUp[answer]) {
      setShowFollowUp(true);
    } else if (question.next) {
      navigate(`/question/${question.next}`);
    }
  };

  return (
    <div className="container">
      <h1>Fråga {question.id}</h1>
      <p>{question.text}</p>

      {/* Yes/No Buttons */}
      {question.followUp ? (
        <div>
          <button onClick={() => handleAnswer("yes")}>Ja</button>
          <button onClick={() => handleAnswer("no")}>Nej</button>
        </div>
      ) : (
        <button onClick={handleNext}>Nästa fråga</button>
      )}

      {/* Show Follow-Up Question & Input Field */}
      {showFollowUp && (
        <div>
          <p>{question.followUp["yes"]}</p>
          <input
            type="text"
            placeholder="Skriv ditt svar här..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
          <button onClick={handleNext}>Nästa fråga</button>
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
