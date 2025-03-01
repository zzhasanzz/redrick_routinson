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
    Card,
    CardHeader,
    CardBody,
    Tag,
    Image,
    Divider,
    Icon,
    Grid
} from "@chakra-ui/react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { FaCalendarAlt, FaEnvelopeOpenText, FaUniversity } from "react-icons/fa";
import {getDoc} from "firebase/firestore";
import {FaCheck} from "react-icons/fa6";
import {FaTimes} from "react-icons/fa";

const TeacherInvite = () => {
    const [teacherEmail, setTeacherEmail] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const auth = getAuth();

    useEffect(() => {
        const fetchTeacherEmail = async () => {
            try {
                const user = auth.currentUser;
                if (user?.email) {
                    const teacherRef = doc(db, "users", user.email);
                    const teacherSnap = await getDoc(teacherRef);
                    if (teacherSnap.exists()) {
                        setTeacherEmail(teacherSnap.data().email);
                    }
                }
            } catch (err) {
                toast({
                    title: "Error loading profile",
                    description: "Please try again later",
                    status: "error"
                });
            }
        };
        fetchTeacherEmail();
    }, [auth, toast]);

    useEffect(() => {
        if (!teacherEmail) return;

        const invitesQuery = query(
            collection(db, "invitations"),
            where("teacherEmail", "==", teacherEmail)
        );

        const unsubscribe = onSnapshot(invitesQuery,
            (snapshot) => {
                const inviteData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setInvitations(inviteData);
                setLoading(false);
            },
            (error) => {
                toast({
                    title: "Connection Error",
                    description: "Failed to load invitations",
                    status: "error"
                });
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [teacherEmail, toast]);

    const handleStatusUpdate = async (inviteId, status) => {
        try {
            await updateDoc(doc(db, "invitations", inviteId), { status });
            toast({
                title: `Invitation ${status}`,
                status: status === "accepted" ? "success" : "error",
                duration: 3000
            });
            onClose();
        } catch (err) {
            toast({
                title: "Update Failed",
                description: "Please try again",
                status: "error"
            });
        }
    };

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Flex maxW="1200px" mx="auto" direction="column" gap={8}>
                <Heading size="xl" color="teal.600" mb={6}>
                    <Icon as={FaEnvelopeOpenText} mr={3} />
                    Faculty Invitations
                </Heading>

                {loading ? (
                    <Flex justify="center" py={16}>
                        <Spinner size="xl" thickness="4px" color="teal.500" />
                    </Flex>
                ) : invitations.length === 0 ? (
                    <Card bg="white" boxShadow="lg">
                        <CardBody textAlign="center" py={12}>
                            <Text fontSize="xl" color="gray.500">
                                No pending invitations
                            </Text>
                        </CardBody>
                    </Card>
                ) : (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                        {invitations.map((invite) => (
                            <Card
                                key={invite.id}
                                bg="white"
                                boxShadow="md"
                                _hover={{ transform: "translateY(-2px)", transition: "0.2s" }}
                                cursor="pointer"
                                onClick={() => { setSelectedInvitation(invite); onOpen(); }}
                            >
                                <CardHeader pb={0}>
                                    <Flex align="center" justify="space-between">
                                        <Heading size="md">{invite.eventName}</Heading>
                                        <Tag
                                            colorScheme={
                                                invite.status === "accepted" ? "green" :
                                                    invite.status === "rejected" ? "red" : "orange"
                                            }
                                            size="sm"
                                        >
                                            {invite.status}
                                        </Tag>
                                    </Flex>
                                </CardHeader>
                                <CardBody>
                                    <VStack align="start" spacing={2}>
                                        <Text fontSize="sm" color="gray.600">
                                            <Icon as={FaUniversity} mr={2} />
                                            {invite.clubName}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            <Icon as={FaCalendarAlt} mr={2} />
                                            {new Date(invite.sentAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </Text>
                                        <Text fontSize="sm" color="gray.500" noOfLines={2}>
                                            From: {invite.senderEmail}
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </Grid>
                )}

                {/* Invitation Detail Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl">
                    <ModalOverlay bg="blackAlpha.600" />
                    <ModalContent>
                        <ModalHeader borderBottomWidth={1}>
                            <Heading size="lg">{selectedInvitation?.eventName}</Heading>
                            <Text fontSize="sm" color="gray.500" mt={1}>
                                {selectedInvitation?.clubName}
                            </Text>
                        </ModalHeader>
                        <ModalBody py={6}>
                            {selectedInvitation?.design && (
                                <Image
                                    src={selectedInvitation.design}
                                    alt="Invitation design"
                                    mb={6}
                                    borderRadius="md"
                                />
                            )}

                        </ModalBody>
                        <ModalFooter borderTopWidth={1}>
                            <Flex justify="space-between" w="full">
                                {selectedInvitation?.status === "pending" ? (
                                    <HStack spacing={4}>
                                        <Button
                                            colorScheme="green"
                                            variant="solid"
                                            leftIcon={<Icon as={FaCheck} />}
                                            onClick={() => handleStatusUpdate(selectedInvitation.id, "accepted")}
                                        >
                                            Accept Invitation
                                        </Button>
                                        <Button
                                            colorScheme="red"
                                            variant="solid"
                                            leftIcon={<Icon as={FaTimes} />} // Add an appropriate icon for decline
                                            onClick={() => handleStatusUpdate(selectedInvitation.id, "rejected")}
                                        >
                                            Decline
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Tag
                                        colorScheme={
                                            selectedInvitation?.status === "accepted" ? "green" : "red"
                                        }
                                        size="lg"
                                    >
                                        {selectedInvitation?.status.toUpperCase()}
                                    </Tag>
                                )}
                                <Button
                                    variant="ghost"
                                    colorScheme="gray"
                                    onClick={onClose}
                                >
                                    Close
                                </Button>
                            </Flex>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Flex>
        </Box>
    );
};

export default TeacherInvite;