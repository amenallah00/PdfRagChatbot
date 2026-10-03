import { useEffect, useRef, useState } from "react";
import MatrixRain from "./components/MatrixRain.jsx";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const pushMessage = (message) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), time: new Date(), ...message },
    ]);
  };

  const askQuestion = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();
    pushMessage({ role: "user", content: userQuestion });
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();

      pushMessage({
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      });
    } catch (error) {
      console.error(error);
      pushMessage({
        role: "error",
        content:
          "connection refused — could not reach the backend at " +
          API_BASE,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askQuestion();
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      pushMessage({
        role: "error",
        content: `"${file.name}" rejected — only .pdf files are accepted`,
      });
      return;
    }

    setUploading(true);
    pushMessage({ role: "system", content: `indexing ${file.name} ...` });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("upload failed");

      const data = await response.json();
      setDocument({
        name: data.filename,
        pages: data.pages,
        chunks: data.chunks,
      });

      pushMessage({
        role: "system",
        content: `indexed ${data.filename} — ${data.pages} pages, ${data.chunks} chunks. ready for questions.`,
      });
    } catch (error) {
      console.error(error);
      pushMessage({
        role: "error",
        content: `failed to index "${file.name}" — check that the backend is running`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFilePick = (event) => {
    const file = event.target.files?.[0];
    uploadFile(file);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    uploadFile(file);
  };

  const clearChat = () => setMessages([]);

  const promptFor = (role) => {
    if (role === "user") return "guest@you";
    if (role === "assistant") return "rag-bot";
    if (role === "error") return "err";
    return "sys";
  };

  return (
    <div className="app">
      <MatrixRain />

      <div className="terminal-window">
        <div className="terminal-titlebar">
          <div className="terminal-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <div className="terminal-title">
            root@rag-chatbot: ~/{document ? document.name : "no-document-loaded"}
          </div>
          <div className="terminal-status">
            <span className="status-dot" />
            online
          </div>
        </div>

        <div className="terminal-body">
          <aside className="sidebar">
            <div className="sidebar-label">// document source</div>

            <label
              className={`upload-zone ${isDragging ? "is-dragging" : ""} ${
                uploading ? "is-uploading" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFilePick}
                hidden
              />
              <span className="upload-icon">{uploading ? "⟲" : "⇪"}</span>
              <span className="upload-text">
                {uploading
                  ? "indexing..."
                  : "drop .pdf here or click to upload"}
              </span>
            </label>

            <div className="sidebar-label">// index status</div>
            <div className="doc-status">
              {document ? (
                <ul className="doc-meta">
                  <li>
                    <span>file</span>
                    <span title={document.name}>{document.name}</span>
                  </li>
                  <li>
                    <span>pages</span>
                    <span>{document.pages}</span>
                  </li>
                  <li>
                    <span>chunks</span>
                    <span>{document.chunks}</span>
                  </li>
                </ul>
              ) : (
                <p className="doc-empty">no document indexed yet</p>
              )}
            </div>

            <button
              type="button"
              className="ghost-btn"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              clear session
            </button>
          </aside>

          <main className="chat-main">
            <div className="messages">
              {messages.length === 0 && (
                <div className="welcome">
                  <pre className="ascii-banner" aria-hidden="true">{String.raw`
██████╗  █████╗  ██████╗       ██████╗  █████╗  ██████╗
██╔══██╗██╔══██╗██╔════╝       ██╔══██╗██╔══██╗██╔════╝
██████╔╝███████║██║  ███╗█████╗██████╔╝███████║██║  ███╗
██╔══██╗██╔══██║██║   ██║╚════╝██╔══██╗██╔══██║██║   ██║
██║  ██║██║  ██║╚██████╔╝      ██║  ██║██║  ██║╚██████╔╝
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝       ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝
`}</pre>
                  <p>
                    upload a pdf on the left, then ask anything about it.
                  </p>
                  <p className="welcome-hint">
                    try: <span>&quot;summarize this document&quot;</span>
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className="message-meta">
                    <span className="message-prompt">
                      {promptFor(message.role)}
                      <span className="prompt-symbol">
                        {message.role === "user" ? " $" : " ~#"}
                      </span>
                    </span>
                    <span className="message-time">
                      {formatTime(message.time)}
                    </span>
                  </div>

                  <div className="message-content">{message.content}</div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="sources-list">
                      {message.sources.map((source, idx) => (
                        <span className="source-chip" key={idx}>
                          📄 {source.source} · p.{source.page}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  <div className="message-meta">
                    <span className="message-prompt">
                      rag-bot<span className="prompt-symbol"> ~#</span>
                    </span>
                  </div>
                  <div className="message-content typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="composer">
              <span className="composer-prompt">guest@you $</span>
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="ask a question about the pdf..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="send-btn"
                onClick={askQuestion}
                disabled={loading || !question.trim()}
              >
                run ⏎
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
