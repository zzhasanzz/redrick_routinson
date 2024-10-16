import { Box, SimpleGrid, Button, Text, Icon } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaComments, FaChair, FaBoxOpen, FaClipboardList, FaBook } from 'react-icons/fa';
import axios from 'axios';

const TeacherDashboard = () => {

    const handleGenerateRoutine = async () => {
        try {
            const response = await axios.post('http://localhost:5000/teacher-home/teacher-dashboard');

            console.log(response.data.message); // Log the success message
            // Navigate to the new window (you can specify your target URL)
            window.open('/new_window', '_blank'); // Adjust the URL as needed
        } catch (error) {
            console.error('Error generating routine:', error.response.data.error);
        }
    };

    return (
        <Box p={8}>
            <Text fontSize="4xl" mb={10}>Teacher</Text>
            <SimpleGrid columns={[2, null, 3]} spacing={8}>
                <Link to="/class-routine">
                    <Button height="250px" width="450px" flexDirection="column" justifyContent="center" borderRadius="30px ">
                        <Icon as={FaCalendarAlt} boxSize={20} />
                        <Text fontSize="2xl">Class Routine</Text>
                    </Button>
                </Link>

                <Link to="/forum">
                    <Button height="250px" width="450px" flexDirection="column" justifyContent="center" borderRadius="30px">
                        <Icon as={FaComments} boxSize={20} />
                        <Text fontSize="2xl">Forum</Text>
                    </Button>
                </Link>

                <Link to="/event">
                    <Button height="250px" width="450px" flexDirection="column" justifyContent="center" borderRadius="30px">
                        <Icon as={FaClipboardList} boxSize={20} />
                        <Text fontSize="2xl">Event</Text>
                    </Button>
                </Link>

                <Link to="/lost-and-found">
                    <Button height="250px" width="450px" flexDirection="column" justifyContent="center" borderRadius="30px">
                        <Icon as={FaBoxOpen} boxSize={20} />
                        <Text fontSize="2xl">Lost and Found</Text>
                    </Button>
                </Link>

                <Link to="/seat-plan">
                    <Button height="250px" width="450px" flexDirection="column" justifyContent="center" borderRadius="30px">
                        <Icon as={FaChair} boxSize={20} />
                        <Text fontSize="2xl">Seat Plan</Text>
                    </Button>
                </Link>

                <Link to="/teacher-home/teacher-manage-routine">
                    <Button height="250px" width="450px" flexDirection="column" justifyContent="center" borderRadius="30px" onClick={handleGenerateRoutine}>
                        <Icon as={FaBook} boxSize={20} />
                        <Text fontSize="2xl">Generate Routine</Text>
                    </Button>
                </Link>
            </SimpleGrid>
        </Box>
    );
};

export default TeacherDashboard;
