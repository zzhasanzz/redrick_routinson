import React, { useState, useEffect, useContext } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    HStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Checkbox,
    SimpleGrid,
    Flex,
    Card,
    Heading,
    Text,
    Badge,
    Spinner,
    Center,
    Image,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    useToast,
} from "@chakra-ui/react";
import {
    IconButton,
} from "@chakra-ui/react";

import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, getDoc, doc, deleteDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import {useNavigate} from "react-router-dom";




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
            const eventList = eventSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
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
            } else {
                console.error("User document not found.");
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
                    foodOptions, // Save selected food options
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
                    foodOptions, // Save selected food options
                    breakfast: [],  // ✅ Initialize empty food arrays
                    lunch: [],
                    dinner: [],
                    snacks: []
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

    const handleVolunteer = async (eventId) => {
        try {
            const eventDocRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const volunteerList = eventData.volunteerList || [];
                // const allowedDepartments = eventData.allowedDepartments || [];

                if (volunteerList.includes(currentUser.email)) {
                    toast({
                        title: "Already Volunteered",
                        description: "You are already registered as a volunteer for this event.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                    });
                    return;
                }

                await updateDoc(eventDocRef, {
                    volunteerList: arrayUnion(currentUser.email),
                });

                toast({
                    title: "Volunteered Successfully",
                    description: "You have successfully registered as a volunteer.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                fetchEvents();
            } else {
                toast({
                    title: "Event Not Found",
                    description: "The selected event does not exist.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error volunteering for event: ", error);
            toast({
                title: "Error",
                description: "Failed to register as a volunteer. Please try again.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

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
        try {
            const eventDocRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const participantList = eventData.participantList || [];

                if (participantList.includes(currentUser.email)) {
                    toast({
                        title: "Already Registered",
                        description: "You have already registered for this event.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                    });
                    return;
                }

                // ✅ Generate QR Codes with RAW DATA instead of a URL
                let foodTokens = eventData.foodTokens || {}; // Keep existing tokens
                foodTokens[currentUser.email] = {}; // Create space for this user

                selectedFoodOptions.forEach(food => {
                    foodTokens[currentUser.email][food] = `${eventId}-${currentUser.email}-${food}`; // ✅ Store raw QR code format
                });

                // ✅ Save Tokens & Participant Info
                await updateDoc(eventDocRef, {
                    participantList: arrayUnion(currentUser.email),
                    foodTokens, // ✅ Save tokens in raw format
                });

                toast({
                    title: "Registration Successful",
                    description: "You have received food tokens.",
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
        setParticipantList(event.participantList);
        onParticipantsOpen();
    };



    return (
        <Box p={5}>
            {isPresident && (
                <>
                    <Button colorScheme="blue" onClick={onOpen} mb={5}>
                        Add Event
                    </Button>
                    <Button
                        colorScheme={isFilteringMyEvents ? "green" : "green"}
                        onClick={handleFilterMyEvents}
                        mb={5}
                    >
                        {isFilteringMyEvents ? "View All Events" : "Events Created by Me"}
                    </Button>

                    <Button
                        colorScheme="red"
                        onClick={() => window.location.href = "/student-home/scanner"}
                        mb={5}
                    >
                        Scanner
                    </Button>
                </>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{isEditing ? "Edit Event" : "Create a New Event"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Event Name</FormLabel>
                                <Input
                                    placeholder="Enter event name"
                                    value={eventName}
                                    onChange={(e) => setEventName(e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Event Start Date</FormLabel>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => {
                                        setStartDate(date);
                                        // If the current end date is before the new start date, update the end date
                                        if (endDate < date) {
                                            setEndDate(date);
                                        }
                                    }}
                                    dateFormat="MMMM d, yyyy"
                                    minDate={new Date()}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Event End Date</FormLabel>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    dateFormat="MMMM d, yyyy"
                                    minDate={startDate} // Set the minimum date to the start date
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    placeholder="Provide a description for the event"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Subscription Fee (optional)</FormLabel>
                                <Input
                                    type="number"
                                    placeholder="Enter subscription fee"
                                    value={subscriptionFee}
                                    onChange={(e) => setSubscriptionFee(e.target.value)}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Food Options</FormLabel>
                                <SimpleGrid columns={2} spacing={2}>
                                    {foodItems.map((food) => (
                                        <Checkbox
                                            key={food}
                                            isChecked={foodOptions.includes(food)}
                                            onChange={() =>
                                                setFoodOptions((prev) =>
                                                    prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
                                                )
                                            }
                                        >
                                            {food}
                                        </Checkbox>
                                    ))}
                                </SimpleGrid>
                            </FormControl>
                            <FormControl>
                                <FormLabel>Upload Event Image</FormLabel>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Allowed Departments</FormLabel>
                                <SimpleGrid columns={3} spacing={2}>
                                    {departments.map((department) => (
                                        <Checkbox
                                            key={department}
                                            isChecked={allowedDepartments.includes(department)}
                                            onChange={() =>
                                                handleAllowedDepartmentsChange(department)
                                            }
                                        >
                                            {department}
                                        </Checkbox>
                                    ))}
                                </SimpleGrid>
                            </FormControl>
                            <HStack>
                                <Checkbox
                                    isChecked={enableVolunteer}
                                    onChange={() => setEnableVolunteer(!enableVolunteer)}
                                >
                                    Enable Volunteer Registration
                                </Checkbox>
                            </HStack>
                            <FormControl>
                                <FormLabel>Roadmap</FormLabel>
                                <Button
                                    size="sm"
                                    colorScheme="teal"
                                    onClick={addRoadmapItem}
                                    mb={2}
                                >
                                    Add Roadmap Item
                                </Button>
                                <Table size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Day</Th>
                                            <Th>Time</Th>
                                            <Th>Activity</Th>
                                            <Th>Action</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {roadmap.map((item) => (
                                            <Tr key={item.id}>
                                                <Td>
                                                    <Input
                                                        size="sm"
                                                        placeholder="Day"
                                                        value={item.day}
                                                        onChange={(e) =>
                                                            updateRoadmapItem(
                                                                item.id,
                                                                "day",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </Td>
                                                <Td>
                                                    <Input
                                                        size="sm"
                                                        placeholder="Time"
                                                        value={item.time}
                                                        onChange={(e) =>
                                                            updateRoadmapItem(
                                                                item.id,
                                                                "time",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </Td>
                                                <Td>
                                                    <Input
                                                        size="sm"
                                                        placeholder="Activity"
                                                        value={item.activity}
                                                        onChange={(e) =>
                                                            updateRoadmapItem(
                                                                item.id,
                                                                "activity",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </Td>
                                                <Td>
                                                    <IconButton
                                                        size="sm"
                                                        colorScheme="red"
                                                        icon={<DeleteIcon />}
                                                        onClick={() =>
                                                            deleteRoadmapItem(item.id)
                                                        }
                                                    />
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleSubmit}>
                            {isEditing ? "Update Event" : "Submit Event"}
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {loading ? (
                <Center p={10}>
                    <Spinner size="xl" />
                </Center>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                    {filteredEvents.map((event) => (
                        <Card
                            key={event.id}
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            cursor="pointer"
                        >
                            <Flex>
                                <Box flex="1" p={4}>
                                    <Heading size="md" mb={2} isTruncated>
                                        {event.eventName}
                                    </Heading>
                                    <Text fontSize="sm" fontWeight="bold">
                                        Start Date:
                                    </Text>
                                    <Text fontSize="sm" mb={2}>
                                        {new Date(event.startDate).toDateString()}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="bold">
                                        End Date:
                                    </Text>
                                    <Text fontSize="sm" mb={2}>
                                        {new Date(event.endDate).toDateString()}
                                    </Text>
                                    <Text fontSize="sm" noOfLines={2} mb={2}>
                                        {event.description}
                                    </Text>
                                    <Flex alignItems="center" gap={2} mb={2}>
                                        <Badge colorScheme="blue">
                                            {event.subscriptionFee ? `TAKA${event.subscriptionFee}` : "Free"}
                                        </Badge>
                                        {event.enableVolunteer && (
                                            <Badge colorScheme="green">Volunteers Needed</Badge>
                                        )}
                                    </Flex>
                                </Box>

                                <Box
                                    flex="1"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    maxW="400px"
                                    maxH="350px"
                                    overflow="hidden"
                                    borderRadius="lg"
                                >
                                    <Image
                                        src={event.image}
                                        alt={event.eventName}
                                        width="400px"
                                        height="350px"
                                        objectFit="cover"
                                    />
                                </Box>
                            </Flex>
                            <HStack spacing={2} mt={3} justify="center">
                                {event.creatorEmail === currentUser.email ? (
                                    <>
                                        <Button
                                            size="sm"
                                            colorScheme="green"
                                            onClick={() => handleViewVolunteers(event)}
                                        >
                                            View Volunteers
                                        </Button>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => handleEditEvent(event)}
                                        >
                                            Edit Event
                                        </Button>

                                        <Button
                                            colorScheme="teal"
                                            onClick={() => navigate(`/student-home/event/invite/${event.id}`)}
                                            ml={2}
                                        >
                                            Invite Teachers
                                        </Button>


                                        <Button
                                            size="sm"
                                            colorScheme="red"
                                            onClick={() => handleDeleteEvent(event.id)}
                                        >
                                            Delete Event
                                        </Button>
                                    </>
                                ) : event.enableVolunteer && (
                                    <Button
                                        size="sm"
                                        colorScheme="green"
                                        onClick={() => handleVolunteer(event.id)}
                                    >
                                        Volunteer
                                    </Button>
                                )}
                                {event.creatorEmail === currentUser.email ? (
                                    <Button size="sm" colorScheme="purple" onClick={() => handleViewParticipants(event)}>
                                        View Participants
                                    </Button>
                                ) : event.participantList?.includes(currentUser.email) ? ( // ✅ FIXED THIS LINE
                                    <Button
                                        size="sm"
                                        colorScheme="purple"
                                        onClick={() => handleViewTokens(event)}
                                    >
                                        Token
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={() => handleRegister(event.id, event.foodOptions)}
                                    >
                                        Register
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    onClick={() => handleCardClick(event)}
                                >
                                    View Details
                                </Button>
                            </HStack>
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
                                        <Th>Email</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {volunteerList.map((email, index) => (
                                        <Tr key={index}>
                                            <Td>{email}</Td>
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
                                        <Th>Email</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {participantList.map((email, index) => (
                                        <Tr key={index}>
                                            <Td>{email}</Td>
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




        </Box>
    );
};

export default Event;
