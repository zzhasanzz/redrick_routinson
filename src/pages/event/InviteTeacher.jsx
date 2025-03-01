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
    Image,
    useToast,
    Spinner,
    Tag,
    Divider
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import html2canvas from "html2canvas";

const InviteTeacher = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch event data
                const eventDoc = await getDoc(doc(db, "events", eventId));
                if (!eventDoc.exists()) {
                    navigate("/student-home/event");
                    return;
                }

                const eventData = eventDoc.data();
                if (eventData.creatorEmail !== currentUser.email) {
                    navigate("/student-home/event");
                    return;
                }

                setEvent({ id: eventId, ...eventData });

                // Fetch teachers
                const usersSnapshot = await getDocs(collection(db, "users"));
                const teacherList = [];
                usersSnapshot.forEach(doc => {
                    const userData = doc.data();
                    if (userData.role === "teacher") {
                        teacherList.push({
                            id: doc.id,
                            name: userData.name || userData.email,
                            email: userData.email,
                            department: userData.department
                        });
                    }
                });
                setTeachers(teacherList);

                // Set default message
                setMessage(`Dear Professor [Teacher's Name],

We are delighted to invite you to participate in our upcoming event "${eventData.eventName}" as an honored guest and mentor. Your expertise would greatly benefit our students.

Event Details:
- Date: ${new Date(eventData.startDate).toLocaleDateString()}
- ${eventData.description.substring(0, 80)}...

Looking forward to your positive response.

Best regards,
${currentUser.displayName || currentUser.email}
                `);

            } catch (error) {
                toast({
                    title: "Error loading data",
                    description: error.message,
                    status: "error"
                });
                navigate("/student-home/event");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [eventId, currentUser, navigate, toast]);

    const handleSendInvitation = async () => {
        if (!selectedTeacher || !message.trim()) {
            toast({
                title: "Incomplete details",
                description: "Please select a teacher and write a message",
                status: "warning"
            });
            return;
        }

        setIsSending(true);
        try {
            // Capture invitation design
            const element = document.getElementById("invitation-preview");
            const canvas = await html2canvas(element, { scale: 2 });
            const designImage = canvas.toDataURL("image/png");

            await addDoc(collection(db, "invitations"), {
                eventId: event.id,
                teacherEmail: selectedTeacher, // ✅ Already the email
                senderEmail: currentUser.email,
                teacherName: teachers.find(t => t.email === selectedTeacher)?.name || "Professor",
                message: message.replace("[Teacher's Name]",
                    teachers.find(t => t.email === selectedTeacher)?.name || "Professor"),
                status: "pending",
                sentAt: new Date().toISOString(),
                design: designImage,
                eventName: event.eventName
            });

            toast({
                title: "Invitation sent!",
                description: "Your invitation has been successfully delivered",
                status: "success"
            });
            navigate(`/student-home/event`);
        } catch (error) {
            toast({
                title: "Failed to send invitation",
                description: error.message,
                status: "error"
            });
        }
        setIsSending(false);
    };

    if (loading) {
        return (
            <Flex minH="100vh" align="center" justify="center">
                <Spinner size="xl" thickness="4px" />
            </Flex>
        );
    }

    if (!event) {
        return (
            <Flex minH="100vh" align="center" justify="center">
                <Text fontSize="xl">Event not found</Text>
            </Flex>
        );
    }

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Flex maxW="1200px" mx="auto" direction="column" gap={8}>
                <Flex justify="space-between" align="center">
                    <Heading size="xl" color="teal.600">
                        Invite Faculty to {event.eventName}
                    </Heading>
                    <Button
                        onClick={() => navigate(`/student-home/event`)}
                        variant="outline"
                        leftIcon={<ChevronRightIcon transform="rotate(180deg)" />}
                    >
                        Back to Event
                    </Button>
                </Flex>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
                    {/* Editor Section */}
                    <Box bg="white" p={6} borderRadius="xl" boxShadow="lg">
                        <Text fontSize="lg" mb={4} fontWeight="500">
                            Select Faculty Member
                        </Text>

                        <Select
                            placeholder="Choose professor"
                            mb={6}
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            size="lg"
                            icon={<ChevronRightIcon />}
                        >
                            {teachers.map(teacher => (
                                <option key={teacher.email} value={teacher.email}>
                                    {teacher.name} ({teacher.department})
                                </option>
                            ))}
                        </Select>

                        <Text fontSize="lg" mb={4} fontWeight="500">
                            Customize Invitation
                        </Text>

                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            height="400px"
                            fontFamily="Georgia, serif"
                            fontSize="lg"
                            lineHeight="1.8"
                            p={4}
                            borderRadius="lg"
                            borderColor="gray.200"
                            _focus={{ borderColor: "teal.300" }}
                        />
                    </Box>

                    {/* Preview Section */}
                    <Box id="invitation-preview" bg="white" p={8} borderRadius="xl" boxShadow="lg">
                        <Box border="1px solid" borderColor="gray.100" p={8} position="relative">
                            <Flex justify="space-between" align="center" mb={8}>
                                <Heading size="xl" color="teal.600">
                                    {event.eventName}
                                </Heading>
                                <Tag colorScheme="teal" size="lg">
                                    Faculty Invitation
                                </Tag>
                            </Flex>
                            <Divider borderColor="teal.100" mb={6} />

                            <Text whiteSpace="pre-wrap" fontFamily="Georgia, serif" fontSize="lg" lineHeight="1.8">
                                {message.replace("[Teacher's Name]",
                                    teachers.find(t => t.email === selectedTeacher)?.name || "Professor")}
                            </Text>

                            <Box mt={12} bg="teal.50" p={4} borderRadius="md">
                                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                    <Box>
                                        <Text fontSize="sm" color="gray.600">🗓 Date</Text>
                                        <Text fontWeight="500">
                                            {new Date(event.startDate).toLocaleDateString()}
                                        </Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="sm" color="gray.600">📍 Venue</Text>
                                        <Text fontWeight="500">University Campus</Text>
                                    </Box>
                                </Grid>
                            </Box>
                        </Box>
                    </Box>
                </Grid>

                <Flex justify="flex-end" gap={4} mt={8}>
                    <Button
                        onClick={() => navigate(`/student-home/event`)}
                        variant="outline"
                        size="lg"
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="teal"
                        size="lg"
                        isLoading={isSending}
                        loadingText="Sending..."
                        onClick={handleSendInvitation}
                        px={12}
                    >
                        Send Invitation
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
};

export default InviteTeacher;