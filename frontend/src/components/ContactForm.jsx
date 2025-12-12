import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
 

export default function ContactForm({ visible = false, onClose = () => {} }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const closeTimeout = useRef(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      // clear transient state when collapsed
      setStatus(null);
      setLoading(false);
    }
    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
        closeTimeout.current = null;
      }
    };
  }, [visible]);

  if (!visible) return null;

  const handleSend = () => {
    if (!name || !email || !message) {
      setStatus("error");
      return;
    }

    setStatus(null);
    setLoading(true);
    axios.post("/api/contact", { name, subject, email, message })
      .then(() => {
        setStatus("success");
        setName("");
        setSubject("");
        setEmail("");
        setMessage("");
        // show success briefly then close the form
        closeTimeout.current = setTimeout(() => {
          setStatus(null);
          onClose();
        }, 700);
      })
      .catch((err) => {
        console.error("Contact send error:", err);
        setStatus("error");
      })
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    setName("");
    setSubject("");
    setEmail("");
    setMessage("");
    setStatus(null);
    onClose();
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Us</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Subject (optional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          className="border rounded px-3 py-2 w-full md:col-span-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          className="border rounded px-3 py-2 w-full md:col-span-2 h-32 resize-none"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}`}
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>

        <button
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </button>

        {status === "success" && (
          <p className="text-sm text-green-600 ml-3">Message sent — thanks!</p>
        )}

        {status === "error" && (
          <p className="text-sm text-red-600 ml-3">Failed to send — please check fields and try again.</p>
        )}
      </div>
    </div>
  );
}
