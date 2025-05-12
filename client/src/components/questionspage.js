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
      width : "50vh",
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
