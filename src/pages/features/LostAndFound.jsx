import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    SimpleGrid,
    Flex,
    Card,
    Heading,
    Text,
    Image,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Tabs
} from "@chakra-ui/react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

const LostAndFound = () => {
    const { currentUser } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]); // To store filtered items based on search
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchItemName, setSearchItemName] = useState(""); // State for search by name
    const [searchDate, setSearchDate] = useState(""); // State for search by date
    const [itemName, setItemName] = useState("");
    const [userID, setUserID] = useState("");
    const [description, setDescription] = useState("");
    const [dateFound, setDateFound] = useState(new Date());
    const [image, setImage] = useState(null);
    const [email, setEmail] = useState(""); 
    const [phone, setPhone] = useState(""); 
    const [claimerID, setClaimerID] = useState(""); // State for claim ID
    const [claimerPhone, setClaimerPhone] = useState(""); // State for claim phone
    const [claimerDescription, setClaimerDescription] = useState(""); // State for claim description
    const { isOpen, onOpen, onClose } = useDisclosure();  // Modal for Adding Lost Item
    const { isOpen:isAddOpen, onOpen:onAddOpen, onClose:onAddClose } = useDisclosure();  // Modal for Adding Lost Item
    
    const { isOpen: isClaimOpen, onOpen: onClaimOpen, onClose: onClaimClose } = useDisclosure();  // Modal for Claiming Item
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();  // Modal for Deleting Post

    // Fetch Lost and Found items from Firestore
    const fetchItems = async () => {
        setLoading(true);
        try {
            const itemCollection = collection(db, "lostAndFound");
            const itemSnapshot = await getDocs(itemCollection);
            const itemList = itemSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setItems(itemList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching items: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        const filteredItems = items.filter((item) => {
            // Check if the item name includes the search string
            const nameMatch = searchItemName === "" || item.itemName.toLowerCase().includes(searchItemName.toLowerCase());

            // Check if the item date is the same or later than the search date
            const dateMatch = searchDate === "" || new Date(item.dateFound).toLocaleDateString() >= new Date(searchDate).toLocaleDateString();

            return nameMatch && dateMatch;
        });

        setFilteredItems(filteredItems); // Update the filtered items
    }, [searchItemName, searchDate, items]);

    // Handle image upload for Lost Item
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

    // Submit new Lost and Found item to Firestore
    const handleSubmit = async () => {
        if (!itemName || !userID || !description || !dateFound || !email || !phone) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const itemRef = collection(db, "lostAndFound");
            const docRef = await addDoc(itemRef, {
                itemName,
                userID,
                description,
                dateFound: dateFound.toISOString(),
                image,
                email,
                phone,
                claimed: false,
            });

            console.log("Document written with ID: ", docRef.id); 

            fetchItems(); 
            onClose();
            alert("Lost and Found item added successfully!");
            onAddClose();
        } catch (error) {
            console.error("Error adding item: ", error);
        }


    };

    const handleCardClick = (item) => {
        setSelectedItem(item);
        onOpen();
    };

    // Handle claiming an item
    const handleClaimItem = async (itemId) => {
        onClaimOpen(); // Open claim modal
        setSelectedItem(itemId); // Set selected item for claiming
    };

    // Handle claim submission
    const handleClaimSubmit = async () => {
        const itemDoc = doc(db, "lostAndFound", selectedItem.id);
        await updateDoc(itemDoc, {
            claimed: true,
            claimerID,
            claimerPhone,
            claimerDescription,
        });

        fetchItems();
        onClaimClose();
        alert("Claim submitted successfully!");
    };

    // Handle deletion of a post
    const handleDeletePost = async (itemId) => {
        const itemDoc = doc(db, "lostAndFound", itemId);
        await deleteDoc(itemDoc);
        fetchItems(); // Refresh the list after deletion
    };

    return (
        <Box p={5}>
            {/* Tabs for All Posts, My Posts, Lost a Post, Search */}
            <Tabs variant="enclosed" mb={5}>
                <TabList>
                    <Tab>All Posts</Tab>
                    <Tab>My Posts</Tab>
                    <Tab>Lost a Post</Tab>
                    <Tab>Search</Tab>
                </TabList>
                <TabPanels>
                    {/* All Posts Tab */}
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                            {items.map((item) => (
                                <Card
                                    key={item.id}
                                    borderWidth="1px"
                                    borderRadius="lg"
                                    overflow="hidden"
                                    cursor="pointer"
                                    onClick={() => handleCardClick(item)}
                                >
                                    <Flex>
                                        <Box flex="1" p={4}>
                                            <Heading size="md" mb={2} isTruncated>
                                                {item.itemName}
                                            </Heading>
                                            <Text fontSize="sm" fontWeight="bold">User ID:</Text>
                                            <Text fontSize="sm" mb={2}>{item.userID}</Text>
                                            <Text fontSize="sm" noOfLines={2} mb={2}>{item.description}</Text>
                                            <Text fontSize="sm" fontWeight="bold">Date Found:</Text>
                                            <Text fontSize="sm" mb={2}>{new Date(item.dateFound).toDateString()}</Text>
                                            {/* Show Claim button only if the email is not the current user's email and item is not claimed */}
                                            {item.email !== currentUser.email && item.claimed && (
                                                <Button colorScheme="green" onClick={() => handleClaimItem(item.id)}>
                                                    Claim Item
                                                </Button>
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
                                                src={item.image || "https://via.placeholder.com/400"} // Fallback to a placeholder if no image
                                                alt={item.itemName}
                                                width="400px"
                                                height="350px"
                                                objectFit="cover"
                                            />
                                        </Box>
                                    </Flex>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </TabPanel>

                    {/* My Posts Tab */}
                    <TabPanel>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                            {items
                                .filter((item) => item.email === currentUser.email) // Show only posts by the current user
                                .map((item) => (
                                    <Card
                                        key={item.id}
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        cursor="pointer"
                                        onClick={() => handleCardClick(item)}
                                    >
                                        <Flex>
                                            <Box flex="1" p={4}>
                                                <Heading size="md" mb={2} isTruncated>
                                                    {item.itemName}
                                                </Heading>
                                                <Text fontSize="sm" fontWeight="bold">User ID:</Text>
                                                <Text fontSize="sm" mb={2}>{item.userID}</Text>
                                                <Text fontSize="sm" noOfLines={2} mb={2}>{item.description}</Text>
                                                <Text fontSize="sm" fontWeight="bold">Date Found:</Text>
                                                <Text fontSize="sm" mb={2}>{new Date(item.dateFound).toDateString()}</Text>
                                                {/* Add a Delete button for posts by the current user */}
                                                <Button colorScheme="red" onClick={() => handleDeletePost(item.id)} mt={3}>
                                                    Delete Post
                                                </Button>
                                            </Box>
                                        </Flex>
                                    </Card>
                                ))}
                        </SimpleGrid>
                    </TabPanel>

                    {/* Lost a Post Tab */}
                    <TabPanel>
                        <Button colorScheme="blue" onClick={onAddOpen}>Make a Post About Lost Item</Button>
                    </TabPanel>

                    {/* Search Tab */}
                    <TabPanel>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Search by Item Name</FormLabel>
                                <Input
                                    value={searchItemName}
                                    onChange={(e) => setSearchItemName(e.target.value)}
                                    placeholder="Search by item name"
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Search by Date of Loss</FormLabel>
                                <Input
                                    type="date"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                    placeholder="Select date"
                                />
                            </FormControl>
                        </VStack>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>
                            {filteredItems.length === 0 ? (
                                <Text>No results found</Text>
                            ) : (
                                filteredItems.map((item) => (
                                    <Card
                                        key={item.id}
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        overflow="hidden"
                                        cursor="pointer"
                                        onClick={() => handleCardClick(item)}
                                    >
                                        <Flex>
                                            <Box flex="1" p={4}>
                                                <Heading size="md" mb={2} isTruncated>
                                                    {item.itemName}
                                                </Heading>
                                                <Text fontSize="sm" fontWeight="bold">User ID:</Text>
                                                <Text fontSize="sm" mb={2}>{item.userID}</Text>
                                                <Text fontSize="sm" noOfLines={2} mb={2}>{item.description}</Text>
                                                <Text fontSize="sm" fontWeight="bold">Date Found:</Text>
                                                <Text fontSize="sm" mb={2}>{new Date(item.dateFound).toDateString()}</Text>
                                            </Box>
                                        </Flex>
                                    </Card>
                                ))
                            )}
                        </SimpleGrid>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Modal for Adding a Lost Item */}
            <Modal isOpen={isAddOpen} onClose={onAddClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create a new Lost Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Item Name</FormLabel>
                                <Input
                                    placeholder="Enter item name"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>User ID</FormLabel>
                                <Input
                                    placeholder="Enter your User ID"
                                    value={userID}
                                    onChange={(e) => setUserID(e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    placeholder="Provide a description for the item"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Date Found</FormLabel>
                                <Input
                                    type="date"
                                    value={dateFound.toISOString().split("T")[0]}
                                    onChange={(e) => setDateFound(new Date(e.target.value))}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Email Address</FormLabel>
                                <Input
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Phone Number</FormLabel>
                                <Input
                                    placeholder="Enter your phone number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Upload Item Image</FormLabel>
                                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleSubmit}>
                            Submit Item
                        </Button>
                        <Button variant="ghost" onClick={onAddClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Claim Modal */}
            <Modal isOpen={isClaimOpen} onClose={onClaimClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Claim This Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Your ID</FormLabel>
                                <Input
                                    value={claimerID}
                                    onChange={(e) => setClaimerID(e.target.value)}
                                    placeholder="Enter your ID"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Your Phone Number</FormLabel>
                                <Input
                                    value={claimerPhone}
                                    onChange={(e) => setClaimerPhone(e.target.value)}
                                    placeholder="Enter your phone number"
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Claim Description</FormLabel>
                                <Textarea
                                    value={claimerDescription}
                                    onChange={(e) => setClaimerDescription(e.target.value)}
                                    placeholder="Describe why you are claiming this item"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleClaimSubmit}>
                            Submit Claim
                        </Button>
                        <Button variant="ghost" onClick={onClaimClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default LostAndFound;
