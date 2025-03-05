import React, { useState, useEffect, useContext } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    Center,
    FormControl,
    FormLabel,
    HStack,
    Icon,
    IconButton,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    SimpleGrid,
    Tag,
    TagCloseButton,
    TagLabel,
    Text,
    Textarea,
    VStack,
    Wrap,
    useDisclosure,
    useToast,
    Spinner,
    Table,
    Thead,
    Tr,
    Tbody,
    Td,
    Select,
    Badge,
    Flex,
    Th,
    Heading,
    Checkbox
} from "@chakra-ui/react";


import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, getDoc, doc, deleteDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {useNavigate} from "react-router-dom";

import {
    FaCalendarPlus,
    FaCloudUploadAlt,
    FaCheck,
    FaArrowRight,
    FaUsers,
    FaEdit,
    FaTrash,
    FaTimes,
    FaHandsHelping,
    FaTicketAlt,
    FaRegCheckCircle
} from "react-icons/fa";






const Event = () => {
    // const [showInvitePage, setShowInvitePage] = useState(false);
    // const [selectedEventForInvite, setSelectedEventForInvite] = useState(null);
    const [selectedTokens, setSelectedTokens] = useState({});
    const [foodOptions, setFoodOptions] = useState([]);
    const foodItems = ["Breakfast", "Lunch", "Snack", "Dinner"];
    const { currentUser } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventName, setEventName] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [description, setDescription] = useState("");
    const [subscriptionFee, setSubscriptionFee] = useState("");
    const [enableVolunteer, setEnableVolunteer] = useState(false);
    const [image, setImage] = useState(null);
    const [roadmap, setRoadmap] = useState([]);
    const [isPresident, setIsPresident] = useState(false);
    const [volunteerList, setVolunteerList] = useState([]);
    const [allowedDepartments, setAllowedDepartments] = useState([]);
    const departments = ["CSE", "EEE", "MPE", "BTM", "TVE", "CIVIL"];
    const [isFilteringMyEvents, setIsFilteringMyEvents] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [participantList, setParticipantList] = useState([]);
    const {
        isOpen: isOpenVolunteerModal,
        onOpen: openVolunteerModal,
        onClose: closeVolunteerModal,
    } = useDisclosure();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDetailsOpen,
        onOpen: onDetailsOpen,
        onClose: onDetailsClose,
    } = useDisclosure();
    const {
        isOpen: isOpenTokensModal,
        onOpen: onOpenTokensModal,
        onClose: onCloseTokensModal,
    } = useDisclosure();

    const { isOpen: isParticipantsOpen, onOpen: onParticipantsOpen, onClose: onParticipantsClose } = useDisclosure();

    const toast = useToast();

    // const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    // const [teachers, setTeachers] = useState([]);
    // const [selectedTeacher, setSelectedTeacher] = useState(null);
    // const [invitationMessage, setInvitationMessage] = useState("");

    const navigate = useNavigate();

    const [selectedFoodItem, setSelectedFoodItem] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalTokens, setTotalTokens] = useState(0);

    const {
        isOpen: isRegisterModalOpen,
        onOpen: onRegisterModalOpen,
        onClose: onRegisterModalClose
    } = useDisclosure();
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        department: '',
        image: null
    });
    const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);


    const {
        isOpen: isProfileOpen,
        onOpen: onProfileOpen,
        onClose: onProfileClose,
    } = useDisclosure();
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    const {
        isOpen: isVolunteerModalOpen,
        onOpen: onVolunteerModalOpen,
        onClose: onVolunteerModalClose,
    } = useDisclosure();
    const [volunteerFormData, setVolunteerFormData] = useState({
        name: '',
        studentId: '',
        department: '',
        image: null
    });
    const [selectedEventForVolunteer, setSelectedEventForVolunteer] = useState(null);

    const [newFoodItem, setNewFoodItem] = useState("");
    const [userData, setUserData] = useState(null); // Add userData state















    // _____________________________________________________________________


    // Add this function to fetch teachers
//     const fetchTeachers = async () => {
//         try {
//             const usersCollection = collection(db, "users");
//             const snapshot = await getDocs(usersCollection);
//             const teacherList = [];
//             snapshot.forEach(doc => {
//                 const userData = doc.data();
//                 if(userData.role === "teacher") {
//                     teacherList.push({ id: doc.id, ...userData });
//                 }
//             });
//             setTeachers(teacherList);
//         } catch (error) {
//             console.error("Error fetching teachers:", error);
//         }
//     };
//
// // Add this function to send invitation
//     const sendInvitation = async () => {
//         if(!selectedTeacher || !invitationMessage) {
//             toast({
//                 title: "Missing Information",
//                 description: "Please select a teacher and write a message",
//                 status: "error",
//                 duration: 3000,
//                 isClosable: true,
//             });
//             return;
//         }
//
//         try {
//             await addDoc(collection(db, "invitations"), {
//                 eventId: selectedEvent.id,
//                 eventName: selectedEvent.eventName,
//                 senderEmail: currentUser.email,
//                 teacherEmail: selectedTeacher.email,
//                 message: invitationMessage,
//                 status: "pending",
//                 timestamp: new Date().toISOString()
//             });
//
//             toast({
//                 title: "Invitation Sent!",
//                 description: "Your invitation has been successfully sent",
//                 status: "success",
//                 duration: 3000,
//                 isClosable: true,
//             });
//             setInviteModalOpen(false);
//         } catch (error) {
//             console.error("Error sending invitation:", error);
//             toast({
//                 title: "Error",
//                 description: "Failed to send invitation",
//                 status: "error",
//                 duration: 3000,
//                 isClosable: true,
//             });
//         }
//     };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const eventCollection = collection(db, "events");
            const eventSnapshot = await getDocs(eventCollection);
            const currentDate = new Date(); // Get current date/time

            const eventList = eventSnapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                // Filter out events with end date in the past
                .filter((event) => new Date(event.endDate) >= currentDate);

            setEvents(eventList);
            setFilteredEvents(eventList);
        } catch (error) {
            console.error("Error fetching events: ", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRole = async () => {
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.email));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setIsPresident(userData.isPresident || false);
                setUserData(userData); // Store user data in state
            }
        } catch (error) {
            console.error("Error fetching user role: ", error);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchUserRole();
    }, []);


    const handleViewTokens = async (event) => {
        try {
            const eventDocRef = doc(db, "events", event.id);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const userTokens = eventData.foodTokens?.[currentUser.email] || {};

                if (Object.keys(userTokens).length === 0) {
                    toast({ /* ... */ });
                    return;
                }

                const firstTokenKey = Object.keys(userTokens)[0];
                setSelectedTokens(userTokens);
                setSelectedFoodItem(firstTokenKey);
                setCurrentIndex(0);
                setTotalTokens(Object.keys(userTokens).length);
                onOpenTokensModal();
            }
        } catch (error) {
            // Handle error
        }
    };



    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addRoadmapItem = () => {
        setRoadmap([...roadmap, { day: "", time: "", activity: "", id: Date.now() }]);
    };

    const updateRoadmapItem = (id, key, value) => {
        setRoadmap(
            roadmap.map((item) => (item.id === id ? { ...item, [key]: value } : item))
        );
    };

    const deleteRoadmapItem = (id) => {
        setRoadmap(roadmap.filter((item) => item.id !== id));
    };

    const handleAllowedDepartmentsChange = (department) => {
        setAllowedDepartments((prev) =>
            prev.includes(department)
                ? prev.filter((dept) => dept !== department)
                : [...prev, department]
        );
    };

    const handleSubmit = async () => {
        if (!eventName || !description || !startDate || !endDate) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            if (isEditing) {
                const eventDocRef = doc(db, "events", editingEventId);
                await updateDoc(eventDocRef, {
                    eventName,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    description,
                    subscriptionFee: Number(subscriptionFee),
                    enableVolunteer,
                    allowedDepartments,
                    image,
                    roadmap,
                    foodOptions, // Save the foodOptions array
                });
            } else {
                const eventRef = collection(db, "events");
                await addDoc(eventRef, {
                    eventName,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    description,
                    subscriptionFee: Number(subscriptionFee),
                    volunteerList: [],
                    enableVolunteer,
                    allowedDepartments,
                    image,
                    roadmap,
                    creatorEmail: currentUser.email,
                    foodOptions, // Save the foodOptions array
                    breakfast: [],  // Initialize empty food arrays
                    lunch: [],
                    dinner: [],
                    snacks: [],
                });
            }

            toast({
                title: isEditing ? "Event Updated" : "Event Created",
                description: isEditing ? "Event updated successfully." : "Event created successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Reset fields
            setIsEditing(false);
            setEditingEventId(null);
            setEventName("");
            setStartDate(new Date());
            setEndDate(new Date());
            setDescription("");
            setSubscriptionFee("");
            setEnableVolunteer(false);
            setImage(null);
            setRoadmap([]);
            setAllowedDepartments([]);
            setFoodOptions([]);
            setNewFoodItem(""); // Clear the new food item input

            fetchEvents();
            onClose();
        } catch (error) {
            console.error("Error saving event: ", error);
            toast({
                title: "Error",
                description: "Failed to save the event. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleSubmitVolunteer = async (eventId) => {
        try {
            if (!volunteerFormData.name || !volunteerFormData.studentId || !volunteerFormData.department) {
                toast({
                    title: "Missing Information",
                    description: "Please fill all required fields",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            const eventDocRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const isAlreadyVolunteer = eventData.volunteerList?.some(v => v.email === currentUser.email);

                if (isAlreadyVolunteer) {
                    toast({
                        title: "Already Volunteered",
                        description: "You are already registered as a volunteer",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                    return;
                }

                const volunteerData = {
                    ...volunteerFormData,
                    email: currentUser.email,
                    registrationDate: new Date().toISOString()
                };

                await updateDoc(eventDocRef, {
                    volunteerList: arrayUnion(volunteerData)
                });

                toast({
                    title: "Volunteer Registered",
                    description: "Thank you for volunteering!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                setVolunteerFormData({
                    name: '',
                    studentId: '',
                    department: '',
                    image: null
                });
                onVolunteerModalClose();
                fetchEvents();
            }
        } catch (error) {
            console.error("Error volunteering:", error);
            toast({
                title: "Error",
                description: "Failed to register as volunteer",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCancelVolunteer = async (eventId) => {
        try {
            const eventDocRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const updatedVolunteers = eventData.volunteerList.filter(
                    v => v.email !== currentUser.email
                );

                await updateDoc(eventDocRef, {
                    volunteerList: updatedVolunteers
                });

                toast({
                    title: "Volunteer Cancelled",
                    description: "Your volunteer registration has been cancelled",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchEvents();
            }
        } catch (error) {
            console.error("Error cancelling volunteer:", error);
            toast({
                title: "Error",
                description: "Failed to cancel volunteer registration",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


    const handleEditEvent = (event) => {
        setIsEditing(true);
        setEditingEventId(event.id);
        setEventName(event.eventName);
        setStartDate(new Date(event.startDate));
        setEndDate(new Date(event.endDate));
        setDescription(event.description);
        setSubscriptionFee(event.subscriptionFee || "");
        setEnableVolunteer(event.enableVolunteer || false);
        setImage(event.image || null);
        setRoadmap(event.roadmap || []);
        setAllowedDepartments(event.allowedDepartments || []);
        onOpen();
    };

    // const handleVolunteer = async (eventId) => {
    //     try {
    //         const eventDocRef = doc(db, "events", eventId);
    //         const eventDoc = await getDoc(eventDocRef);
    //
    //         if (eventDoc.exists()) {
    //             const eventData = eventDoc.data();
    //             const volunteerList = eventData.volunteerList || [];
    //             // const allowedDepartments = eventData.allowedDepartments || [];
    //
    //             if (volunteerList.includes(currentUser.email)) {
    //                 toast({
    //                     title: "Already Volunteered",
    //                     description: "You are already registered as a volunteer for this event.",
    //                     status: "info",
    //                     duration: 3000,
    //                     isClosable: true,
    //                 });
    //                 return;
    //             }
    //
    //             await updateDoc(eventDocRef, {
    //                 volunteerList: arrayUnion(currentUser.email),
    //             });
    //
    //             toast({
    //                 title: "Volunteered Successfully",
    //                 description: "You have successfully registered as a volunteer.",
    //                 status: "success",
    //                 duration: 3000,
    //                 isClosable: true,
    //             });
    //             fetchEvents();
    //         } else {
    //             toast({
    //                 title: "Event Not Found",
    //                 description: "The selected event does not exist.",
    //                 status: "error",
    //                 duration: 3000,
    //                 isClosable: true,
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error volunteering for event: ", error);
    //         toast({
    //             title: "Error",
    //             description: "Failed to register as a volunteer. Please try again.",
    //             status: "error",
    //             duration: 3000,
    //             isClosable: true,
    //         });
    //     }
    // };

    const handleViewVolunteers = (event) => {
        setVolunteerList(event.volunteerList || []);
        openVolunteerModal();
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const eventDocRef = doc(db, "events", eventId);
            await deleteDoc(eventDocRef);
            toast({
                title: "Event Deleted",
                description: "The event has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
            toast({
                title: "Error",
                description: "Failed to delete the event. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCardClick = (event) => {
        setSelectedEvent(event); // Fix the selected event data
        onDetailsOpen();
    };

    const handleFilterMyEvents = () => {
        if (isFilteringMyEvents) {
            // Show all events
            setFilteredEvents(events);
        } else {
            // Show only events created by the current user
            const myEvents = events.filter(
                (event) => event.creatorEmail === currentUser.email
            );
            setFilteredEvents(myEvents);
        }
        setIsFilteringMyEvents(!isFilteringMyEvents); // Toggle the state
    };

    const handleRegister = async (eventId, selectedFoodOptions) => {
        if (!userData) {
            toast({
                title: "User data not found.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const eventDocRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const participantList = eventData.participantList || [];

                // Check if already registered
                const isRegistered = participantList.some(
                    (participant) => participant.email === currentUser.email
                );

                if (isRegistered) {
                    toast({
                        title: "Already Registered",
                        description: "You have already registered for this event.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                    });
                    return;
                }

                // Create participant object from userData
                const participantData = {
                    name: userData.displayName,
                    studentId: userData.id,
                    department: userData.department,
                    image: userData.profilePic,
                    email: currentUser.email,
                    registrationDate: new Date().toISOString()
                };

                // Generate food tokens
                let foodTokens = eventData.foodTokens || {};
                foodTokens[currentUser.email] = {};

                selectedFoodOptions.forEach(food => {
                    foodTokens[currentUser.email][food] = `${eventId}-${currentUser.email}-${food}`;
                });

                // Update document
                await updateDoc(eventDocRef, {
                    participantList: arrayUnion(participantData),
                    foodTokens,
                });

                toast({
                    title: "Registration Successful",
                    description: "Your registration has been completed!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                fetchEvents();
            }
        } catch (error) {
            console.error("Error registering for event: ", error);
            toast({
                title: "Error",
                description: "Failed to register. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };


    const handleViewParticipants = (event) => {
        setParticipantList(event.participantList || []); // Ensure participantList is an array
        onParticipantsOpen();
    };




    return (
        <Box p={5}>
            {isPresident && (
                <>
                    <Button
                        colorScheme="teal"
                        onClick={onOpen}
                        leftIcon={<AddIcon />}
                        size="md"
                        borderRadius="md"
                        boxShadow="md"
                        _hover={{ transform: "translateY(-2px)" }}
                    >
                        Add Event
                    </Button>
                    <Button
                        onClick={handleFilterMyEvents}
                        colorScheme="teal"
                        size="md"
                        borderRadius="md"
                        boxShadow="md"
                        _hover={{ transform: "translateY(-2px)" }}
                    >
                        {isFilteringMyEvents ? "View All Events" : "Events Created by Me"}
                    </Button>

                    {/*<Button*/}
                    {/*    colorScheme="red"*/}
                    {/*    onClick={() => window.location.href = "/student-home/scanner"}*/}
                    {/*    mb={5}*/}
                    {/*>*/}
                    {/*    Scanner*/}
                    {/*</Button>*/}
                </>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay backdropFilter="blur(10px)" />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <Box
                        bgGradient="linear(to-r, blue.600, purple.500)"
                        px={6}
                        py={4}
                    >
                        <ModalHeader color="white" fontSize="2xl">
                            <HStack>
                                <Icon as={FaCalendarPlus} />
                                <Text>{isEditing ? "Edit Event" : "Create New Event"}</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalCloseButton color="white" _hover={{ bg: 'rgba(255,255,255,0.2)' }} />
                    </Box>

                    <ModalBody py={6}>
                        <VStack spacing={6}>
                            {/* Event Name */}
                            <FormControl>
                                <Input
                                    variant="flushed"
                                    placeholder="Event Name"
                                    fontSize="lg"
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                    focusBorderColor="blue.500"
                                    px={2}
                                    py={4}
                                />
                            </FormControl>

                            {/* Date Pickers */}
                            <SimpleGrid columns={[1, 2]} spacing={6} w="full">
                                <FormControl>
                                    <FormLabel fontWeight="600" color="gray.600">Start Date</FormLabel>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={date => {
                                            setStartDate(date);
                                            if (endDate < date) setEndDate(date);
                                        }}
                                        customInput={
                                            <Input
                                                variant="outline"
                                                borderRadius="md"
                                                borderColor="gray.200"
                                                _hover={{ borderColor: 'gray.300' }}
                                            />
                                        }
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        showTimeSelect
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel fontWeight="600" color="gray.600">End Date</FormLabel>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={date => setEndDate(date)}
                                        minDate={startDate}
                                        customInput={
                                            <Input
                                                variant="outline"
                                                borderRadius="md"
                                                borderColor="gray.200"
                                                _hover={{ borderColor: 'gray.300' }}
                                            />
                                        }
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        showTimeSelect
                                    />
                                </FormControl>
                            </SimpleGrid>

                            {/* Description */}
                            <FormControl>
                                <Textarea
                                    placeholder="Event Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    borderRadius="lg"
                                    borderColor="gray.200"
                                    _hover={{ borderColor: 'gray.300' }}
                                    focusBorderColor="blue.500"
                                    rows={4}
                                />
                            </FormControl>

                            {/* Image Upload */}
                            <FormControl>
                                <FormLabel fontWeight="600" color="gray.600">Event Cover Image</FormLabel>
                                <Box
                                    border="2px dashed"
                                    borderColor={image ? 'green.200' : 'gray.200'}
                                    borderRadius="xl"
                                    p={6}
                                    textAlign="center"
                                    cursor="pointer"
                                    _hover={{ borderColor: 'blue.200' }}
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    {image ? (
                                        <Image
                                            src={image}
                                            alt="Preview"
                                            maxH="200px"
                                            mx="auto"
                                            borderRadius="lg"
                                        />
                                    ) : (
                                        <VStack spacing={3}>
                                            <Icon as={FaCloudUploadAlt} boxSize={8} color="gray.400" />
                                            <Text color="gray.500">
                                                Drag and drop or click to upload
                                            </Text>
                                            <Text fontSize="sm" color="gray.400">
                                                Recommended size: 1200x600px
                                            </Text>
                                        </VStack>
                                    )}
                                </Box>
                                <Input
                                    type="file"
                                    id="fileInput"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    display="none"
                                />
                            </FormControl>

                            {/* Food Options */}
                            <FormControl>
                                <FormLabel fontWeight="600" color="gray.600">Food Options</FormLabel>
                                <InputGroup>
                                    <Input
                                        placeholder="Add food item (press Enter)"
                                        value={newFoodItem}
                                        onChange={(e) => setNewFoodItem(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && newFoodItem.trim()) {
                                                setFoodOptions([...foodOptions, newFoodItem]);
                                                setNewFoodItem('');
                                            }
                                        }}
                                        borderRadius="md"
                                    />
                                    <InputRightElement>
                                        <IconButton
                                            icon={<AddIcon />}
                                            size="sm"
                                            aria-label="Add food"
                                            onClick={() => {
                                                if (newFoodItem.trim()) {
                                                    setFoodOptions([...foodOptions, newFoodItem]);
                                                    setNewFoodItem('');
                                                }
                                            }}
                                        />
                                    </InputRightElement>
                                </InputGroup>
                                <Wrap mt={3} spacing={2}>
                                    {foodOptions.map((food, index) => (
                                        <Tag
                                            key={index}
                                            borderRadius="full"
                                            colorScheme="orange"
                                            px={4}
                                            py={1.5}
                                        >
                                            <TagLabel>{food}</TagLabel>
                                            <TagCloseButton
                                                onClick={() => setFoodOptions(foodOptions.filter((_, i) => i !== index))}
                                            />
                                        </Tag>
                                    ))}
                                </Wrap>
                            </FormControl>

                            {/* Roadmap */}
                            <FormControl>
                                <FormLabel fontWeight="600" color="gray.600">Event Schedule</FormLabel>
                                <VStack spacing={4} align="stretch">
                                    {roadmap.map((item) => (
                                        <Card key={item.id} p={4} borderRadius="lg" variant="outline">
                                            <HStack spacing={3}>
                                                <Input
                                                    placeholder="Day (e.g., Day 1)"
                                                    value={item.day}
                                                    onChange={(e) => updateRoadmapItem(item.id, 'day', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Time (e.g., 9:00 AM)"
                                                    value={item.time}
                                                    onChange={(e) => updateRoadmapItem(item.id, 'time', e.target.value)}
                                                />
                                                <Input
                                                    placeholder="Activity"
                                                    value={item.activity}
                                                    onChange={(e) => updateRoadmapItem(item.id, 'activity', e.target.value)}
                                                />
                                                <IconButton
                                                    icon={<DeleteIcon />}
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    aria-label="Delete item"
                                                    onClick={() => deleteRoadmapItem(item.id)}
                                                />
                                            </HStack>
                                        </Card>
                                    ))}
                                    <Button
                                        leftIcon={<AddIcon />}
                                        variant="outline"
                                        colorScheme="blue"
                                        onClick={addRoadmapItem}
                                    >
                                        Add Schedule Item
                                    </Button>
                                </VStack>
                            </FormControl>

                            <Checkbox
                                isChecked={enableVolunteer}
                                onChange={() => setEnableVolunteer(!enableVolunteer)}
                            >
                                Enable Volunteer Registration
                            </Checkbox>

                        </VStack>
                    </ModalBody>

                    <ModalFooter borderTopWidth={1} borderColor="gray.100">
                        <ButtonGroup spacing={3}>
                            <Button
                                colorScheme="blue"
                                px={8}
                                onClick={handleSubmit}
                                isLoading={loading}
                                rightIcon={<FaArrowRight />}
                            >
                                {isEditing ? 'Update Event' : 'Create Event'}
                            </Button>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                        </ButtonGroup>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {loading ? (
                <Center p={10}>
                    <Spinner size="xl" />
                </Center>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {filteredEvents.map((event) => (
                        <Card
                            key={event.id}
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="lg"
                            transition="all 0.3s"
                            _hover={{
                                transform: "translateY(-5px)",
                                boxShadow: "xl",
                            }}
                            cursor="pointer"
                            onClick={() => handleCardClick(event)}
                        >
                            <Flex direction={{ base: "column", md: "row" }} h="full">
                                {/* Image Section with Hover Overlay */}
                                <Box
                                    position="relative"
                                    flexShrink={0}
                                    w={{ base: "100%", md: "40%" }}
                                    h={{ base: "200px", md: "auto" }}
                                    overflow="hidden"
                                    _after={{
                                        content: '""',
                                        position: "absolute",
                                        inset: 0,
                                        bgGradient: "linear(to-b, transparent 60%, blackAlpha.600)",
                                    }}
                                >
                                    <Image
                                        src={event.image}
                                        alt={event.eventName}
                                        w="full"
                                        h="full"
                                        objectFit="cover"
                                        transition="transform 0.3s"
                                        _hover={{ transform: "scale(1.05)" }}
                                    />
                                </Box>

                                {/* Content Section */}
                                <Box flex={1} p={5} bg="white">
                                    {/* Event Header */}
                                    <Heading
                                        size="lg"
                                        mb={3}
                                        bgGradient="linear(to-r, blue.600, purple.500)"
                                        bgClip="text"
                                    >
                                        {event.eventName}
                                    </Heading>

                                    {/* Date Section */}
                                    <Flex gap={4} mb={4}>
                                        <Box>
                                            <Text fontSize="sm" fontWeight="semibold" color="gray.500">
                                                Starts
                                            </Text>
                                            <Text fontSize="md" fontWeight="bold">
                                                {new Date(event.startDate).toLocaleDateString("en-US", {
                                                    dateStyle: "medium",
                                                })}
                                            </Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="sm" fontWeight="semibold" color="gray.500">
                                                Ends
                                            </Text>
                                            <Text fontSize="md" fontWeight="bold">
                                                {new Date(event.endDate).toLocaleDateString("en-US", {
                                                    dateStyle: "medium",
                                                })}
                                            </Text>
                                        </Box>
                                    </Flex>

                                    {/* Description */}
                                    <Text
                                        fontSize="sm"
                                        color="gray.600"
                                        mb={4}
                                        noOfLines={3}
                                        lineHeight="tall"
                                    >
                                        {event.description}
                                    </Text>

                                    {/* Badges */}
                                    <Flex gap={2} mb={4} flexWrap="wrap">
                                        <Badge
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            colorScheme={event.subscriptionFee ? "purple" : "green"}
                                        >
                                            {event.subscriptionFee ? `৳${event.subscriptionFee}` : "Free Entry"}
                                        </Badge>
                                        {event.enableVolunteer && (
                                            <Badge px={3} py={1} borderRadius="full" colorScheme="orange">
                                                👐 Volunteers Needed
                                            </Badge>
                                        )}
                                    </Flex>

                                    {/* Action Buttons */}
                                    <Flex
                                        gap={3}
                                        mt="auto"
                                        flexWrap="wrap"
                                        justify={{ base: "center", md: "flex-start" }}
                                    >
                                        {event.creatorEmail === currentUser.email ? (
                                            <>
                                                <Button
                                                    leftIcon={<FaUsers />}
                                                    colorScheme="teal"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewVolunteers(event);
                                                    }}
                                                >
                                                    Volunteers
                                                </Button>
                                                <Button
                                                    leftIcon={<FaUsers />}
                                                    colorScheme="teal"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewParticipants(event);
                                                    }}
                                                >
                                                    Participants
                                                </Button>
                                                <Button
                                                    leftIcon={<FaEdit />}
                                                    colorScheme="blue"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditEvent(event);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    leftIcon={<FaTrash />}
                                                    colorScheme="red"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteEvent(event.id);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        ) : event.enableVolunteer &&
                                        event.volunteerList?.some((v) => v.email === currentUser.email) ? (
                                            <Button
                                                leftIcon={<FaTimes />}
                                                colorScheme="red"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelVolunteer(event.id);
                                                }}
                                            >
                                                Cancel Volunteer
                                            </Button>
                                        ) : (
                                            event.enableVolunteer && (
                                                <Button
                                                    leftIcon={<FaHandsHelping />}
                                                    colorScheme="green"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEventForVolunteer(event);
                                                        onVolunteerModalOpen();
                                                    }}
                                                >
                                                    Volunteer
                                                </Button>
                                            )
                                        )}

                                        {event.creatorEmail !== currentUser.email &&
                                            (event.participantList?.some((p) => p.email === currentUser.email) ? (
                                                <Button
                                                    leftIcon={<FaTicketAlt />}
                                                    colorScheme="purple"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewTokens(event);
                                                    }}
                                                >
                                                    View Token
                                                </Button>
                                            ) : (
                                                <Button
                                                    leftIcon={<FaRegCheckCircle />}
                                                    colorScheme="blue"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRegister(event.id, event.foodOptions);
                                                    }}
                                                >
                                                    Register Now
                                                </Button>
                                            ))}
                                    </Flex>
                                </Box>
                            </Flex>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            <Modal isOpen={isDetailsOpen} onClose={onDetailsClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedEvent?.eventName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Image
                            src={selectedEvent?.image}
                            alt={selectedEvent?.eventName}
                            width="100%"
                            height="200px"
                            objectFit="cover"
                            mb={4}
                            borderRadius="lg"
                        />
                        <Text fontWeight="bold">Start Date:</Text>
                        <Text>{new Date(selectedEvent?.startDate).toDateString()}</Text>
                        <Text fontWeight="bold">End Date:</Text>
                        <Text>{new Date(selectedEvent?.endDate).toDateString()}</Text>
                        <Text fontWeight="bold">Description:</Text>
                        <Text>{selectedEvent?.description}</Text>
                        <Text fontWeight="bold">Roadmap:</Text>
                        <Text fontWeight="bold" mt={4}>Food Options:</Text>
                        {selectedEvent?.foodOptions && selectedEvent.foodOptions.length > 0 ? (
                            <SimpleGrid columns={2} spacing={2} mt={2}>
                                {selectedEvent.foodOptions.map((food, index) => (
                                    <Badge key={index} colorScheme="orange">{food}</Badge>
                                ))}
                            </SimpleGrid>
                        ) : (
                            <Text>No food options available.</Text>
                        )}
                        <Table size="sm" mt={4}>
                            <Thead>
                                <Tr>
                                    <Th>Day</Th>
                                    <Th>Time</Th>
                                    <Th>Activity</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {selectedEvent?.roadmap?.map((item, index) => (
                                    <Tr key={index}>
                                        <Td>{item.day}</Td>
                                        <Td>{item.time}</Td>
                                        <Td>{item.activity}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        <Text fontWeight="bold" mt={4}>
                            Subscription Fee:
                        </Text>
                        <Text>
                            {selectedEvent?.subscriptionFee
                                ? `TAKA${selectedEvent?.subscriptionFee}`
                                : "Free"}
                        </Text>
                        {selectedEvent?.enableVolunteer && (
                            <Badge colorScheme="green" mt={2}>
                                Volunteers Needed
                            </Badge>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onDetailsClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isOpenVolunteerModal} onClose={closeVolunteerModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Volunteer List</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {volunteerList.length > 0 ? (
                            <Table size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {volunteerList.map((volunteer, index) => (
                                        <Tr key={index}>
                                            <Td>{volunteer.name}</Td>
                                            <Td>
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    onClick={() => {
                                                        setSelectedParticipant(volunteer);
                                                        onProfileOpen();
                                                    }}
                                                >
                                                    View Profile
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        ) : (
                            <Text>No volunteers registered for this event.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={closeVolunteerModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isParticipantsOpen} onClose={onParticipantsClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Registered Participants</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {participantList.length > 0 ? (
                            <Table size="sm">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Photo</Th>
                                        <Th>Actions</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {participantList.map((participant, index) => (
                                        <Tr key={index}>
                                            <Td>{participant.name}</Td>
                                            <Td>
                                                {participant.image && (
                                                    <Image
                                                        src={participant.image}
                                                        boxSize="50px"
                                                        objectFit="cover"
                                                        borderRadius="full"
                                                    />
                                                )}
                                            </Td>
                                            <Td>
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    onClick={() => {
                                                        setSelectedParticipant(participant);
                                                        onProfileOpen();
                                                    }}
                                                >
                                                    Profile
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        ) : (
                            <Text>No participants registered yet.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onParticipantsClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isOpenTokensModal} onClose={onCloseTokensModal} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Your Food Tokens</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {Object.keys(selectedTokens).length > 0 ? (
                            <VStack spacing={4}>
                                {/* Navigation Controls */}
                                <HStack justifyContent="space-between" w="full">
                                    <Button
                                        onClick={() => setSelectedFoodItem(prev => {
                                            const keys = Object.keys(selectedTokens);
                                            const newIndex = (keys.indexOf(prev) - 1 + keys.length) % keys.length;
                                            return keys[newIndex];
                                        })}
                                        isDisabled={Object.keys(selectedTokens).length <= 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => setSelectedFoodItem(prev => {
                                            const keys = Object.keys(selectedTokens);
                                            const newIndex = (keys.indexOf(prev) + 1) % keys.length;
                                            return keys[newIndex];
                                        })}
                                        isDisabled={Object.keys(selectedTokens).length <= 1}
                                    >
                                        Next
                                    </Button>
                                </HStack>

                                {/* QR Code Display */}
                                <Box textAlign="center" w="full">
                                    <Text fontSize="xl" mb={4} fontWeight="bold">
                                        {selectedFoodItem}
                                    </Text>
                                    <QRCodeSVG
                                        value={selectedTokens[selectedFoodItem]}
                                        size={256}
                                        style={{ margin: '0 auto' }}
                                    />
                                </Box>
                            </VStack>
                        ) : (
                            <Text>No QR tokens found for this event.</Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onCloseTokensModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/*<Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)}>*/}
            {/*    <ModalOverlay />*/}
            {/*    <ModalContent>*/}
            {/*        <ModalHeader>Invite Teachers</ModalHeader>*/}
            {/*        <ModalCloseButton />*/}
            {/*        <ModalBody>*/}
            {/*            <Textarea*/}
            {/*                placeholder="Dear Professor [Name],\n\nWe would be honored to have your expertise and guidance for our upcoming event [Event Name]. Your involvement would greatly enrich our program..."*/}
            {/*                value={invitationMessage}*/}
            {/*                onChange={(e) => setInvitationMessage(e.target.value)}*/}
            {/*                minHeight="200px"*/}
            {/*                mb={4}*/}
            {/*            />*/}

            {/*            <Text fontWeight="bold" mb={2}>Select Teacher:</Text>*/}
            {/*            <SimpleGrid columns={1} spacing={2}>*/}
            {/*                {teachers.map(teacher => (*/}
            {/*                    <Card*/}
            {/*                        p={3}*/}
            {/*                        key={teacher.id}*/}
            {/*                        cursor="pointer"*/}
            {/*                        border={selectedTeacher?.id === teacher.id ? "2px solid teal" : "1px solid gray"}*/}
            {/*                        onClick={() => setSelectedTeacher(teacher)}*/}
            {/*                    >*/}
            {/*                        <Text fontWeight="bold">{teacher.name}</Text>*/}
            {/*                        <Text>{teacher.email}</Text>*/}
            {/*                        <Text>{teacher.department}</Text>*/}
            {/*                    </Card>*/}
            {/*                ))}*/}
            {/*            </SimpleGrid>*/}
            {/*        </ModalBody>*/}
            {/*        <ModalFooter>*/}
            {/*            <Button colorScheme="teal" onClick={sendInvitation}>*/}
            {/*                Send Invitation*/}
            {/*            </Button>*/}
            {/*            <Button variant="outline" ml={3} onClick={() => setInviteModalOpen(false)}>*/}
            {/*                Cancel*/}
            {/*            </Button>*/}
            {/*        </ModalFooter>*/}
            {/*    </ModalContent>*/}
            {/*</Modal>*/}

            <Modal isOpen={isRegisterModalOpen} onClose={onRegisterModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Registration Form</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Full Name</FormLabel>
                                <Input
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Student ID</FormLabel>
                                <Input
                                    placeholder="Enter your student ID"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Department</FormLabel>
                                <Select
                                    placeholder="Select department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Upload Profile Image</FormLabel>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({...formData, image: reader.result});
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            onClick={() => handleRegister(selectedEventForRegistration.id, selectedEventForRegistration.foodOptions)}
                        >
                            Submit Registration
                        </Button>
                        <Button variant="ghost" onClick={onRegisterModalClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isProfileOpen} onClose={onProfileClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Participant Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedParticipant && (
                            <VStack spacing={4} align="stretch">
                                <Center>
                                    {selectedParticipant.image && (
                                        <Image
                                            src={selectedParticipant.image}
                                            boxSize="200px"
                                            borderRadius="full"
                                            objectFit="cover"
                                            mb={4}
                                        />
                                    )}
                                </Center>
                                <Box>
                                    <Text fontWeight="bold">Name:</Text>
                                    <Text>{selectedParticipant.name}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Student ID:</Text>
                                    <Text>{selectedParticipant.studentId}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Department:</Text>
                                    <Text>{selectedParticipant.department}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Email:</Text>
                                    <Text>{selectedParticipant.email}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Registration Date:</Text>
                                    <Text>
                                        {new Date(
                                            selectedParticipant.registrationDate
                                        ).toLocaleDateString()}
                                    </Text>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onProfileClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>


            <Modal isOpen={isVolunteerModalOpen} onClose={onVolunteerModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Volunteer Registration</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Full Name</FormLabel>
                                <Input
                                    placeholder="Enter your full name"
                                    value={volunteerFormData.name}
                                    onChange={(e) => setVolunteerFormData({...volunteerFormData, name: e.target.value})}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Student ID</FormLabel>
                                <Input
                                    placeholder="Enter your student ID"
                                    value={volunteerFormData.studentId}
                                    onChange={(e) => setVolunteerFormData({...volunteerFormData, studentId: e.target.value})}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Department</FormLabel>
                                <Select
                                    placeholder="Select department"
                                    value={volunteerFormData.department}
                                    onChange={(e) => setVolunteerFormData({...volunteerFormData, department: e.target.value})}
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Upload Profile Image</FormLabel>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setVolunteerFormData({...volunteerFormData, image: reader.result});
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            colorScheme="blue"
                            onClick={() => handleSubmitVolunteer(selectedEventForVolunteer.id)}
                        >
                            Submit
                        </Button>
                        <Button variant="ghost" onClick={onVolunteerModalClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={isProfileOpen} onClose={onProfileClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Volunteer Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedParticipant && (
                            <VStack spacing={4} align="stretch">
                                <Center>
                                    {selectedParticipant.image && (
                                        <Image
                                            src={selectedParticipant.image}
                                            boxSize="200px"
                                            borderRadius="full"
                                            objectFit="cover"
                                            mb={4}
                                        />
                                    )}
                                </Center>
                                <Box>
                                    <Text fontWeight="bold">Name:</Text>
                                    <Text>{selectedParticipant.name}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Student ID:</Text>
                                    <Text>{selectedParticipant.studentId}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Department:</Text>
                                    <Text>{selectedParticipant.department}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Email:</Text>
                                    <Text>{selectedParticipant.email}</Text>
                                </Box>
                                <Box>
                                    <Text fontWeight="bold">Registration Date:</Text>
                                    <Text>
                                        {new Date(
                                            selectedParticipant.registrationDate
                                        ).toLocaleDateString()}
                                    </Text>
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onProfileClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>




        </Box>
    );
};

export default Event;

