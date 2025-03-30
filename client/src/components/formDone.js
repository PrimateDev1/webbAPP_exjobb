import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import allQuestions from "../data/questions.js"; 

const FormDone = () => {
  const [answers, setAnswers] = useState({});
  const [aiFeedback, setAiFeedback] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDots, setLoadingDots] = useState("");

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
    async function getAnswersAndFeedback() {
      setIsLoading(true);

      try {
        const res = await fetch("http://localhost:5000/api/answers");
        const data = await res.json();
        setAnswers(data);

        const summary = Object.entries(data)
  .map(([id, answer]) => {
    const q = allQuestions.find((q) => q.id.toString() === id);
    if (!q) return `Fråga ${id}: ${answer}`;

    let result = `Fråga ${id}: ${q.text}\nSvar: ${answer}`;
    return result;
  })
  .join("\n\n");

  const prompt = `
  Du är en sjukvårdsrådgivare som granskar svaren från en blodgivare som fyllt i ett hälsodeklarationsformulär.
  
  Du har tillgång till riktlinjer i dokumentet "questions_db.txt" som beskriver varje fråga och när det krävs ytterligare information. Använd detta dokument som referens.
  
  Här är blodgivarens svar:
  ${summary}
  
  Din uppgift:
  1. Identifiera endast de frågor där svaret verkar:
     - felaktigt
     - otydligt
     - saknar obligatorisk information enligt reglerna i dokumentet
  2. Förklara kortfattat varför svaret är problematiskt.
  3. Beskriv vad rätt information borde innehålla.
  4. Lista endast problematiska svar – ignorera helt korrekta svar.
  
  Formatera svaret så här:
  
  Fråga 2:
  Problem: Svarar "på månen", vilket är otydligt och osammanhängande.
  Rätt information: Måste specificera tid och plats om man tidigare gett blod.
  
  Lista inget om alla svar är korrekta. Om allt verkar korrekt, skriv exakt:
  "Alla svar verkar vara korrekta."
  `;
  

        const chatRes = await fetch("http://localhost:5000/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt }),
        });

        const chatData = await chatRes.json();
        setAiFeedback(chatData.reply || "Ingen feedback tillgänglig.");
      } catch (err) {
        console.error("❌ Error:", err);
        setAiFeedback("Kunde inte hämta AI-feedback.");
      }

      setIsLoading(false);
    }

    getAnswersAndFeedback();
  }, []);

  return (
    <div className="container">
      <h1>Formulär färdigt!</h1>
      <h2>AI-feedback</h2>
      {isLoading ? (
        <p>AI-feedback genereras{loadingDots}</p>
      ) : (
        <pre>{aiFeedback}</pre>
      )}
      <button onClick={() => navigate("/")} style={{ marginTop: "2em" }}>
        Avsluta granskning
      </button>
    </div>
  );
};

export default FormDone;
