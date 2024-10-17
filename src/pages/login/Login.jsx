import { useContext, useState, useEffect } from "react";
import './login.scss';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const Login = () => {
  // State management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    if (location.state && location.state.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear the error when email is changed
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError(""); // Clear the error when password is changed
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const userRole = userData.role;

        dispatch({ type: "LOGIN", payload: { user, role: userRole } });

        if (userRole === "teacher") {
          navigate("/teacher-home/teacher-dashboard");
        } else if (userRole === "admin") {
          navigate("/admin-home/admin-dashboard");
        } else if (userRole === "student") {
          navigate("/student-home/student-dashboard");
        }
      } else {
        navigate("/login", { state: { error: "No account associated with this email." } });
      }
    } catch (error) {
      switch (error.code) {
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        default:
          setError("Failed to login. Please check your credentials.");
      }
      setLoggingIn(false);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setEmail("");
    setPassword("");
    setError("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const userRole = userData.role;

        dispatch({ type: "LOGIN", payload: { user, role: userRole } });

        if (userRole === "teacher") {
          navigate("/teacher-home/teacher-dashboard");
        } else if (userRole === "student") {
          navigate("/student-home/student-dashboard");
        } else if (userRole === "admin") {
          navigate("/admin-home/admin-dashboard");
        }
      } else {
        setError("Email not found in the database.");
        await auth.signOut();
      }
    } catch (error) {
      setError("Failed to sign in with Google.");
    } finally {
      setSigningIn(false);
    }
  };

  const handleForgetPassword = () => {
    navigate("/forgot-password");
  };

  return (
      <div className="login">
        <div className="form-container">
          <div className="form-section">
            <h2>RoutineSon</h2>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Email" value={email} onChange={handleEmailChange} required />
              <input type="password" placeholder="Password" value={password} onChange={handlePasswordChange} required />
              <button type="submit" disabled={loggingIn}>{loggingIn ? "Logging in..." : "Login"}</button>
              {error && <span className="error">{error}</span>}
              <button onClick={handleGoogleLogin} disabled={signingIn}>
                {signingIn ? "Signing in..." : "Sign in with Google"}
              </button>
            </form>
            <div className="login-buttons">
              <span className="forgot-password-link" onClick={handleForgetPassword}>Forgot Password?</span>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;
