import React, { useState, useEffect } from "react";
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
    SimpleGrid,
    Flex,
    Card,
    Heading,
    Text,
    Spinner,
    Center,
    Image,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from "@chakra-ui/react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

const LostAndFound = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemName, setItemName] = useState("");
    const [userID, setUserID] = useState(""); // User ID input by the user
    const [description, setDescription] = useState("");
    const [dateFound, setDateFound] = useState(new Date());
    const [image, setImage] = useState(null);
    const [email, setEmail] = useState(""); // New state for email
    const [phone, setPhone] = useState(""); // New state for phone
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDetailsOpen,
        onOpen: onDetailsOpen,
        onClose: onDetailsClose,
    } = useDisclosure();
    const {
        isOpen: isMyPostsOpen,
        onOpen: onMyPostsOpen,
        onClose: onMyPostsClose,
    } = useDisclosure();
    const {
        isOpen: isClaimOpen,
        onOpen: onClaimOpen,
        onClose: onClaimClose,
    } = useDisclosure();
    const [claimerID, setClaimerID] = useState("");
    const [claimerdesc, setClaimerdesc] = useState("");
    const [claimerPhone, setClaimerPhone] = useState("");
    const [posterContact, setPosterContact] = useState(null); // Poster contact details for claim
    const [searchItemName, setSearchItemName] = useState("");
    const [searchDescription, setSearchDescription] = useState("");
    const [searchUserID, setSearchUserID] = useState("");
    const [searchDate, setSearchDate] = useState(""); // Optional: Search by date
    const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure();
    const { isOpen: isSearchResultsOpen,  onClose: onSearchResultsClose } = useDisclosure();
    const [filteredItems, setFilteredItems] = useState([]); // For storing filtered items based on search
    const [lostItemID, setLostItemID] = useState(""); // Store Item ID
    const [lostItemName, setLostItemName] = useState(""); // Store User ID or Name
    const [isLostPostFormVisible, setLostPostFormVisible] = useState(false); // Control the visibility of the form


    

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
                claimed: false,  // Initial state is not claimed
            });

            console.log("Document written with ID: ", docRef.id); // Log the document ID

            // Refresh the items after adding a new item
            fetchItems(); // This ensures the new item appears in the list
            onClose();
            alert("Lost and Found item added successfully!");
        } catch (error) {
            console.error("Error adding item: ", error);
        }
    };

    // Handle click on a Lost and Found item card
    const handleCardClick = (item) => {
        setSelectedItem(item);
        onDetailsOpen();
    };

    // Handle claiming an item
    const handleClaimItem = async (itemId) => {
        const itemDoc = doc(db, "lostAndFound", itemId);
        await updateDoc(itemDoc, { claimed: true }); // Set the item as claimed
        fetchItems(); // Refresh the items to show the claimed item

        // Fetch poster's contact information (email and phone) for the claimer
        const item = items.find((item) => item.id === itemId);
        setPosterContact({ email: item.email, phone: item.phone });
        onClaimOpen(); // Open the claim modal
    };

    // Handle deletion of a post (for the poster)
    const handleDeletePost = async (itemId) => {
        const itemDoc = doc(db, "lostAndFound", itemId);
        await deleteDoc(itemDoc);
        fetchItems(); // Refresh the list after deletion
    };
    // Handle Search Logic
        const handleSearch = () => {
            const filteredItems = items.filter((item) => {
                return (
                    (searchItemName === "" || item.itemName.toLowerCase().includes(searchItemName.toLowerCase())) &&
                    (searchDescription === "" || item.description.toLowerCase().includes(searchDescription.toLowerCase())) &&
                    (searchUserID === "" || item.userID.toLowerCase().includes(searchUserID.toLowerCase())) &&
                    (searchDate === "" || new Date(item.dateFound).toLocaleDateString() === new Date(searchDate).toLocaleDateString())
                );
            });

            if (filteredItems.length === 0) {
                alert("No results found");
            }

            setFilteredItems(filteredItems); // Update the filteredItems state with the results
            onSearchClose(); // Close the search modal after search
            onSearchResultsOpen(); // Open the results modal
        };

    
        const handleLostPostSubmit = async () => {
            if (!lostItemID || !lostItemName) {
                alert("Please fill in the Item ID and your Name/ID");
                return;
            }
        
            // Update the Firestore document to indicate the item is marked as lost
            try {
                const itemRef = doc(db, "lostAndFound", lostItemID);
                await updateDoc(itemRef, {
                    lostBy: lostItemName, // Add the user info to the lost item
                    lostStatus: true, // Mark the item as lost
                });
        
                alert("Lost item details updated successfully!");
                setLostPostFormVisible(false); // Hide the form after submission
            } catch (error) {
                console.error("Error submitting lost post: ", error);
            }
        };
        
        const onLostPostClick = () => {
            setLostPostFormVisible(true); // Display the form when the button is clicked
        };
        


    return (
        <Box p={5}>
            {/* Tabs for Add Lost Item, My Posts, and Lost a Post */}
            <Tabs variant="enclosed" mb={5}>
                <TabList>
                    <Tab>Add Lost Item</Tab>
                    <Tab onClick={onMyPostsOpen}>My Posts</Tab>
                    <Tab>Lost a Post</Tab> {/* New Tab for posting lost items */}
                    <Tab onClick={onSearchOpen}>Search</Tab>
                </TabList>

                <TabPanels>
                    {/* Add Lost Item Tab */}
                    <TabPanel>
                        <Button colorScheme="blue" onClick={onOpen}>
                            Add Lost Item
                        </Button>
                    </TabPanel>

                   {/* My Posts Modal */}
                    <Modal size="xxl" isOpen={isMyPostsOpen} onClose={onMyPostsClose}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>My Posts</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                {/* Filter to only show posts from the current user */}
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                                    {items
                                        .filter((item) => item.userID === userID) // Only show posts from the current user
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
                                                        <Text fontSize="sm" fontWeight="bold">
                                                            User ID:
                                                        </Text>
                                                        <Text fontSize="sm" mb={2}>
                                                            {item.userID}
                                                        </Text>
                                                        <Text fontSize="sm" noOfLines={2} mb={2} style={{ wordWrap: "break-word" }}>
                                                            {item.description}
                                                        </Text>
                                                        <Text fontSize="sm" fontWeight="bold">
                                                            Date Found:
                                                        </Text>
                                                        <Text fontSize="sm" mb={2}>
                                                            {new Date(item.dateFound).toDateString()}
                                                        </Text>

                                                        {/* Show poster's contact if the item is claimed */}
                                                        {item.claimed && (
                                                            <Box mt={2}>
                                                                <Text fontWeight="bold">Contact:</Text>
                                                                <Text>Email: {item.email}</Text>
                                                                <Text>Phone: {item.phone}</Text>
                                                            </Box>
                                                        )}

                                                        {/* Don't show "Claim Item" button in "My Posts" for own posts */}
                                                        {!item.claimed && item.userID !== userID && (
                                                            <Button colorScheme="green" onClick={() => handleClaimItem(item.id)}>
                                                                Claim Item
                                                            </Button>
                                                        )}

                                                        {/* Only show the "Delete Post" button for the post creator */}
                                                        {item.userID === userID && (
                                                            <Button colorScheme="red" onClick={() => handleDeletePost(item.id)} mt={3}>
                                                                Delete Post
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
                                                            src={item.image}
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
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="ghost" onClick={onMyPostsClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                  {/* Search Tab Modal */}
                <Modal isOpen={isSearchOpen} onClose={onSearchClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Search Lost and Found Items</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Search by Item Name</FormLabel>
                                    <Input
                                        value={searchItemName}
                                        onChange={(e) => setSearchItemName(e.target.value)}
                                        placeholder="Search by Item Name (optional)"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Search by Description</FormLabel>
                                    <Input
                                        value={searchDescription}
                                        onChange={(e) => setSearchDescription(e.target.value)}
                                        placeholder="Search by Description (optional)"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Search by User ID</FormLabel>
                                    <Input
                                        value={searchUserID}
                                        onChange={(e) => setSearchUserID(e.target.value)}
                                        placeholder="Search by User ID (optional)"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Search by Date Found</FormLabel>
                                    <Input
                                        type="date"
                                        value={searchDate}
                                        onChange={(e) => setSearchDate(e.target.value)}
                                        placeholder="Search by Date Found (optional)"
                                    />
                                </FormControl>
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" onClick={handleSearch}>
                                Search
                            </Button>
                            <Button variant="ghost" onClick={onSearchClose}>
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                 {/* Modal for Showing Search Results */}
<Modal isOpen={isSearchResultsOpen} onClose={onSearchResultsClose}>
    <ModalOverlay />
    <ModalContent>
        <ModalHeader>Search Results</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
            {/* Display the Matched Search Results */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                {filteredItems.length === 0 ? (
                    <Text>No results found</Text> // If no items match the search criteria
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
                                    <Text fontSize="sm" fontWeight="bold">
                                        User ID:
                                    </Text>
                                    <Text fontSize="sm" mb={2}>
                                        {item.userID}
                                    </Text>
                                    <Text fontSize="sm" noOfLines={2} mb={2} style={{ wordWrap: "break-word" }}>
                                        {item.description}
                                    </Text>
                                    <Text fontSize="sm" fontWeight="bold">
                                        Date Found:
                                    </Text>
                                    <Text fontSize="sm" mb={2}>
                                        {new Date(item.dateFound).toDateString()}
                                    </Text>

                                    {/* Hide "Claim Item" for user's own posts */}
                                    {!item.claimed && item.userID !== userID && (
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
                                        src={item.image}
                                        alt={item.itemName}
                                        width="400px"
                                        height="350px"
                                        objectFit="cover"
                                    />
                                </Box>
                            </Flex>
                        </Card>
                    ))
                )}
            </SimpleGrid>
        </ModalBody>
        <ModalFooter>
            <Button variant="ghost" onClick={onSearchResultsClose}>
                Close
            </Button>
        </ModalFooter>
    </ModalContent>
</Modal>
                       



                   // Inside the TabPanel for "Lost a Post"
<TabPanel>
    <Button colorScheme="blue" onClick={onOpen}>
        Lost a Post
    </Button>
    </TabPanel></TabPanels></Tabs>


            {/* Modal for Adding a Lost Item */}
            <Modal isOpen={isOpen} onClose={onClose}>
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
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {isLostPostFormVisible && (
    <VStack spacing={4} mt={5}>
        <FormControl isRequired>
            <FormLabel>Item ID</FormLabel>
            <Input
                placeholder="Enter the Item ID of the lost item"
                value={lostItemID}
                onChange={(e) => setLostItemID(e.target.value)}
            />
        </FormControl>

        <FormControl isRequired>
            <FormLabel>Your Name or ID</FormLabel>
            <Input
                placeholder="Enter your Name or ID"
                value={lostItemName}
                onChange={(e) => setLostItemName(e.target.value)}
            />
        </FormControl>

        <Button colorScheme="teal" onClick={handleLostPostSubmit}>
            Submit Lost Item Information
        </Button>
    </VStack>
)}


            {/* Modal for Claiming an Item */}
            <Modal isOpen={isClaimOpen} onClose={onClaimClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Claim this Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Your ID</FormLabel>
                            <Input
                                placeholder="Enter your ID"
                                value={claimerID}
                                onChange={(e) => setClaimerID(e.target.value)}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Your Phone Number</FormLabel>
                            <Input
                                placeholder="Enter your phone number"
                                value={claimerPhone}
                                onChange={(e) => setClaimerPhone(e.target.value)}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Description</FormLabel>
                            <Input
                                placeholder="Describe"
                                value={claimerdesc}
                                onChange={(e) => setClaimerdesc(e.target.value)}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="green" onClick={onClaimClose}>
                            Submit Claim
                        </Button>
                        <Button variant="ghost" onClick={onClaimClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Display the Matched Search Results */}
<SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mt={5}>
    {items.length === 0 ? (
        <Text>No results found</Text> // If no items match the search criteria
    ) : (
        items.map((item) => (
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
                        <Text fontSize="sm" fontWeight="bold">
                            User ID:
                        </Text>
                        <Text fontSize="sm" mb={2}>
                            {item.userID}
                        </Text>
                        <Text fontSize="sm" noOfLines={2} mb={2} style={{ wordWrap: "break-word" }}>
                            {item.description}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold">
                            Date Found:
                        </Text>
                        <Text fontSize="sm" mb={2}>
                            {new Date(item.dateFound).toDateString()}
                        </Text>

                        {/* Hide "Claim Item" for user's own posts */}
                        {!item.claimed && item.userID !== userID && (
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
                            src={item.image}
                            alt={item.itemName}
                            width="400px"
                            height="350px"
                            objectFit="cover"
                        />
                    </Box>
                </Flex>
            </Card>
        ))
    )}
</SimpleGrid>

           
        </Box>
    );
};

export default LostAndFound;
