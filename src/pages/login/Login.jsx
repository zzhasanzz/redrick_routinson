import { useContext, useState } from "react";
import "./login.css"
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";


const Login = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const navigate = useNavigate()

  const { dispatch } = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Log the user in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user role from Firestore
      const docRef = doc(db, "users", user.email);  // Corrected variable
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const userRole = userData.role;

        dispatch({type:"LOGIN" , payload: {user , role: userRole}});

        // Navigate based on user role
        if (userRole === "teacher") {
          navigate("/teacher-home");
        } else {
          navigate("/student-home");
        }
      } else {
        console.log("No such data");
        setError(true);
      }
    } catch (error) {
      console.log(error);
      setError(true);
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="email" onChange={e => setEmail(e.target.value)}></input>
        <input type="password" placeholder="password" onChange={e => setPassword(e.target.value)}></input>
        <button type="submit">Login</button>
        {error && <span>Wrong Credentials!</span>}
      </form>
    </div>
  )
}

export default Login;