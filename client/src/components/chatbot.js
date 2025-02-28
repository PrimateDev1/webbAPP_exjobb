import React, { useState } from "react";

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { sender: "user", text: input }];
        setMessages(newMessages);
        setInput("");

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
        }
    };

    return (
        <div style={styles.chatbotContainer}>
            <div style={styles.chatbox}>
                {messages.map((msg, index) => (
                    <p key={index} style={msg.sender === "user" ? styles.userMessage : styles.botMessage}>
                        <strong>{msg.sender === "user" ? "You: " : "Bot: "}</strong>{msg.text}
                    </p>
                ))}
            </div>
            <input
                style={styles.input}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me something..."
            />
            <button style={styles.button} onClick={sendMessage}>Send</button>
        </div>
    );
};

// ✅ Define `styles` object to prevent "styles is not defined" error
const styles = {
    chatbotContainer: {
        position: "fixed", bottom: "20px", right: "20px",
        width: "300px", background: "#fff", padding: "10px",
        border: "1px solid #ccc", borderRadius: "5px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
        zIndex: 1000
    },
    chatbox: { maxHeight: "300px", overflowY: "auto", marginBottom: "10px" },
    userMessage: { textAlign: "right", color: "blue" },
    botMessage: { textAlign: "left", color: "green" },
    input: { width: "80%", padding: "5px", marginBottom: "5px" },
    button: { width: "20%", padding: "5px", background: "blue", color: "white", border: "none", cursor: "pointer" }
};

export default Chatbot;
