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

// const handleGenerateRoutine = async () => {
//   try {
//     const response = await axios.post(
//       "http://localhost:5000/admin-home/admin-dashboard"
//     );

//     console.log(response.data.message); // Log the success message
//     // Navigate to the new window (you can specify your target URL)
//     window.open("/admin-home/admin-generate-routine"); // Adjust the URL as needed
//   } catch (error) {
//     console.error("Error generating routine:", error.response.data.error);
//   }
// };



const AdminDashboard = () => {
  return (
    <>
      <Box 
        p={0} // Removes all padding from Box
        m={0} // Removes all margin from Box
        height="100vh" // Full viewport height
        backgroundImage="url('../assets/background2.png')" // Path to your background image
        backgroundSize="cover" // Ensures the image covers the entire container
        backgroundPosition="center" // Centers the image
        backgroundRepeat="no-repeat" // Prevents repeating
      >
        <SimpleGrid columns={[1, 2, 3]} spacing={8} justifyItems="center">
          <Link to="/admin-home/admin-view-routine">
            <Button
              height="250px"
              width="450px"
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              backgroundColor="#edf8fb"
              backgroundImage="url('../assets/view_routine_admin.png')"
              backgroundSize="cover"
              border="2px solid rgba(255, 255, 255, 0.7)"
              color="black"
              _hover={{
                backgroundColor: "#bedee9",
                transform: "scale(1.05)",
                transition: "all 0.3s ease"
              }}
              _active={{
                backgroundColor: "rgba(255, 255, 255, 0.3)"
              }}
            >

            </Button>
          </Link>

          <Link to="/admin-home/admin-statistics">
            <Button
              height="250px"
              width="450px"
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              backgroundColor="#edf8fb"
              backgroundImage="url('../assets/admin_stats.png')"
              backgroundSize="cover"
              border="2px solid rgba(255, 255, 255, 0.7)"
              color="black"
              _hover={{
                backgroundColor: "#bedee9",
                transform: "scale(1.05)",
                transition: "all 0.3s ease"
              }}
              _active={{
                backgroundColor: "rgba(255, 255, 255, 0.3)"
              }}
            >

            </Button>
          </Link>

          <Link to="/admin-home/event">
            <Button
              height="250px"
              width="450px"
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              backgroundColor="#edf8fb"
              backgroundImage="url('../assets/event_button.png')"
              backgroundSize="cover"
              border="2px solid rgba(255, 255, 255, 0.7)"
              color="black"
              _hover={{
                backgroundColor: "#bedee9",
                transform: "scale(1.05)",
                transition: "all 0.3s ease"
              }}
              _active={{
                backgroundColor: "rgba(255, 255, 255, 0.3)"
              }}
            >

            </Button>
          </Link>

          <Link to="/admin-home/admin-manage-users">
            <Button
              height="250px"
              width="450px"
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              backgroundColor="#edf8fb"
              backgroundImage="url('../assets/manage_users.png')"
              backgroundSize="cover"
              border="2px solid rgba(255, 255, 255, 0.7)"
              color="black"
              _hover={{
                backgroundColor: "#bedee9",
                transform: "scale(1.05)",
                transition: "all 0.3s ease"
              }}
              _active={{
                backgroundColor: "rgba(255, 255, 255, 0.3)"
              }}
            >

            </Button>
          </Link>

          <Link to="/admin-home/admin-generate-seat-plan">
            <Button
              height="250px"
              width="450px"
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              backgroundColor="#edf8fb"
              backgroundImage="url('../assets/seat_plan_button.png')"
              backgroundSize="cover"
              border="2px solid rgba(255, 255, 255, 0.7)"
              color="black"
              _hover={{
                backgroundColor: "#bedee9",
                transform: "scale(1.05)",
                transition: "all 0.3s ease"
              }}
              _active={{
                backgroundColor: "rgba(255, 255, 255, 0.3)"
              }}
            >

            </Button>
          </Link>

          <Link to="/admin-home/admin-generate-routine">
            <Button
              height="250px"
              width="450px"
              flexDirection="column"
              justifyContent="center"
              borderRadius="30px"
              backgroundColor="#edf8fb"
              backgroundImage="url('../assets/generate_routine.png')"
              backgroundSize="cover"
              border="2px solid rgba(255, 255, 255, 0.7)"
              color="black"
              _hover={{
                backgroundColor: "#bedee9",
                transform: "scale(1.05)",
                transition: "all 0.3s ease"
              }}
              _active={{
                backgroundColor: "rgba(255, 255, 255, 0.3)"
              }}
            >

            </Button>
          </Link>
        </SimpleGrid>
      </Box>
    </>
  );
};

export default AdminDashboard;
