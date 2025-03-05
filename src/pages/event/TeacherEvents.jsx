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
    Skeleton,
    Grid,
    Avatar,
    Stack,
    Divider,
    Icon
} from "@chakra-ui/react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { FaCalendarAlt, FaEnvelopeOpenText, FaUniversity, FaCheck, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

const TeacherInvite = () => {
    const [invitations, setInvitations] = useState([]);
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const auth = getAuth();
    const teacherEmail = auth.currentUser?.email;

    useEffect(() => {
        if (!teacherEmail) {
            toast({
                title: "Authentication required",
                description: "Please log in to view invitations",
                status: "warning"
            });
            return;
        }

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

    const StatusBadge = ({ status }) => (
        <Tag
            colorScheme={
                status === "accepted" ? "green" :
                    status === "rejected" ? "red" : "orange"
            }
            size="sm"
            borderRadius="full"
            px={3}
            py={1}
        >
            {status.toUpperCase()}
        </Tag>
    );

    const LoadingSkeletons = () => (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} borderRadius="lg">
                    <Card h="200px" />
                </Skeleton>
            ))}
        </Grid>
    );

    return (
        <Box p={8} bg="gray.50" minH="100vh">
            <Flex maxW="1200px" mx="auto" direction="column" gap={8}>
                <Stack spacing={4}>
                    <Heading size="xl" color="teal.600">
                        <Icon as={FaEnvelopeOpenText} mr={3} />
                        Faculty Invitations
                    </Heading>

                </Stack>

                {loading ? (
                    <LoadingSkeletons />
                ) : invitations.length === 0 ? (
                    <Card bg="white" boxShadow="lg" borderRadius="xl">
                        <CardBody textAlign="center" py={12}>
                            <Text fontSize="xl" color="gray.500">
                                No pending invitations found
                            </Text>
                        </CardBody>
                    </Card>
                ) : (
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                        {invitations.map((invite) => (
                            <MotionCard
                                key={invite.id}
                                bg="white"
                                boxShadow="md"
                                borderRadius="xl"
                                cursor="pointer"
                                onClick={() => { setSelectedInvitation(invite); onOpen(); }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                <CardHeader pb={0}>
                                    <Flex align="center" justify="space-between">
                                        <Avatar name={invite.clubName} bg="teal.500" />
                                        <StatusBadge status={invite.status} />
                                    </Flex>
                                </CardHeader>
                                <CardBody>
                                    <VStack align="start" spacing={3}>
                                        <Heading size="md" noOfLines={1}>{invite.eventName}</Heading>
                                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                            <Icon as={FaUniversity} mr={2} />
                                            {invite.clubName}
                                        </Text>
                                        <Divider />
                                        <HStack color="gray.500" spacing={3}>
                                            <FaCalendarAlt />
                                            <Text fontSize="sm">
                                                {new Date(invite.sentAt).toLocaleDateString()}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </MotionCard>
                        ))}
                    </Grid>
                )}

                {/* Invitation Detail Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="xl">
                    <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <ModalContent borderRadius="2xl">
                        <ModalHeader borderBottomWidth={1}>
                            <Heading size="lg">{selectedInvitation?.eventName}</Heading>
                            <Text fontSize="sm" color="gray.500" mt={1}>
                                Organized by {selectedInvitation?.clubName}
                            </Text>
                        </ModalHeader>
                        <ModalBody p={0}>
                            {selectedInvitation?.design ? (
                                <Image
                                    src={selectedInvitation.design}
                                    alt="Event design"
                                    w="100%"
                                    h="auto"
                                    borderRadius="xl"
                                    objectFit="cover"
                                />
                            ) : (
                                <Box
                                    bg="gray.100"
                                    borderRadius="xl"
                                    h="500px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    w="100%"
                                >
                                    <Text color="gray.500">No design available</Text>
                                </Box>
                            )}
                        </ModalBody>

                        <ModalFooter borderTopWidth={1}>
                            <Flex justify="space-between" w="full" align="center">
                                {selectedInvitation?.status === "pending" ? (
                                    <HStack spacing={4}>
                                        <Button
                                            colorScheme="green"
                                            variant="solid"
                                            leftIcon={<FaCheck />}
                                            onClick={() => handleStatusUpdate(selectedInvitation.id, "accepted")}
                                            size="lg"
                                            px={8}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            colorScheme="red"
                                            variant="outline"
                                            leftIcon={<FaTimes />}
                                            onClick={() => handleStatusUpdate(selectedInvitation.id, "rejected")}
                                            size="lg"
                                            px={8}
                                        >
                                            Decline
                                        </Button>
                                    </HStack>
                                ) : (
                                    <StatusBadge status={selectedInvitation?.status} />
                                )}
                                <Button variant="ghost" onClick={onClose}>
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