import { useContext, useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from "./pages/login/Login";
import StudentHome from "./pages/home/StudentHome";
import TeacherHome from "./pages/home/TeacherHome";
import { AuthContext } from './context/AuthContext';

function App() {
  
  const{currentUser ,role} = useContext(AuthContext)

  const RequireAuth = ({children, allowedRoles})=>{
    if(!currentUser){
      return<Navigate to="/login"/>;
    }
    if(!allowedRoles.includes(role)){
      return<Navigate to="/login"/>;
    }
    return children;
  }

  console.log(currentUser)

  return (
    <>
     <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} />

        <Route
              path="/student-home"
              element={
                <RequireAuth allowedRoles={["student"]}>
                  <StudentHome/>
                </RequireAuth>

              }
        />
        <Route
              path="/teacher-home"
              element={
                <RequireAuth allowedRoles={["teacher"]}>
                  <TeacherHome/>
                </RequireAuth>

              }
        />
      </Routes>
    </Router>
    </>
  )
}

export default App
