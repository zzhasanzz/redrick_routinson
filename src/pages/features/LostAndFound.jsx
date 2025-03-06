import React, { useState, useEffect, useContext } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    SimpleGrid,
    Card,
    Heading,
    Text,
    Image,
    useToast,
    Badge,
    Select,
    Flex,
    Tag,
    Stack,
    InputGroup,
    InputLeftElement,
    Icon,
} from "@chakra-ui/react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { FiMapPin, FiEye, FiFlag, FiUser, FiPhone } from "react-icons/fi";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const LostAndFound = () => {
    const { currentUser } = useContext(AuthContext);
    const toast = useToast();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("lost");
    const [location, setLocation] = useState("");
    const [imageBase64, setImageBase64] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");

    // Claim states
    const [claimDescription, setClaimDescription] = useState("");
    const [claimImages, setClaimImages] = useState([]);
    const [contactNumber, setContactNumber] = useState("");
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedClaim, setSelectedClaim] = useState(null);

    // Modals
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isClaimOpen, onOpen: onClaimOpen, onClose: onClaimClose } = useDisclosure();
    const { isOpen: isClaimsOpen, onOpen: onClaimsOpen, onClose: onClaimsClose } = useDisclosure();
    const { isOpen: isClaimDetailOpen, onOpen: onClaimDetailOpen, onClose: onClaimDetailClose } = useDisclosure();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "lostFoundPosts"));
            const postsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(postsData);
        } catch (error) {
            console.error("Error fetching posts: ", error);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const base64 = await convertToBase64(file);
            setImageBase64(base64);
        } catch (error) {
            console.error("Error converting image: ", error);
        }
    };

    const handleSubmitPost = async () => {
        if (!title || !description) {
            toast({
                title: "Missing Information",
                description: "Please fill in title and description",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await addDoc(collection(db, "lostFoundPosts"), {
                title,
                description,
                type,
                date: serverTimestamp(),
                location,
                imageBase64,
                userId: currentUser?.uid,
                status: "open",
                claims: [],
            });

            toast({
                title: "Post Created",
                description: "Your post has been created successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            resetForm();
            onClose();
            fetchPosts();
        } catch (error) {
            console.error("Error creating post: ", error);
        }
    };

    const handleClaim = async () => {
        if (!claimDescription || !contactNumber) {
            toast({
                title: "Missing Information",
                description: "Please provide a description and contact number",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const imageBase64s = await Promise.all(
                claimImages.map(file => convertToBase64(file))
            );

            const claimData = {
                userId: currentUser?.uid,
                userName: currentUser?.displayName || "Anonymous",
                description: claimDescription,
                images: imageBase64s,
                contactNumber,
                createdAt: new Date().toISOString(),
                status: "pending",
            };

            const postRef = doc(db, "lostFoundPosts", selectedPost.id);
            await updateDoc(postRef, {
                claims: arrayUnion(claimData),
            });

            toast({
                title: "Claim Submitted",
                description: "Your claim has been submitted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            resetClaimForm();
            onClaimClose();
            fetchPosts();
        } catch (error) {
            console.error("Error submitting claim: ", error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await deleteDoc(doc(db, "lostFoundPosts", postId));
            toast({
                title: "Post Deleted",
                description: "The post has been successfully removed",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchPosts();
        } catch (error) {
            console.error("Error deleting post: ", error);
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setType("lost");
        setLocation("");
        setImageBase64("");
    };

    const resetClaimForm = () => {
        setClaimDescription("");
        setClaimImages([]);
        setContactNumber("");
    };

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || post.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <Box p={5} maxW="1600px" mx="auto">
            <Flex justifyContent="space-between" gap={5} alignItems="center" mb={6}>
                {/* New Post Button */}
                <Button
                    colorScheme="teal"
                    onClick={onOpen}
                    leftIcon={<AddIcon />}
                    size="lg"
                    borderRadius="lg"
                    boxShadow="md"
                    backgroundColor="rgb(110, 170, 183)"
                    flex={1} // Equal space
                >
                    New Post
                </Button>

                {/* Search Box */}
                <InputGroup flex={2} maxW="none" marginTop="25px" borderColor="rgb(92, 177, 172)" borderRadius="lg"> {/* More space for search box */}
                    <InputLeftElement pointerEvents="none" color="gray.400">
                        <SearchIcon />
                    </InputLeftElement>
                    <Input
                        placeholder="Search posts by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        borderRadius="lg"

                        focusBorderColor="teal.400"
                        size="lg"
                    />
                </InputGroup>

                {/* Dropdown */}
                <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    flex={1} // Equal space
                    borderRadius="lg"
                    borderColor="rgb(92, 177, 172)"
                    focusBorderColor="teal.400"
                    size="lg"
                    marginTop="10px"
                >
                    <option value="all">All Types</option>
                    <option value="lost">Lost Items</option>
                    <option value="found">Found Items</option>
                </Select>
            </Flex>

            {/* Create Post Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl">
                    <ModalHeader bg="teal.500" color="white" borderTopRadius="2xl">
                        <Heading fontSize="2xl">Create New Post</Heading>
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody py={6}>
                        <VStack spacing={5}>
                            <FormControl isRequired>
                                <FormLabel fontWeight="600">Title</FormLabel>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    size="lg"
                                    borderRadius="lg"
                                    focusBorderColor="teal.400"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600">Type</FormLabel>
                                <Select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    size="lg"
                                    borderRadius="lg"
                                    focusBorderColor="teal.400"
                                >
                                    <option value="lost">Lost Item</option>
                                    <option value="found">Found Item</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="600">Description</FormLabel>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    size="lg"
                                    borderRadius="lg"
                                    focusBorderColor="teal.400"
                                    rows={4}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="600">Location</FormLabel>
                                <Input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    size="lg"
                                    borderRadius="lg"
                                    focusBorderColor="teal.400"
                                    placeholder="Where was it lost/found?"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="600">Upload Image</FormLabel>
                                <Box
                                    border="2px dashed"
                                    borderColor="gray.200"
                                    borderRadius="lg"
                                    p={6}
                                    textAlign="center"
                                    _hover={{ borderColor: "teal.400" }}
                                >
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        opacity={0}
                                        position="absolute"
                                        zIndex={1}
                                        width="100%"
                                        height="100%"
                                        cursor="pointer"
                                    />
                                    <Box>
                                        <AddIcon boxSize={6} color="gray.400" mb={2} />
                                        <Text fontSize="sm" color="gray.500">
                                            Click to upload or drag and drop
                                        </Text>
                                        <Text fontSize="xs" color="gray.400" mt={1}>
                                            PNG, JPG up to 2MB
                                        </Text>
                                    </Box>
                                </Box>
                                {imageBase64 && (
                                    <Image
                                        src={imageBase64}
                                        alt="Preview"
                                        mt={4}
                                        borderRadius="lg"
                                        maxH="200px"
                                        objectFit="cover"
                                    />
                                )}
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTopWidth={1}>
                        <Button
                            colorScheme="teal"
                            onClick={handleSubmitPost}
                            size="lg"
                            px={8}
                            borderRadius="lg"
                        >
                            Publish Post
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Claim Modal */}
            <Modal isOpen={isClaimOpen} onClose={onClaimClose} size="xl">
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl">
                    <ModalHeader bg="teal.500" color="white" borderTopRadius="2xl">
                        <Heading fontSize="2xl">Submit</Heading>
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody py={6}>
                        <VStack spacing={5}>
                            <FormControl isRequired>
                                <FormLabel fontWeight="600">Contact Number</FormLabel>
                                <Input
                                    type="tel"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    size="lg"
                                    borderRadius="lg"
                                    focusBorderColor="teal.400"
                                    placeholder="Enter your contact number"
                                    pattern="[0-9]{10}"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="600">Proof Description</FormLabel>
                                <Textarea
                                    value={claimDescription}
                                    onChange={(e) => setClaimDescription(e.target.value)}
                                    size="lg"
                                    borderRadius="lg"
                                    focusBorderColor="teal.400"
                                    rows={4}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontWeight="600">Upload Proof Images</FormLabel>
                                <Box
                                    border="2px dashed"
                                    borderColor="gray.200"
                                    borderRadius="lg"
                                    p={6}
                                    textAlign="center"
                                    _hover={{ borderColor: "teal.400" }}
                                >
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setClaimImages([...e.target.files])}
                                        opacity={0}
                                        position="absolute"
                                        zIndex={1}
                                        width="100%"
                                        height="100%"
                                        cursor="pointer"
                                    />
                                    <Box>
                                        <AddIcon boxSize={6} color="gray.400" mb={2} />
                                        <Text fontSize="sm" color="gray.500">
                                            Click to upload or drag and drop
                                        </Text>
                                        <Text fontSize="xs" color="gray.400" mt={1}>
                                            PNG, JPG up to 2MB
                                        </Text>
                                    </Box>
                                </Box>
                                {claimImages.length > 0 && (
                                    <Flex wrap="wrap" gap={2} mt={4}>
                                        {claimImages.map((file, idx) => (
                                            <Image
                                                key={idx}
                                                src={URL.createObjectURL(file)}
                                                alt={`Proof ${idx + 1}`}
                                                boxSize="100px"
                                                objectFit="cover"
                                                borderRadius="md"
                                            />
                                        ))}
                                    </Flex>
                                )}
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTopWidth={1}>
                        <Button
                            colorScheme="teal"
                            onClick={handleClaim}
                            size="lg"
                            px={8}
                            borderRadius="lg"
                        >
                            Submit Claim
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Claims Modal */}
            <Modal isOpen={isClaimsOpen} onClose={onClaimsClose} size="xl">
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl">
                    <ModalHeader bg="teal.500" color="white" borderTopRadius="2xl">
                        <Heading fontSize="2xl">Claims for {selectedPost?.title}</Heading>
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody py={6}>
                        <VStack spacing={4}>
                            {selectedPost?.claims?.map((claim, index) => (
                                <Card
                                    key={index}
                                    p={4}
                                    borderRadius="lg"
                                    boxShadow="md"
                                    _hover={{ boxShadow: "lg" }}
                                    transition="all 0.2s"
                                    w="100%"
                                >
                                    <Stack spacing={3}>
                                        <Flex justify="space-between" align="center">
                                            <Flex align="center">
                                                <Icon as={FiUser} mr={2} />
                                                <Text fontWeight="bold">{claim.userName}</Text>
                                            </Flex>
                                            <Badge
                                                colorScheme={claim.status === "pending" ? "yellow" : "green"}
                                                px={3}
                                                py={1}
                                                borderRadius="full"
                                            >
                                                {claim.status}
                                            </Badge>
                                        </Flex>

                                        {claim.contactNumber && (
                                            <Flex align="center" color="gray.600">
                                                <Icon as={FiPhone} mr={2} />
                                                <Text>{claim.contactNumber}</Text>
                                            </Flex>
                                        )}

                                        <Text noOfLines={2} color="gray.600">
                                            {claim.description}
                                        </Text>

                                        <Button
                                            size="sm"
                                            colorScheme="teal"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedClaim(claim);
                                                onClaimDetailOpen();
                                            }}
                                        >
                                            View Full Details
                                        </Button>
                                    </Stack>
                                </Card>
                            ))}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Claim Details Modal */}
            <Modal isOpen={isClaimDetailOpen} onClose={onClaimDetailClose} size="xl">
                <ModalOverlay bg="blackAlpha.600" />
                <ModalContent borderRadius="2xl">
                    <ModalHeader bg="teal.500" color="white" borderTopRadius="2xl">
                        <Heading fontSize="2xl">Claim Details</Heading>
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="start">
                            <Text fontWeight="bold">Claimer: {selectedClaim?.userName}</Text>
                            <Text>{selectedClaim?.description}</Text>
                            <Flex wrap="wrap" gap={2}>
                                {selectedClaim?.images?.map((img, idx) => (
                                    <Image
                                        key={idx}
                                        src={img}
                                        alt={`Proof ${idx + 1}`}
                                        boxSize="150px"
                                        objectFit="cover"
                                        borderRadius="md"
                                    />
                                ))}
                            </Flex>
                            <Tag
                                colorScheme={selectedClaim?.status === "pending" ? "yellow" : "green"}
                                px={3}
                                py={1}
                                borderRadius="full"
                            >
                                Status: {selectedClaim?.status}
                            </Tag>
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTopWidth={1}>
                        <Button
                            colorScheme="teal"
                            onClick={onClaimDetailClose}
                            size="lg"
                            px={8}
                            borderRadius="lg"
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Posts Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {filteredPosts.map((post) => (
                    <Card
                        key={post.id}
                        p={3} // Reduced padding
                        borderRadius="2xl"
                        boxShadow="md"
                        _hover={{
                            transform: "translateY(-4px)",
                            boxShadow: "xl",
                            transition: "all 0.2s"
                        }}
                        transition="all 0.2s"
                        backgroundColor="rgb(193, 230, 235)"
                    >
                        {post.imageBase64 && (
                            <Image
                                src={post.imageBase64}
                                alt={post.title}
                                height="350px" // Reduced height
                                objectFit="cover"
                                borderRadius="xl"
                                mb={3} // Reduced margin bottom
                            />
                        )}
                        <Stack spacing={3}> {/* Reduced spacing */}
                            <Flex justify="space-between" align="center">
                                <Badge
                                    colorScheme={post.type === "lost" ? "red" : "green"}
                                    px={2} // Reduced padding
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs" // Smaller font size
                                >
                                    {post.type.toUpperCase()}
                                </Badge>
                                <Badge
                                    colorScheme={post.status === "open" ? "green" : "gray"}
                                    variant="subtle"
                                    px={2} // Reduced padding
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs" // Smaller font size
                                >
                                    {post.status.toUpperCase()}
                                </Badge>
                            </Flex>

                            <Box borderBottom="1px solid" borderColor="gray.200" pb={2}> {/* Add a subtle border */}
                                <Heading size="sm" noOfLines={1} mb={1}>{post.title}</Heading> {/* Smaller heading size */}
                                <Flex align="center" color="gray.600" fontSize="sm">
                                    <Icon as={FiMapPin} mr={1} /> {/* Icon with reduced margin */}
                                    <Text fontSize="sm" marginTop="13px">{post.location || "Unknown location"}</Text> {/* Consistent font size */}
                                </Flex>
                            </Box>

                            <Text
                                color="gray.600"
                                noOfLines={3}
                                lineHeight="tall"
                                fontSize="sm"
                            >
                                {post.description}
                            </Text>

                            <Flex justify="space-between" align="center" mt={2}> {/* Reduced margin top */}
                                <Text fontSize="xs" color="gray.500" > {/* Smaller font size */}
                                    Posted {formatDistanceToNow(new Date(post.date?.toDate()), { addSuffix: true })}
                                </Text>
                                {post.userId === currentUser?.uid ? (
                                    <Button
                                        size="sm" // Smaller button size
                                        colorScheme="teal"
                                        variant="outline"
                                        rightIcon={<Icon as={FiEye} />}
                                        onClick={() => {
                                            setSelectedPost(post);
                                            onClaimsOpen();
                                        }}
                                        marginBottom="20px"
                                    >
                                        {post.claims.length}  {post.type === 'lost' ? 'Found' : 'Claim'}
                                    </Button>
                                ) : (
                                    <Button
                                        size="xs" // Smaller button size
                                        colorScheme="teal"
                                        rightIcon={<Icon as={FiFlag} />}
                                        onClick={() => {
                                            setSelectedPost(post);
                                            onClaimOpen();
                                        }}
                                    >
                                        {post.type === 'lost' ? 'I Found This' : 'This is Mine'}
                                    </Button>
                                )}
                            </Flex>

                            {/* Delete/Found Button */}
                            {post.userId === currentUser?.uid && (
                                <Button
                                    size="sm" // Smaller button size
                                    backgroundColor="rgb(183, 209, 214)"
                                    variant="solid"
                                    mt={1} // Reduced margin top
                                    onClick={() => handleDeletePost(post.id)}
                                >
                                    Mark as Found/Returned
                                </Button>
                            )}
                        </Stack>
                    </Card>
                ))}
            </SimpleGrid>
        </Box>
    );
};

export default LostAndFound;