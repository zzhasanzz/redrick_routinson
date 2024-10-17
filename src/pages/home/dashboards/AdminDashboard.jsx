import { Outlet } from "react-router-dom";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, SimpleGrid, Button, Icon, Text } from "@chakra-ui/react";
import { FaCalendarAlt, FaComments, FaClipboardList, FaBoxOpen, FaChair, FaBook } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const handleGenerateRoutine = async () => {
    try {
        const response = await axios.post('http://localhost:5000/admin-home/admin-dashboard');

        console.log(response.data.message); // Log the success message
        // Navigate to the new window (you can specify your target URL)
        window.open('/admin-home/admin-generate-routine'); // Adjust the URL as needed
    } catch (error) {
        console.error('Error generating routine:', error.response.data.error);
    }
};


const AdminDashboard = () => {
    return (<>
    <Box p={8}>
        <Text fontSize="4xl" mb={10} textAlign="left" fontWeight="bold">Admin</Text>
        <SimpleGrid columns={[1, 2, 3]} spacing={8} justifyItems="center">
            <Link to="/class-routine">
                <Button
                    height="250px"
                    width={["100%", "450px"]}
                    flexDirection="column"
                    justifyContent="center"
                    borderRadius="30px"
                    bg="gray.100"
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg', bg: 'rgb(48,142,254)', }}
                    boxShadow="md"
                >
                    <Icon as={FaCalendarAlt} boxSize={20} color="gray.700" />
                    <Text fontSize="2xl" fontWeight="600" color="gray.700">Class Routine</Text>
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
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                    boxShadow="md"
                >
                    <Icon as={FaComments} boxSize={20} color="gray.700" />
                    <Text fontSize="2xl" fontWeight="600" color="gray.700">Forum</Text>
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
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                    boxShadow="md"
                >
                    <Icon as={FaClipboardList} boxSize={20} color="gray.700" />
                    <Text fontSize="2xl" fontWeight="600" color="gray.700">Event</Text>
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
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                    boxShadow="md"
                >
                    <Icon as={FaBoxOpen} boxSize={20} color="gray.700" />
                    <Text fontSize="2xl" fontWeight="600" color="gray.700">Lost and Found</Text>
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
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                    boxShadow="md"
                >
                    <Icon as={FaChair} boxSize={20} color="gray.700" />
                    <Text fontSize="2xl" fontWeight="600" color="gray.700">Seat Plan</Text>
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
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}

                    boxShadow="md"
                    onClick={handleGenerateRoutine}
                >   
                    <Icon as={FaBook} boxSize={20} color="gray.700" />
                    <Text fontSize="2xl" fontWeight="600" color="gray.700">Generate Routine</Text>
                </Button>
            </Link>
        </SimpleGrid>
    </Box>
    </>)
};

export default AdminDashboard;