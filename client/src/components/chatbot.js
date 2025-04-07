import React, { useState, useEffect } from "react";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingDots, setLoadingDots] = useState(""); // ✅ State for animated dots

    useEffect(() => {
        let interval;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingDots((prev) => (prev === "..." ? "" : prev + ".")); // ✅ Loop dots: ".", "..", "..."
            }, 500);
        } else {
            setLoadingDots(""); // Reset dots when loading is done
        }

        return () => clearInterval(interval); // Cleanup interval
    }, [isLoading]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true); // ✅ Show loading animation

        try {
            const response = await fetch("http://localhost:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();
            setMessages([...newMessages, { sender: "bot", text: data.reply }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages([...newMessages, { sender: "bot", text: "Error getting response." }]);
        } finally {
            setIsLoading(false); // ✅ Stop animation when response is received
        }
    };

    return (
        <div style={styles.chatbotContainer}>
            <h3 style={styles.chatTitle}>AI-chatbot</h3>
            <div style={styles.chatbox}>
                {messages.map((msg, index) => (
                    <p key={index} style={msg.sender === "user" ? styles.userMessage : styles.botMessage}>
                        <strong>{msg.sender === "user" ? "Du: " : "Bot: "}</strong>{msg.text}
                    </p>
                ))}
                {isLoading && <p style={styles.loading}>Inhämtar svar{loadingDots}</p>} {/* ✅ Animated Loading */}
            </div>
            <input
                style={styles.input}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ställ en fråga..."
                disabled={isLoading}
            />
            <button style={isLoading ? styles.buttonDisabled : styles.button} onClick={sendMessage} disabled={isLoading}>
                {isLoading ? "Laddar..." : "Skicka"}
            </button>
        </div>
    );
};

// ✅ Keep styles as an object inside JavaScript
const styles = {
    chatbotContainer: {
        position: "",
        left: "20px",
        top: "40px",
        width: "300px",
        background: "#fff",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
        zIndex: 1000
    },
    chatTitle: {marginBottom: "10px", textAlign: "center", fontStyle: "bold", fontSize: "18px"},
    chatbox: { maxHeight: "300px", overflowY: "auto", marginBottom: "10px" },
    userMessage: { textAlign: "right", color: "blue" },
    botMessage: { textAlign: "left", color: "green" },
    loading: { textAlign: "center", color: "gray", fontStyle: "italic" }, // ✅ Animated dots style
    input: { width: "80%", padding: "5px", marginBottom: "5px" },
    button: { width: "20%", padding: "5px", background: "blue", color: "white", border: "none", cursor: "pointer" },
    buttonDisabled: { width: "20%", padding: "5px", background: "gray", color: "white", border: "none", cursor: "not-allowed" }
};

export default Chatbot;
