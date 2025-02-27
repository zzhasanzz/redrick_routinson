import { useContext, useState } from 'react'
import './App.scss'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from "./pages/login/Login";
import Blank from "./pages/Blank.jsx";
import {ChakraProvider} from "@chakra-ui/react";
import ForgotPassword from './pages/login/ForgotPassword';

import StudentDashboard from "./pages/home/dashboards/StudentDashbord.jsx";
import StudentRoutine from './pages/features/StudentRoutine.jsx';
import StudentHome from "./pages/home/StudentHome";

import TeacherHome from "./pages/home/TeacherHome";
import TeacherDashboard from "./pages/home/dashboards/TeacherDashboard.jsx";
import TeacherRoutine from "./pages/features/TeacherRoutine.jsx";


import AdminHome from './pages/home/AdminHome.jsx';
import AdminDashboard from './pages/home/dashboards/AdminDashboard.jsx';
import AdminManageRoutine from './pages/features/AdminManageRoutine.jsx';
import AdminGenerateRoutine from './pages/features/AdminGenerateRoutine.jsx';
import AdminManageUsers from './pages/features/AdminManageUsers.jsx';
import AdminGenerateSeatPlan from './pages/features/AdminManageSeatPlan.jsx';
import LostAndFound from './pages/features/LostandFound.jsx';

import Event from "./pages/event/Event.jsx";
import FoodScanner from "./pages/event/Scanner.jsx";
import Redeem from "./pages/event/Redeem.jsx";








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
    <ChakraProvider>
     <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
              path="/admin-home"
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <AdminHome/>
                </RequireAuth>

              }
        >
        <Route
              path="/admin-home/admin-dashboard"
              element={
                <RequireAuth allowedRoles={["admin"]}>
                  <AdminDashboard/>
                </RequireAuth>

              }
        />
            
            <Route path="/admin-home/admin-manage-users" element={
                <RequireAuth allowedRoles={["admin"]}>
                    <AdminManageUsers/>
                </RequireAuth>

            }/>

            <Route path="/admin-home/admin-manage-routine" element={
                <RequireAuth allowedRoles={["admin"]}>
                    <AdminManageRoutine/>
                </RequireAuth>

            }/>

            <Route path="/admin-home/admin-generate-seat-plan" element={
                <RequireAuth allowedRoles={["admin"]}>
                    <AdminGenerateSeatPlan/>
                </RequireAuth>

            }/>
            <Route path="/admin-home/admin-generate-routine" element={
                  <RequireAuth allowedRoles={["admin"]}>
                    <AdminGenerateRoutine/>
                  </RequireAuth>

              }/>
            <Route path="/admin-home/logout" element={
                <RequireAuth allowedRoles={["admin"]}>
                    <Blank/>
                </RequireAuth>

            }/>

        
        </Route>
        <Route path="/student-home" element={
            <RequireAuth allowedRoles={["student"]}>
                  <StudentHome/>
                </RequireAuth>

              }
        >   
            <Route index element={<Blank />} />
            <Route path="/student-home/student-dashboard" element={
                <RequireAuth allowedRoles={["student"]}>
                    <StudentDashboard/>
                </RequireAuth>

            }/>
            <Route path="/student-home/student-routine" element={
                <RequireAuth allowedRoles={["student"]}>
                    <StudentRoutine/>
                </RequireAuth>

            }/>

            <Route path="/student-home/myevents" element={
                <RequireAuth allowedRoles={["student"]}>
                    <Blank/>
                </RequireAuth>

            }/>

            <Route path="/student-home/lost-and-found" element={
                <RequireAuth allowedRoles={["student"]}>
                   <LostAndFound/>
                </RequireAuth>

            }/>

            <Route path="/student-home/calendar" element={
                <RequireAuth allowedRoles={["student"]}>
                    <Blank/>
                </RequireAuth>

            }/>

            <Route path="/student-home/user" element={
                <RequireAuth allowedRoles={["student"]}>
                    <Blank/>
                </RequireAuth>

            }/>
            <Route path="/student-home/event" element={
                <RequireAuth allowedRoles={["student"]}>
                    <Event/>
                </RequireAuth>

            }/>

            <Route path="/student-home/scanner" element={
                <RequireAuth allowedRoles={["student"]}>
                    <FoodScanner/>
                </RequireAuth>

            }/>


            <Route path="/student-home/logout" element={
                <RequireAuth allowedRoles={["student"]}>
                    <Blank/>
                </RequireAuth>

            }/>

        </Route>

          <Route path="/teacher-home" element={
              <RequireAuth allowedRoles={["teacher"]}>
                  <TeacherHome/>
              </RequireAuth>

          }
          >     
              
              <Route index element={<Blank />} />
              <Route path="/teacher-home/teacher-dashboard" element={
                  <RequireAuth allowedRoles={["teacher"]}>
                      <TeacherDashboard/>
                  </RequireAuth>
              }/>

             
              
              <Route path="/teacher-home/myevents" element={
                  <RequireAuth allowedRoles={["teacher"]}>
                      <Blank/>
                  </RequireAuth>

              }/>
              <Route path="/teacher-home/teacher-routine" element={
                  <RequireAuth allowedRoles={["teacher"]}>
                    <TeacherRoutine/>
                  </RequireAuth>

              }/>

              <Route path="/teacher-home/calendar" element={
                  <RequireAuth allowedRoles={["teacher"]}>
                      <Blank/>
                  </RequireAuth>

              }/>

              <Route path="/teacher-home/user" element={
                  <RequireAuth allowedRoles={["teacher"]}>
                      <Blank/>
                  </RequireAuth>

              }/>
              <Route path="/teacher-home/logout" element={
                  <RequireAuth allowedRoles={["teacher"]}>
                      <Blank/>
                  </RequireAuth>

              }/>

          </Route>

          <Route path="/redeem" element={<Redeem/>} />

      </Routes>
    </Router>

    </ChakraProvider>
  )
}

export default App