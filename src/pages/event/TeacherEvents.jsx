import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    VStack,
    HStack,
    Spinner,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@chakra-ui/react";
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { db } from "../../firebase";
const TeacherInvite = () => {
    const [teacherEmail, setTeacherEmail] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const auth = getAuth();

    // Step 1: Get the currently authenticated user's email
    useEffect(() => {
        const fetchTeacherEmail = async () => {
            try {
                const user = auth.currentUser; // Get logged-in user
                if (user && user.email) {
                    const userEmail = user.email; // Fetch the user's email

                    // Fetch teacher data from Firestore based on email
                    const teacherRef = doc(db, "users", userEmail);
                    const teacherSnap = await getDoc(teacherRef);

                    if (teacherSnap.exists()) {
                        setTeacherEmail(teacherSnap.data().email);
                    } else {
                        console.error("Teacher not found in Firestore!");
                        setError("Teacher data not found.");
                    }
                } else {
                    setError("No authenticated user found.");
                }
            } catch (err) {
                console.error("Error fetching teacher info:", err);
                setError("Error fetching teacher data.");
            }
        };

        fetchTeacherEmail();
    }, [auth]); // Run when authentication state changes

    // Step 2: Fetch Invitations Only for the Specific Teacher
    useEffect(() => {
        if (!teacherEmail) return; // Wait until teacherEmail is fetched

        setLoading(true); // Set loading while fetching data

        const invitesQuery = query(
            collection(db, "invitations"),
            where("teacherEmail", "==", teacherEmail)
        );

        const unsubscribe = onSnapshot(
            invitesQuery,
            (snapshot) => {
                const inviteData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setInvitations(inviteData);
                setLoading(false);
                setError(null);
            },
            (error) => {
                console.error("Error fetching invitations:", error);
                setError("Failed to load invitations.");
                setLoading(false);
            }
        );

        return () => unsubscribe(); // Cleanup Firestore listener
    }, [teacherEmail]); // Runs only when teacherEmail changes

    // Step 3: Handle Accepting Invitations
    const handleAccept = async (inviteId) => {
        try {
            await updateDoc(doc(db, "invitations", inviteId), { status: "accepted" });
            toast({
                title: "Invitation Accepted",
                description: "You have successfully accepted the invitation.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            onClose();
        } catch (err) {
            console.error("Error accepting invitation:", err);
            setError("Failed to accept the invitation.");
        }
    };

    // Step 4: Handle Rejecting Invitations
    const handleReject = async (inviteId) => {
        try {
            await updateDoc(doc(db, "invitations", inviteId), { status: "rejected" });
            toast({
                title: "Invitation Rejected",
                description: "You have rejected the invitation.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            onClose();
        } catch (err) {
            console.error("Error rejecting invitation:", err);
            setError("Failed to reject the invitation.");
        }
    };

    return (
        <Box p={6}>
            <Heading size="xl" mb={6}>Invitations</Heading>

            {error && <Text color="red.500">{error}</Text>}

            {loading ? (
                <Flex justify="center" align="center" height="200px">
                    <Spinner size="xl" />
                </Flex>
            ) : invitations.length === 0 ? (
                <Text textAlign="center" color="gray.600">No invitations at this time.</Text>
            ) : (
                <Flex wrap="wrap" gap={4}>
                    {invitations.map((invite) => (
                        <Box
                            key={invite.id}
                            bg="white"
                            p={4}
                            borderRadius="md"
                            boxShadow="lg"
                            width="320px"
                            cursor="pointer"
                            _hover={{ transform: "scale(1.02)", transition: "0.2s" }}
                            onClick={() => { setSelectedInvitation(invite); onOpen(); }}
                        >
                            <Heading size="md">{invite.eventName}</Heading>
                            <Text fontSize="sm" color="gray.600">From: {invite.senderEmail}</Text>
                            <Text fontSize="sm" color="gray.500">
                                Sent: {invite.sentAt ? new Date(invite.sentAt).toLocaleString() : "Unknown"}
                            </Text>
                            <Text mt={2}>
                                Status: <strong style={{
                                color: invite.status === "accepted" ? "green" :
                                    invite.status === "rejected" ? "red" : "orange"
                            }}>{invite.status}</strong>
                            </Text>
                        </Box>
                    ))}
                </Flex>
            )}

            {/* Modal for Viewing Invitation Letter */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedInvitation?.eventName}</ModalHeader>
                    <ModalBody>
                        <Text fontSize="md">
                            <strong>From:</strong> {selectedInvitation?.senderEmail}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                            <strong>Sent:</strong> {selectedInvitation?.sentAt ? new Date(selectedInvitation.sentAt).toLocaleString() : "Unknown"}
                        </Text>
                        <Text mt={4}>{selectedInvitation?.message}</Text>
                    </ModalBody>
                    <ModalFooter>
                        {selectedInvitation?.status === "pending" && (
                            <HStack spacing={4}>
                                <Button colorScheme="green" onClick={() => handleAccept(selectedInvitation.id)}>
                                    Accept
                                </Button>
                                <Button colorScheme="red" onClick={() => handleReject(selectedInvitation.id)}>
                                    Reject
                                </Button>
                            </HStack>
                        )}
                        <Button variant="ghost" ml={4} onClick={onClose}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default TeacherInvite;
