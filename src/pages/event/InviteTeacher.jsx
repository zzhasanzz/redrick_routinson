import React, { useState, useEffect, useContext } from "react";
import {
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    Text,
    Textarea,
    Select,
    useToast,
    Spinner,
    Divider,
    IconButton,
    VStack,
    HStack,
    Card,
    CardBody,
    FormControl,
    FormLabel,
    Image,
    Tag,
    List,
    ListItem,
    Badge,
    Avatar,
    Stack,
    Spacer,
} from "@chakra-ui/react";
import { ChevronLeftIcon, CheckCircleIcon, TimeIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, getDocs, doc, getDoc, addDoc, query, where } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import html2canvas from "html2canvas";

const InviteTeacher = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedClub, setSelectedClub] = useState("");
    const [selectedPosition, setSelectedPosition] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const toast = useToast();
    const [invitations, setInvitations] = useState([]); // State for storing invitations

    const clubOptions = [
        "IUT COMPUTER SOCIETY",
        "IUT PHOTOGRAPHIC SOCIETY",
        "IUT DEBATING SOCIETY",
        "IUT SOCIETY OF ISLAMIC KNOWLEDGE SEEKERS",
    ];

    const positionOptions = ["Judge", "Chief Guest", "Guest Speaker", "Mentor"];

    // Fetch event and teachers data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventDoc = await getDoc(doc(db, "events", eventId));
                if (!eventDoc.exists()) {
                    navigate("/student-home/event");
                    return;
                }

                const eventData = eventDoc.data();
                setEvent({ id: eventId, ...eventData });

                const usersSnapshot = await getDocs(collection(db, "users"));
                const teacherList = [];
                usersSnapshot.forEach((doc) => {
                    const userData = doc.data();
                    if (userData.role === "teacher") {
                        teacherList.push({
                            id: doc.id,
                            name: userData.name || userData.email,
                            email: userData.email,
                            department: userData.department,
                        });
                    }
                });
                setTeachers(teacherList);
            } catch (error) {
                toast({
                    title: "Error loading data",
                    description: error.message,
                    status: "error",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId, navigate, toast]);

    // Fetch invitations for the event
    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const invitationsRef = collection(db, "invitations");
                const q = query(invitationsRef, where("eventId", "==", eventId));
                const querySnapshot = await getDocs(q);

                const invitationsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setInvitations(invitationsData);
            } catch (error) {
                console.error("Error fetching invitations:", error);
                toast({
                    title: "Error fetching invitations",
                    description: error.message,
                    status: "error",
                });
            }
        };

        if (eventId) {
            fetchInvitations();
        }
    }, [eventId, toast]);

    // Handle sending invitations
    const handleSendInvitation = async () => {
        if (!selectedTeacher || !selectedClub || !selectedPosition || !message.trim()) {
            toast({
                title: "Incomplete details",
                description: "Please fill all fields",
                status: "warning",
            });
            return;
        }

        setIsSending(true);
        try {
            const element = document.getElementById("invitation-preview");
            const canvas = await html2canvas(element, { scale: 2 });
            const designImage = canvas.toDataURL("image/png");

            const docRef = await addDoc(collection(db, "invitations"), {
                eventId: event.id,
                teacherEmail: selectedTeacher,
                senderEmail: currentUser.email,
                clubName: selectedClub,
                guestPosition: selectedPosition,
                message: message,
                status: "pending",
                sentAt: new Date().toISOString(),
                design: designImage,
                eventName: event.eventName,
            });

            // Update local state with the new invitation
            setInvitations((prev) => [
                ...prev,
                {
                    id: docRef.id,
                    teacherEmail: selectedTeacher,
                    guestPosition: selectedPosition,
                    status: "pending",
                    sentAt: new Date().toISOString(),
                },
            ]);

            toast({
                title: "Invitation sent!",
                status: "success",
            });
            navigate(`/student-home/event`);
        } catch (error) {
            toast({
                title: "Failed to send invitation",
                description: error.message,
                status: "error",
            });
        }
        setIsSending(false);
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusColors = {
            pending: "yellow",
            accepted: "green",
            rejected: "red",
        };

        const statusIcons = {
            pending: <TimeIcon />,
            accepted: <CheckCircleIcon />,
            rejected: <NotAllowedIcon />,
        };

        return (
            <Badge colorScheme={statusColors[status] || "gray"} ml={2}>
                {statusIcons[status]} {status.toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return (
            <Flex minH="100vh" align="center" justify="center">
                <Spinner size="xl" thickness="4px" />
            </Flex>
        );
    }

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Flex maxW="1200px" mx="auto" direction="column" gap={8}>
                <Flex align="center" mb={6}>
                    <IconButton
                        icon={<ChevronLeftIcon boxSize={6} />}
                        onClick={() => navigate(`/student-home/event`)}
                        variant="ghost"
                        mr={4}
                        aria-label="Back"
                    />
                    <Heading size="xl" color="teal.600">
                        Faculty Invitation Management
                    </Heading>
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
                    {/* Left Column */}
                    <Stack spacing={8}>
                        {/* Invited Teachers List */}
                        <Card bg="white" boxShadow="lg" borderRadius="xl">
                            <CardBody>
                                <Heading size="md" mb={4} color="gray.700">
                                    Invited Faculty
                                </Heading>

                                <List spacing={3}>
                                    {invitations.map((invitation) => (
                                        <ListItem key={invitation.id} p={3} borderRadius="md" borderWidth="1px">
                                            <Flex align="center">
                                                <Avatar
                                                    name={invitation.teacherEmail.split("@")[0]}
                                                    size="sm"
                                                    mr={3}
                                                />
                                                <Box>
                                                    <Text fontWeight="500">{invitation.teacherEmail}</Text>
                                                    <Text fontSize="sm" color="gray.500">
                                                        {invitation.guestPosition}
                                                    </Text>
                                                </Box>
                                                <Spacer />
                                                <StatusBadge status={invitation.status} />
                                            </Flex>
                                        </ListItem>
                                    ))}
                                </List>

                                {invitations.length === 0 && (
                                    <Text color="gray.500" textAlign="center" py={4}>
                                        No invitations sent yet
                                    </Text>
                                )}
                            </CardBody>
                        </Card>

                        {/* Form Section */}
                        <Card bg="white" boxShadow="lg" borderRadius="xl">
                            <CardBody>
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md" color="gray.700">
                                        Invitation Details
                                    </Heading>

                                    <FormControl>
                                        <FormLabel fontWeight="500" color="gray.600">
                                            Faculty Member
                                            <Tag colorScheme="red" size="sm" ml={2}>
                                                Required
                                            </Tag>
                                        </FormLabel>
                                        <Select
                                            placeholder="Select faculty member"
                                            size="lg"
                                            icon={<ChevronLeftIcon transform="rotate(270deg)" />}
                                            value={selectedTeacher}
                                            onChange={(e) => setSelectedTeacher(e.target.value)}
                                        >
                                            {teachers.map((t) => (
                                                <option key={t.email} value={t.email}>
                                                    {t.name} ({t.department})
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="500" color="gray.600">
                                            Club/Organization
                                            <Tag colorScheme="red" size="sm" ml={2}>
                                                Required
                                            </Tag>
                                        </FormLabel>
                                        <Select
                                            placeholder="Select club"
                                            size="lg"
                                            value={selectedClub}
                                            onChange={(e) => setSelectedClub(e.target.value)}
                                        >
                                            {clubOptions.map((club) => (
                                                <option key={club} value={club}>
                                                    {club}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="500" color="gray.600">
                                            Role/Position
                                            <Tag colorScheme="red" size="sm" ml={2}>
                                                Required
                                            </Tag>
                                        </FormLabel>
                                        <Select
                                            placeholder="Select position"
                                            size="lg"
                                            value={selectedPosition}
                                            onChange={(e) => setSelectedPosition(e.target.value)}
                                        >
                                            {positionOptions.map((pos) => (
                                                <option key={pos} value={pos}>
                                                    {pos}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel fontWeight="500" color="gray.600">
                                            Invitation Letter Content
                                            <Tag colorScheme="red" size="sm" ml={2}>
                                                Required
                                            </Tag>
                                        </FormLabel>
                                        <Textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            height="300px"
                                            fontFamily="Georgia, serif"
                                            fontSize="md"
                                            lineHeight="1.8"
                                            placeholder="Dear Professor [Name],\n\nWe are honored to invite you..."
                                            p={4}
                                            borderRadius="lg"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: "teal.300" }}
                                        />
                                    </FormControl>
                                </VStack>
                            </CardBody>
                        </Card>
                    </Stack>

                    {/* Preview Section */}
                    <Card id="invitation-preview" bg="white" boxShadow="lg" borderRadius="xl">
                        <CardBody>
                            <Box border="1px solid" borderColor="gray.100" p={8} position="relative">
                                {/* University Letterhead */}
                                <Flex justify="space-between" align="center" mb={8}>
                                    <Image
                                        src="data:image/jpeg;base64,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"
                                        alt="University Logo"
                                        w="120px"
                                    />
                                    <Box textAlign="right">
                                        <Text fontSize="sm" color="gray.600">
                                            Islamic University of Technology
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Board Bazar, Gazipur-1704
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Dhaka, Bangladesh
                                        </Text>
                                    </Box>
                                </Flex>

                                <Divider borderColor="teal.100" mb={6} />

                                {/* Invitation Content */}
                                <Box fontFamily="Georgia, serif">
                                    <Text fontSize="lg" mb={4}>
                                        {new Date().toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Text>

                                    <Text fontSize="lg" fontWeight="500" mb={2}>
                                        To: {selectedTeacher || "[Faculty Name]"}
                                    </Text>
                                    <Text fontSize="lg" fontWeight="500" mb={2}>
                                        From: {auth.currentUser.email|| "[Faculty Name]"}
                                    </Text>
                                    <Text fontSize="lg" fontWeight="500" mb={6}>
                                        {selectedClub || "[Club Name]"}
                                    </Text>


                                    <Text fontSize="xl" fontWeight="600" color="teal.600" mb={4}>
                                        Subject: Invitation to {event?.eventName} as {selectedPosition}
                                    </Text>

                                    <Text whiteSpace="pre-wrap" fontSize="lg" lineHeight="1.8">
                                        {message || "Dear Professor,\n\n[Your invitation content]"}
                                    </Text>

                                    <Box mt={12}>
                                        <Text fontSize="lg" mb={2}>
                                            Sincerely,
                                        </Text>
                                        <Text fontSize="lg" fontWeight="500">
                                            {currentUser?.displayName || "Event Organizer"}
                                        </Text>
                                        <Text fontSize="md" color="gray.600">
                                            {event?.eventName} Organizing Committee
                                        </Text>
                                    </Box>
                                </Box>

                                {/* Watermark */}
                                <Image
                                    src="/university-seal.png"
                                    position="absolute"
                                    bottom={4}
                                    right={4}
                                    opacity={0.1}
                                    w="150px"
                                />
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>

                <Flex justify="flex-end" mt={8}>
                    <Button
                        colorScheme="teal"
                        size="lg"
                        px={12}
                        isLoading={isSending}
                        loadingText="Sending..."
                        onClick={handleSendInvitation}
                        leftIcon={<span>✉️</span>}
                    >
                        Send Formal Invitation
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
};

export default InviteTeacher;