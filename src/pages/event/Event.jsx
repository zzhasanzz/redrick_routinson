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
    IconButton,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, getDoc, doc ,updateDoc,
    arrayUnion, } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

const Event = () => {
    const { currentUser } = useContext(AuthContext); // Current logged-in user
    const [events, setEvents] = useState([]);
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
    const [isPresident, setIsPresident] = useState(false); // State for role checking
    const [volunteerList, setVolunteerList] = useState([]);
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

    // Fetch events from Firestore
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
        } catch (error) {
            console.error("Error fetching events: ", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch current user's role
    const fetchUserRole = async () => {
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.email));
            if (userDoc.exists()) {
                setIsPresident(userDoc.data().isPresident || false);
            } else {
                console.error("User document not found.");
            }
        } catch (error) {
            console.error("Error fetching user role: ", error);
        }
    };

    useEffect(() => {
        fetchEvents();
        fetchUserRole(); // Fetch user role on component mount
    }, []);

    // Handle image upload
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

    // Add roadmap item
    const addRoadmapItem = () => {
        setRoadmap([
            ...roadmap,
            { day: "", time: "", activity: "", id: Date.now() },
        ]);
    };

    // Update roadmap item
    const updateRoadmapItem = (id, key, value) => {
        setRoadmap(
            roadmap.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            )
        );
    };

    // Delete roadmap item
    const deleteRoadmapItem = (id) => {
        setRoadmap(roadmap.filter((item) => item.id !== id));
    };

    // Submit event to Firestore
    const handleSubmit = async () => {
        if (!eventName || !description || !startDate || !endDate) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const eventRef = collection(db, "events");
            await addDoc(eventRef, {
                eventName,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                description,
                subscriptionFee: Number(subscriptionFee),
                volunteerList: [],
                enableVolunteer,
                image,
                roadmap,
            });

            fetchEvents();
            onClose();
            alert("Event created successfully!");
        } catch (error) {
            console.error("Error adding event: ", error);
        }
    };
    const handleVolunteer = async (eventId) => {
        try {
            const eventDocRef = doc(db, "events", eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const volunteerList = eventData.volunteerList || [];

                if (volunteerList.includes(currentUser.email)) {
                    alert("You are already registered as a volunteer for this event!");
                    return;
                }

                await updateDoc(eventDocRef, {
                    volunteerList: arrayUnion(currentUser.email),
                });

                alert("You have successfully volunteered for this event!");
                fetchEvents();
            } else {
                alert("Event not found!");
            }
        } catch (error) {
            console.error("Error volunteering for event: ", error);
            alert("Something went wrong. Please try again.");
        }
    };

    // Handle viewing volunteer list
    const handleViewVolunteers = (event) => {
        setVolunteerList(event.volunteerList || []);
        openVolunteerModal();
    };

    // Handle card click
    const handleCardClick = (event) => {
        setSelectedEvent(event);
        onDetailsOpen();
    };

    return (
        <Box p={5}>
            {/* Render Add Event button only if user is the president */}
            {isPresident && (
                <Button colorScheme="blue" onClick={onOpen} mb={5}>
                    Add Event
                </Button>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create a new Event</ModalHeader>
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
                            Submit Event
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
                    {events.map((event) => (
                        <Card
                            key={event.id}
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            cursor="pointer"
                            onClick={() => handleCardClick(event)}
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
                                    <Badge colorScheme="blue" mb={2}>
                                        {event.subscriptionFee ? `TAKA${event.subscriptionFee}` : "Free"}
                                    </Badge>
                                    {event.enableVolunteer && (
                                        <Badge colorScheme="green">Volunteers Needed</Badge>
                                    )}
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
                            {event.enableVolunteer && (
                                <Button
                                    size="sm" // Smaller size for the button
                                    colorScheme="green"
                                    width="fit-content" // Automatically adjusts to the button's text width
                                    position="absolute"
                                    bottom={2} // Positioned at the bottom of the card
                                    left={2} // Positioned slightly to the left
                                    onClick={() => handleVolunteer(event.id)}
                                >
                                    Volunteer
                                </Button>
                            )}
                            {isPresident && (
                                <Button
                                    size="sm" // Smaller size for the button
                                    colorScheme="green"
                                    width="fit-content" // Automatically adjusts to the button's text width
                                    position="absolute"
                                    bottom={2} // Positioned at the bottom of the card
                                    left={2} // Positioned slightly to the left
                                    onClick={() => handleViewVolunteers(event)}
                                >
                                    View Volunteers
                                </Button>
                            )}
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {selectedEvent && (
                <Modal isOpen={isDetailsOpen} onClose={onDetailsClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{selectedEvent.eventName}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Image
                                src={selectedEvent.image}
                                alt={selectedEvent.eventName}
                                width="100%"
                                height="200px"
                                objectFit="cover"
                                mb={4}
                                borderRadius="lg"
                            />
                            <Text fontWeight="bold">Start Date:</Text>
                            <Text>{new Date(selectedEvent.startDate).toDateString()}</Text>
                            <Text fontWeight="bold">End Date:</Text>
                            <Text>{new Date(selectedEvent.endDate).toDateString()}</Text>
                            <Text fontWeight="bold">Description:</Text>
                            <Text>{selectedEvent.description}</Text>
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
                                    {selectedEvent.roadmap?.map((item, index) => (
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
                                {selectedEvent.subscriptionFee
                                    ? `TAKA${selectedEvent.subscriptionFee}`
                                    : "Free"}
                            </Text>
                            {selectedEvent.enableVolunteer && (
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
            )}

            <Modal isOpen={isOpenVolunteerModal} onClose={closeVolunteerModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader
                    >Volunteer List</ModalHeader>
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
