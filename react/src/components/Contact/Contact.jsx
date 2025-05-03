import { useState, useEffect, useRef } from "react";
import axios from "../../axiosInstance"; 
import EmojiPicker from "emoji-picker-react";
import "./Contact.css";

const Contact = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatBoxRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get("/api/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.data) {
          setMessages(res.data.reverse()); // جعل الرسائل الجديدة تظهر في الأعلى
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [token]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; // التمرير تلقائيًا إلى الأسفل عند تحميل الرسائل
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    if (!token) {
      setError("You must be logged in to send a message.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "/api/messages",
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setMessages([res.data, ...messages]); // إضافة الرسالة الجديدة في الأعلى
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete message.");
    }
  };

  return (
    <section className="contact">
      <h1 className="title">Chat</h1>

      {error && <div className="message error">{error}</div>}

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`message-container ${msg.response ? "admin" : "user"}`}>
            <div className="message-content">
              <p className="message-text">{msg.message}</p>
              {!msg.response && (
                <button className="delete-btn" onClick={() => handleDelete(msg.id)}>🗑️</button>
              )}
            </div>
            {msg.response && <div className="admin-reply">{msg.response}</div>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="box"
            required
            placeholder="Enter your message"
            cols="30"
            rows="2"
          ></textarea>
          <button type="button" className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            😊
          </button>
          {showEmojiPicker && (
            <EmojiPicker onEmojiClick={(emoji) => setMessage((prev) => prev + emoji.emoji)} />
          )}
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </section>
  );
};

export default Contact;
