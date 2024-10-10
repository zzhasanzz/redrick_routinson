import { useContext, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import { AuthContext } from './context/AuthContext';

function App() {
  
  const{currentUser} = useContext(AuthContext)

  const RequireAuth = ({children})=>{
    return currentUser ? (children) : <Navigate to="/login"/>
  }

  console.log("hello")

  return (
    <>
     <Router>
      <Routes>
      <Route path="/">
      
        <Route path="/login" element={<Login />} />

        <Route
              index
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
        />

      </Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
