import { Navigate, Outlet } from "react-router-dom";
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, SimpleGrid, Button, Icon, Text } from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaComments,
  FaClipboardList,
  FaBoxOpen,
  FaChair,
  FaBook,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import { db, collection, doc, setDoc } from "../../firebase.js";
import "./adminGenerateSeatPlan.css"; // Import the CSS file
import { getFirestore } from "firebase/firestore";
import { useState } from "react";




// export const generateSeatPlanInFirebase = async () => {
//     try {
//         console.log("Generating seat plan data in Firebase...")
//         const departmentsWith60Students = ["IPE", "SWE", "TVE", "BTM"];
//         const departments = ["CSE", "EEE", "CEE", "MPE","IPE", "SWE", "TVE", "BTM"];
//         const semesters = [1, 3, 5, 7]
//         for(const department of departments)
//         {
//             console.log(department);

//             for(const semester of semesters)
//             {
//                 let studentCount = departmentsWith60Students.includes(department) ? 60:120;
//                 if(department == "EEE")
//                 {
//                     studentCount = 180;
//                 }

//                 let studentID = "";
//                 if(semester == 1)
//                 {
//                     studentID = studentID + "2300";
//                 }
//                 else if(semester == 3)
//                 {
//                     studentID = studentID + "2200";
//                 }
//                 else if(semester == 5)
//                 {
//                     studentID = studentID + "2100";
//                 }
//                 else
//                 {
//                     studentID = studentID + "2000";
//                 }

//                 if(department == "MPE")
//                 {
//                     studentID = studentID + "11";
//                 }
//                 else if(department == "IPE")
//                 {
//                     studentID = studentID + "12";
//                 }
//                 else if(department == "EEE")
//                 {
//                     studentID = studentID + "21";
//                 }
//                 else if(department == "CEE")
//                 {
//                     studentID = studentID + "51";
//                 }
//                 else if(department == "CSE")
//                 {
//                     studentID = studentID + "41";
//                 }
//                 else if(department == "SWE")
//                 {
//                     studentID = studentID + "42";
//                 }
//                 else if(department == "TVE")
//                 {
//                     studentID = studentID + "32";
//                 }
//                 else if(department == "BTM")
//                 {
//                     studentID = studentID + "61";
//                 }

//                 for(let i=1; i<=studentCount; i++)
//                 {
//                     let fullSID = "";
//                     let first9Digits = "";
//                     if(i<10)
//                     {
//                         first9Digits = first9Digits + "0";
//                     }
//                     if(i>60 && i<70)
//                     {
//                         first9Digits = first9Digits + "0";
//                     }
//                     if(i>120 && i<130)
//                     {
//                         first9Digits = first9Digits + "0";
//                     }

//                     if(studentCount <61)
//                     {
//                         fullSID = studentID + "0" +first9Digits+ i.toString();
//                     }
//                     else if(i<61)
//                     {
//                         fullSID = studentID + "1" +first9Digits+ i.toString();
//                     }
//                     else if(i<121)
//                     {
//                         fullSID = studentID + "2" +first9Digits+ (i-60).toString();
//                     }
//                     else
//                     {
//                         fullSID = studentID + "3" +first9Digits+ (i-120).toString();
//                     }

//                     const usersRef = doc(db, `seat_plan_USERS`, `${department.toLowerCase()}_sem${semester}_id${fullSID}_@gmail.com`)
//                     await setDoc(usersRef, {id : fullSID, dept: department, semester: semester, role: "student", isPresident: false, displayName:`Tanjil${fullSID}`});
//                 }
//             }
//         }

//         console.log("✅ Seat plan data successfully added to Firebase!");
//     } catch (error) {
//         console.error("❌ Error generating seat plan in Firebase:", error);
//         throw error;
//     }
// };



const GenerateSeatPlan = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

const handleSeatPlanSummerClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:5000/api/seat-plan-admin-summer");
  
      console.log("✅ Full Response:", response.data); // Debug entire response
  
      // If you want to trigger Firebase function after fetching seat plans:
      // await generateSeatPlanInFirebase();
      setMessage("✅ Summer seat plan successfully generated!");
    } catch (error) {
      console.error(
        "❌ Error in seat plan admin frontend: ",
        error.response?.data?.message || error.message
      );
      setMessage("❌ Failed to generate Summer seat plan. Try again.");
    }
    setLoading(false);
    // if(loading == false && message == "✅ Summer seat plan successfully generated!")
    // {
    //   setTimeout(() => navigate('/admin-home/admin-manage-seat-plan'));
    // }
  };
  const handleSeatPlanWinterClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:5000/api/seat-plan-admin-winter");
  
      console.log("✅ Full Response:", response.data); // Debug entire response
  
      // If you want to trigger Firebase function after fetching seat plans:
      // await generateSeatPlanInFirebase();
      setMessage("✅ Winter seat plan successfully generated!");

    } catch (error) {
      console.error(
        "❌ Error in seat plan admin frontend: ",
        error.response?.data?.message || error.message
      );
      setMessage("❌ Failed to generate Summer seat plan. Try again.");

    }
    setLoading(false);
    // if(loading == false && message == "✅ Winter seat plan successfully generated!")
    //   {
    //     setTimeout(() => navigate('/admin-home/admin-manage-seat-plan'));
    //   }
  };
  useEffect(() => {
    if (message.includes("successfully generated")) {
        setTimeout(() => navigate('/admin-home/admin-manage-seat-plan'));
    }
  }, [message, navigate]);

    return (
        <div className="container">
            <h1 className="title">Generate Seat Plan</h1>
            {/* Loading Screen */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Generating Seat Plan, please wait...</p>
                </div>
            )}
            <div className="button-container">
                <button onClick={handleSeatPlanSummerClick} className="button summer">Summer Semester</button>
                <button onClick={handleSeatPlanWinterClick} className="button winter">Winter Semester</button>
            </div>
            {/* Success/Error Message */}
            {message && <p className="status-message">{message}</p>}
        </div>
    );
};

export default GenerateSeatPlan;
