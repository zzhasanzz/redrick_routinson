import React, { useRef, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../firebase"; // Import Firestore database
import { getDoc, doc } from "firebase/firestore"; // Import Firestore functions
import { Link } from "react-router-dom";
import "./forgotPassword.css"; // Apply your styles here

export default function ForgotPassword() {
  const emailRef = useRef();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const email = emailRef.current.value;

    try {
      setMessage("");
      setError("");
      setLoading(true);

      // Check if the email exists in Firestore database
      const docRef = doc(db, "users", email); // Assuming "users" is your collection and email is the document ID
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // If the email is not in Firestore
        setError("This email is not registered.");
      } else {
        // Send password reset email if email exists in Firestore
        await sendPasswordResetEmail(auth, email);
        setMessage("Check your inbox for further instructions");
      }
    } catch (err) {
      setError("Failed to reset password. Try again later.");
    }

    setLoading(false);
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password-card">
        <h2>Password Reset</h2>
        {error && <div className="warning-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            ref={emailRef}
            placeholder="Enter your email"
            required
          />
          <button disabled={loading} type="submit">
            {loading ? "Loading..." : "Reset Password"}
          </button>
        </form>
        <div className="link">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
