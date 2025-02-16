import {
    Box,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    useToast,
    VStack,
    Text,
    Center,
} from '@chakra-ui/react';
import { db, auth } from "../../firebase";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import TeacherSidebar from '../home/sidebars/TeacherSidebar';

const TeacherPreference = () => {
    const [selectedSlots, setSelectedSlots] = useState([]);
    const toast = useToast();
    const [teacherName, setTeacherName] = useState("");

    // Define the days and time slots
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        '8:00-9:15',
        '9:15-10:30',
        '10:30-11:45',
        '11:45-1:00',
        '2:30-3:45',
        '3:45-5:00',
    ];

    useEffect(() => {
        const fetchTeacherName = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const email = currentUser.email;
                const teacherRef = doc(db, "users", email);
                const teacherSnap = await getDoc(teacherRef);

                if (teacherSnap.exists()) {
                    setTeacherName(teacherSnap.data().name);
                }
            }
        };

        fetchTeacherName();
    }, []);


    console.log(teacherName);


    // Handle cell click
    const handleCellClick = (day, timeSlot) => {
        const slot = `${day}-${timeSlot}`;
        setSelectedSlots((prev) =>
            prev.includes(slot)
                ? prev.filter((s) => s !== slot) // Deselect if already selected
                : [...prev, slot] // Select if not already selected
        );
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (selectedSlots.length < 10) {
            toast({
                title: 'Selection Error',
                description: 'Please select at least 10 timeslots.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            // Convert selected slots to the required format
            const preferredTimes = selectedSlots.map((slot) => {
                const [day, ...timeParts] = slot.split('-');
                const time = timeParts.join('-');
                return { day, time };
            });

            // Send the data to the backend
            const response = await fetch('http://localhost:5000/api/update-preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teacherName,
                    preferredTimes,  // Now contains full time ranges
                }),
            });     

            if (response.ok) {
                toast({
                    title: 'Preferences Saved',
                    description: 'Your availability has been successfully updated.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: 'Error',
                    description: errorData.message || 'Failed to update preferences.',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            toast({
                title: 'Error',
                description: 'An error occurred while updating preferences.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box display="flex">
            <TeacherSidebar />
            <Box flex="1" p={8} maxW="1200px" mx="auto">
                <Heading as="h1" size="xl" mb={8} textAlign="center">
                    Teacher Availability
                </Heading>
                <Text fontSize="lg" mb={6} textAlign="center">
                    Select at least 10 timeslots when you are available. Click on a cell to mark your availability.
                </Text>

                {/* Availability Table */}
                <Box overflowX="auto">
                    <Table variant="simple" size="md">
                        <Thead>
                            <Tr>
                                <Th
                                    border="1px solid"
                                    borderColor="gray.200"
                                    bg="blue.50"
                                    color="gray.700"
                                    fontWeight="bold"
                                    fontSize= "16px"
                                    textAlign="center"
                                    py={4}
                                    px={6}
                                    _hover={{ bg: 'blue.100' }}
                                >
                                    Day
                                </Th>
                                {timeSlots.map((slot) => (
                                    <Th
                                        key={slot}
                                        border="1px solid"
                                        borderColor="gray.200"
                                        bg="blue.50"
                                        color="gray.700"
                                        fontWeight="bold"
                                        fontSize= "16px"
                                        textAlign="center"
                                        py={6}
                                        px={6}
                                        _hover={{ bg: 'blue.100' }}
                                    >
                                        {slot}
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {days.map((day) => (
                                <Tr key={day}>
                                    <Td textAlign="center"> {day} </Td>
                                    {timeSlots.map((timeSlot) => {
                                        const slot = `${day}-${timeSlot}`;
                                        const isSelected = selectedSlots.includes(slot);
                                        return (
                                            <Td
                                                key={slot}
                                                onClick={() => handleCellClick(day, timeSlot)}
                                                bg={isSelected ? 'green.100' : 'white'} // Changed from transparent to white
                                                cursor="pointer"
                                                _hover={{ bg: isSelected ? 'green.200' : 'gray.10' }} // Stronger hover states
                                                transition="background 0.2s"
                                                border="2px solid" // Add border
                                                borderColor="gray.100" // Border color
                                                height="60px" // Make cells bigger
                                                width="150px" // Fixed width for cells
                                            >
                                                {isSelected && (   // Add visual indicator
                                                    <Box
                                                        bg="green.100"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                    >
                                                    </Box>
                                                )}

                                                {!isSelected && (
                                                    <Box
                                                        w = '100%'
                                                        h = '200%'
                                                        display="center"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        _hover={{
                                                            bg: "gray.100", // Light gray on hover
                                                            transition: "background 0.4s ease-in-out",
                                                        }}
                                                    >
                                                    </Box>
                                                )}
                                            </Td>
                                        );
                                    })}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>

                {/* Submit Button */}
                <Box textAlign="center" mt={8}>
                    <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={handleSubmit}
                        isDisabled={selectedSlots.length < 10}
                    >
                        Save Preferences
                    </Button>
                    <Text mt={2} color="gray.500">
                        {selectedSlots.length} timeslots selected (Minimum 10 required)
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};

export default TeacherPreference;