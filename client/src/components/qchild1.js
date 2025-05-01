
import { useParams, useNavigate } from "react-router-dom";
import questions from "../data/questions.js";


const QChild1 = ({question}) => {


  
  const { id } = useParams();
  const navigate = useNavigate();

  const styles1 = {
    container: {
      display: "flex",             // Make it a flex container
      flexDirection: "column",     // Stack children vertically
      justifyContent: "flex-start", // Align items to the top (main axis)
      alignItems: "center",     
      marginLeft: "40px",
      padding: "1em",              // Optional: spacing inside the container
      gap: "0em",      
      width : "600px",
      height : "170px",
      overflow : "auto",
      backgroundColor : "#87CEEB",
      border : "3px solid black"
    },
    text : {
      lineHeight : "1.5",
      margin: 0.3,
    }
  };

  if (!question) {
    return <h2>Frågan finns inte.</h2>;
  }

  return(
  <div className="container">
    <div className="question-box" style={styles1.container}>
        <h1 style={styles1.text}>Fråga {question.id}</h1 >
        <p style={styles1.text}>{question.text}</p>
    </div>
  </div>);
}

export default QChild1;