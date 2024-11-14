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

const Event = () => {
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

    const toast = useToast();

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

        if (enableVolunteer && allowedDepartments.length === 0) {
            toast({
                title: "Allowed Departments Required",
                description: "Please select at least one department for volunteering.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            if (isEditing) {
                // Update existing event
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
                });

                toast({
                    title: "Event Updated",
                    description: "The event has been successfully updated.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // Create new event
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
                    creatorEmail: currentUser.email, // Save the creator's email
                });

                toast({
                    title: "Event Created",
                    description: "Your event has been successfully created.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }

            // Reset state
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
                const allowedDepartments = eventData.allowedDepartments || [];

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
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="MMMM d, yyyy"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Event End Date</FormLabel>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    dateFormat="MMMM d, yyyy"
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
        </Box>
    );
};

export default Event;
