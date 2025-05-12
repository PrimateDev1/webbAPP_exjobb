import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import allQuestions from "../data/questions.js"; 
import questions from "../data/questions.js";

const FormDone = () => {
  const [answers, setAnswers] = useState({});
  const [aiFeedback, setAiFeedback] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDots, setLoadingDots] = useState("");

  const controllerRef = useRef(null);

  function cleanAndSplit(str) {
    // Remove everything before and including the first colon
    let cleaned = str.includes(':') ? str.split(':').slice(1).join(':') : str;
    if(cleaned === str) return undefined;
    // Split by comma and trim each part
    return cleaned.split(',').map(part => part.trim());
  }

  function splitBeforeColon(str) {
    // Keep everything before the first colon
    const beforeColon = str.includes(':') ? str.split(':')[0] : str;
  
    // Split by comma and trim each part
    return beforeColon.split(',').map(part => part.trim());
  }

  function getAnswerById(id) {
    return answers[id.toString()];
  }

  function answerBuilder(question, summary){
    const main = question.text;
    const qid = question.id;
    const fuarr = question?.followUp?.Ja;
    console.log(qid);
    const ansText = summary[qid];
    console.log(ansText);

    const fuText = cleanAndSplit(ansText); //is undefined sometimes?
    console.log("fuText:" + fuText);
    const ansBinary = splitBeforeColon(ansText);
    let builder = "Fråga: " + main + " Svar:" + ansBinary;
    if (Array.isArray(fuarr) && fuText !== undefined) {
      fuarr.forEach((element, i) => {
        
        console.log(element);
        console.log(Object.values(element));
        
        let tot = ` Följdfråga ${i}: ${Object.values(element)} svar: ${fuText[i]}`;
        builder += tot;
      });
    }
    return builder;
  }

  function makePrompt (ans)  {
    
      return `
        Du är en sjukvårdsrådgivare som granskar svaren från en blodgivare som fyllt i ett hälsodeklarationsformulär.
        
        Du har tillgång till riktlinjer i dokumentet "Hälsodeklarationsfrågor.txt" som beskriver varje fråga och när det krävs ytterligare information. Använd detta dokument som referens.
        Detta är frågan som ställs med svar och eventuella följdfrågor:
        ${ans}
        
        Din uppgift:
        1. Gå igenom frågan och svaret utifrån informationen i dokumentet.
        2. Om svaret är endast ja/nej utan följdfråga, om det då inte går att precisera att svaret är problematiskt ska du anta att svaret är bra!
        3. Om svaret har en följdfråga. Var mer kritisk ifall följdfrågan innehåller information som gör att ett beslut kan fattas om svaret är problematiskt eller inte.
        4. Beskriv vad rätt information borde innehålla, ifall svaret är problematiskt.
        
        Formatera svaret så här:
        
        Skriv frågan här...
        Svar: Skriv användarens svar här.
        Problem (Om det behövs): Svarar "på månen", vilket är otydligt och osammanhängande.
        Rätt information (Om det behövs): Måste specificera tid och plats om man tidigare gett blod.
        
      `;
  }

  

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingDots((prev) => (prev === "..." ? "" : prev + "."));
      }, 500);
    } else {
      setLoadingDots("");
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {

    const controller = new AbortController();
    controllerRef.current = controller;
    const {signal}= controller;

    async function fetchAi() {
          console.log("fetchAi called.....");
          try{
            let res = await fetch("http://localhost:5000/api/answers");
            let data = await res.json();
            setAnswers(data);
            
            let qs = [];
            for(let i = 1; i<=34; i++){
              qs.push(
                questions.find(q => q.id === i)
              );
            }
            console.log("QuestionList:" + qs);
            console.log("Data: " + data);
            let ans = [];
            qs.forEach(q => {
              ans.push(answerBuilder(q, data));
            });
            console.log("Array of Answers:" + ans);
            let prompts = [];
            ans.forEach(a => {
              prompts.push(makePrompt(a));
            });
            
            console.log("Array of prompts: " + prompts);
            const url = "http://localhost:5000/chat";

            const fetchTasks = prompts.map(p => 
              fetch(url, {
                method : 'POST',
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify({message : p}),
                signal,
              }).then(res => res.json())
            );
            console.log("fetchtasks (expected to be an array of promises): " + fetchTasks);
            const responses = await Promise.all(fetchTasks);
            responses.sort();
            setIsLoading(false);
            console.log("THESE ARE THE RESPONSES:"  + responses);
            responses.forEach( r => {
              setAiFeedback(prev => [...prev, r.reply || "Ingen feedback tillgänglig"]);
            });

            
          }catch (err){
            if(err.name === 'AbortError'){
              console.log("ABORT ERROR IN FETCHAI.......");
            }else
            console.error("Another Error in fetchAi (not abort):", err);
          }
    }
    fetchAi();
    return () => {
      controller.abort();
    }
  }, []);

  const cancel = () =>{
    if(controllerRef.current){
      controllerRef.current.abort();
      navigate("/");
    }
    
  }


  const styles = {
    container: {
      display: "flex",             // Make it a flex container
      flexDirection: "column",     // Stack children vertically
      justifyContent: "flex-end", // Align items to the top (main axis)
      alignItems: "center",     // Align items to the left (cross axis)
      marginTop: "2em",
      padding: "1em",              // Optional: spacing inside the container
      gap: "1em",                  // Optional: spacing between child elements
    },
  };

  return (
    <div className="container" style = {styles.container}>
      <h1>Formulär färdigt!</h1>
      <h2>AI-feedback</h2>
      {isLoading ? (
  <p>AI-feedback genereras, var god vänta{loadingDots}</p>
) : (
  <div>
    {aiFeedback.map((res, index) => (
      <div
        key={index}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          backgroundColor: "#f9f9f9",
          whiteSpace: "pre-wrap"
        }}
      >
        <strong>Fråga {index + 1}:</strong>
        <p>{res}</p>
      </div>
    ))}
  </div>
)}
      <button onClick={() => cancel()} style={styles.container}>
        Avsluta granskning
      </button>
    </div>
  );
};

export default FormDone;
