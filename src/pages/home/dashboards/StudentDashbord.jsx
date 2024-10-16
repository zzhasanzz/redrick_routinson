import { Box, SimpleGrid, Button, Text, Icon } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaComments, FaChair, FaBoxOpen, FaClipboardList, FaBook } from 'react-icons/fa';

const StudentDashboard = () => {
    return (
        <Box
            p={0} // Removes all padding from Box
            m={0} // Removes all margin from Box
            color= '#F5FCFEff'
            height="100vh" // Full viewport height
            backgroundImage="url('/assets/backgroud.png')" // Path to your background image
            backgroundSize="cover" // Ensures the image covers the entire container
            backgroundPosition="center" // Centers the image
            backgroundRepeat="no-repeat" // Prevents repeating
        >
            <Text fontSize="4xl" mb={10}>Student</Text>
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

                <Link to="/others">
                    <Button height="250px" width="450px" flexDirection="column" justifyContent="center" borderRadius="30px">
                        <Icon as={FaBook} boxSize={20} />
                        <Text fontSize="2xl">Others</Text>
                    </Button>
                </Link>
            </SimpleGrid>
        </Box>
    );
};

export default StudentDashboard;
