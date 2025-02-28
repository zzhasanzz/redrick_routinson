import { Outlet } from "react-router-dom";
import React from "react";
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
import { db, collection, doc, setDoc } from "../../../firebase.js";

const handleGenerateRoutine = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5000/admin-home/admin-dashboard"
    );

    console.log(response.data.message); // Log the success message
    // Navigate to the new window (you can specify your target URL)
    window.open("/admin-home/admin-generate-routine"); // Adjust the URL as needed
  } catch (error) {
    console.error("Error generating routine:", error.response.data.error);
  }
};

const handleSeatPlanClick = async () => {
  try {
    const response = await axios.post("http://localhost:5000/api/seat-plan");

    console.log("✅ Full Response:", response.data); // Debug entire response

    // If you want to trigger Firebase function after fetching seat plans:
    // await generateSeatPlanInFirebase();
  } catch (error) {
    console.error(
      "❌ Error in seat plan admin frontend: ",
      error.response?.data?.message || error.message
    );
  }
};

// export const generateSeatPlanInFirebase = async () => {
//     try {
//         console.log("Generating seat plan data in Firebase...")
//         const departmentsWith60Students = ["IPE", "SWE", "TVE"];
//         const departments = ["CSE", "EEE", "CEE", "MPE","IPE", "SWE", "TVE"];
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
//                     studentID = studentID + "2100";
//                 }
//                 else if(semester == 3)
//                 {
//                     studentID = studentID + "2000";
//                 }
//                 else if(semester == 5)
//                 {
//                     studentID = studentID + "1900";
//                 }
//                 else
//                 {
//                     studentID = studentID + "1800";
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
//                     studentID = studentID + "31";
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
//                     studentID = studentID + "51";
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

//                     const usersRef = doc(db, `seat_plan_USERS`, `${department}_sem${semester}_id${fullSID}_@gmail.com`)
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

const AdminDashboard = () => {
  return (
    <>
      <Box p={8}>
        <Text fontSize="4xl" mb={10} textAlign="left" fontWeight="bold">
          Admin
        </Text>
        <SimpleGrid columns={[1, 2, 3]} spacing={8} justifyItems="center">
          <Link to="/admin-home/admin-view-routine">
            <Button
              height="250px"
              width={["100%", "450px"]}
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              bg="gray.100"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
              boxShadow="md"
            >
              <Icon as={FaCalendarAlt} boxSize={20} color="gray.700" />
              <Text fontSize="2xl" fontWeight="600" color="gray.700">
                Class Routine
              </Text>
            </Button>
          </Link>

          <Link to="/forum">
            <Button
              height="250px"
              width={["100%", "450px"]}
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              bg="gray.100"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
              boxShadow="md"
            >
              <Icon as={FaComments} boxSize={20} color="gray.700" />
              <Text fontSize="2xl" fontWeight="600" color="gray.700">
                Forum
              </Text>
            </Button>
          </Link>

          <Link to="/event">
            <Button
              height="250px"
              width={["100%", "450px"]}
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              bg="gray.100"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
              boxShadow="md"
            >
              <Icon as={FaClipboardList} boxSize={20} color="gray.700" />
              <Text fontSize="2xl" fontWeight="600" color="gray.700">
                Event
              </Text>
            </Button>
          </Link>

          <Link to="/lost-and-found">
            <Button
              height="250px"
              width={["100%", "450px"]}
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              bg="gray.100"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
              boxShadow="md"
            >
              <Icon as={FaBoxOpen} boxSize={20} color="gray.700" />
              <Text fontSize="2xl" fontWeight="600" color="gray.700">
                Lost and Found
              </Text>
            </Button>
          </Link>

          <Link to="/seat-plan">
            <Button
              height="250px"
              width={["100%", "450px"]}
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              bg="gray.100"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
              boxShadow="md"
              //onClick={handleSeatPlanClick}
            >
              <Icon as={FaChair} boxSize={20} color="gray.700" />
              <Text fontSize="2xl" fontWeight="600" color="gray.700">
                Seat Plan
              </Text>
            </Button>
          </Link>

          <Link to="/admin-home/admin-generate-routine">
            <Button
              height="250px"
              width={["100%", "450px"]}
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              bg="gray.100"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
              boxShadow="md"
              onClick={handleGenerateRoutine}
            >
              <Icon as={FaBook} boxSize={20} color="gray.700" />
              <Text fontSize="2xl" fontWeight="600" color="gray.700">
                Generate Routine
              </Text>
            </Button>
          </Link>
        </SimpleGrid>
      </Box>
    </>
  );
};

export default AdminDashboard;
