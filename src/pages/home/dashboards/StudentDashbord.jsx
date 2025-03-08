import { Box, SimpleGrid, Button, Text, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaComments, FaChair, FaBoxOpen, FaClipboardList, FaBook } from 'react-icons/fa';

const StudentDashboard = () => {
    return (
        <Box
            p={0} // Removes all padding from Box
            m={0} // Removes all margin from Box
            height="100vh" // Full viewport height
            backgroundImage="url('../assets/background2.png')" // Path to your background image
            backgroundSize="cover" // Ensures the image covers the entire container
            backgroundPosition="center" // Centers the image
            backgroundRepeat="no-repeat" // Prevents repeating
        >
            <SimpleGrid columns={[2, null, 3]} spacing={8}>
                <Link to="/student-home/student-routine">
                    <Button
                        height="250px"
                        width="450px"
                        flexDirection="column"
                        justifyContent="center"
                        borderRadius="30px"
                        backgroundColor="#edf8fb"
                        backgroundImage="url('../assets/class_routine_button_student.png')"
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
                        {/* <Image 
                            src="../assets/class_routine_button.png" 
                            boxSize="450px" // Adjust size as needed
                            alt="Class Routine"
                        /> */}
                        {/* <Text fontSize="3xl" fontFamily="sans serif" color="#415c77">Class Routine</Text> */}
                    </Button>
                </Link>

                <Link to="/student-home/forum">
                    <Button
                        height="250px"
                        width="450px"
                        flexDirection="column"
                        justifyContent="center"
                        borderRadius="30px"
                        backgroundColor="#edf8fb"
                        backgroundImage="url('../assets/discussion_forum.png')"
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

                <Link to="/student-home/event">
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

                <Link to="/student-home/lost-and-found">
                    <Button
                        height="250px"
                        width="450px"
                        flexDirection="column"
                        justifyContent="center"
                        borderRadius="30px"
                        backgroundColor="#edf8fb"
                        border="2px solid rgba(255, 255, 255, 0.7)"
                        backgroundImage="url('../assets/lost_and_found.png')"
                        backgroundSize="cover"
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

                <Link to="/student-home/student-seat-plan">
                    <Button
                        height="250px"
                        width="450px"
                        flexDirection="column"
                        justifyContent="center"
                        borderRadius="30px"
                        backgroundColor="#edf8fb"
                        border="2px solid rgba(255, 255, 255, 0.7)"
                        backgroundImage="url('../assets/seat_plan_button.png')"
                        backgroundSize="cover"
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

                <Link to="/student-home/others">
                    <Button
                        height="250px"
                        width="450px"
                        flexDirection="column"
                        justifyContent="center"
                        borderRadius="30px"
                        backgroundColor="#edf8fb"
                        backgroundImage="url('../assets/others.png')"
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
    );
};

export default StudentDashboard;
