import { Box, SimpleGrid, Button, Text, Image} from '@chakra-ui/react';
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
                        <Image 
                            src="../assets/routine.png" 
                            boxSize="150px" // Adjust size as needed
                            alt="Class Routine"
                        />
                        <Text fontSize="3xl" fontFamily="sans serif" color="#415c77">Class Routine</Text>
                    </Button>
                </Link>

                <Link to="/forum">
                    <Button
                        height="250px"
                        width="450px"
                        flexDirection="column"
                        justifyContent="center"
                        borderRadius="30px"
                        backgroundColor="#edf8fb"
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
                       <Image 
                            src="../assets/forum.png" 
                            boxSize="150px" // Adjust size as needed
                            alt="Forum"
                        />
                        <Text fontSize="3xl" fontFamily="sans serif" color="#415c77">Forum</Text>
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
                        <Image 
                            src="../assets/event.png" 
                            boxSize="150px" // Adjust size as needed
                            alt="Event"
                        />
                        <Text fontSize="3xl" fontFamily="sans serif" color="#415c77">Event</Text>
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
                        <Image 
                            src="../assets/lostAndFound.png" 
                            boxSize="150px" // Adjust size as needed
                            alt="Lost and Found"
                        />
                        <Text fontSize="3xl" fontFamily="sans serif" color="#415c77">Lost and Found</Text>
                    </Button>
                </Link>

                <Link to="/seat-plan">
                    <Button
                        height="250px"
                        width="450px"
                        flexDirection="column"
                        justifyContent="center"
                        borderRadius="30px"
                        backgroundColor="#edf8fb"
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
                       <Image 
                            src="../assets/seatplan.png" 
                            boxSize="150px" // Adjust size as needed
                            alt="Seat Plan"
                        />
                        <Text fontSize="3xl" fontFamily="sans serif" color="#415c77">Seat Plan</Text>
                    </Button>
                </Link>

                <Link to="/others">
                    <Button
                        height="250px"
                        width="450px"
                        flexDirection="column"
                        justifyContent="center"
                        borderRadius="30px"
                        backgroundColor="#edf8fb"
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
                         <Image 
                            src="../assets/others.png" 
                            boxSize="150px" // Adjust size as needed
                            alt="Others"
                        />
                        <Text fontSize="3xl" fontFamily="sans serif" color="#415c77">Others</Text>
                    </Button>
                </Link>
            </SimpleGrid>
        </Box>
    );
};

export default StudentDashboard;
