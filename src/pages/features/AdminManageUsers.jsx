import React, { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    useToast,
    Button,
    useDisclosure,
    Input,
    Select,
    Text,
} from "@chakra-ui/react";
import { db, auth } from "../../firebase"; // Ensure Firebase is initialized
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import UserTable from "../../components/UserTable";
import AddUserModal from "../../components/AddUserModal";

const AdminManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [filterDept, setFilterDept] = useState("");
    const [filterId, setFilterId] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [tabIndex, setTabIndex] = useState(0); // Track active tab index
    const [isFilterApplied, setIsFilterApplied] = useState(false); // Track if filter is applied
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fetch users from Firestore
    useEffect(() => {
        fetchUsers();
    }, []);

    // Reset filter states when the tab changes
    useEffect(() => {
        setFilterDept(""); // Reset department filter
        setFilterId(""); // Reset ID filter
        setFilteredUsers([]); // Clear filtered results
        setIsFilterApplied(false); // Reset filter applied state
    }, [tabIndex]);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(usersArray);
        } catch (error) {
            toast({
                title: "Error fetching users",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleFilterUsers = () => {
        let roleFilter = "";
        if (tabIndex === 0) roleFilter = "admin";
        else if (tabIndex === 1) roleFilter = "teacher";
        else if (tabIndex === 2) roleFilter = "student";

        const filtered = users.filter((user) => {
            // Normalize data for case-insensitive comparison
            const userDept = user.dept ? user.dept.toLowerCase() : "";
            const selectedDept = filterDept ? filterDept.toLowerCase() : "";

            const matchesDept = filterDept ? userDept === selectedDept : true;
            const matchesId = filterId ? user.id.toString() === filterId.toString() : true;
            const matchesRole = user.role === roleFilter; // Filter by active tab's role

            return matchesDept && matchesId && matchesRole;
        });

        setFilteredUsers(filtered);
        setIsFilterApplied(true); // Mark filter as applied
    };

    // Handle adding a new user
    const handleAddUser = async (userData) => {
        const { email, password, role, name, dept, research, semester, section, room, isPresident, id } = userData;
    
        try {
            // Step 1: Check if the user already exists in Firestore
            const userDocRef = doc(db, "users", email);
            const userDoc = await getDoc(userDocRef);
    
            if (userDoc.exists()) {
                toast({
                    title: "User already exists",
                    description: "A user with this email already exists.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
    
            // Step 2: Create the user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Step 3: Add the user to Firestore
            await setDoc(userDocRef, {
                email,
                role,
                name: role === "teacher" ? name : null, // Include name for teachers
                dept,
                research: role === "teacher" ? research : null, // Include research for teachers
                semester: role === "student" ? semester : null,
                section: role === "student" ? section : null,
                room,
                isPresident: isPresident || false,
                id: role === "student" ? id : null
            });
    
            // Update local state
            setUsers((prevUsers) => [
                ...prevUsers,
                {
                    id: role === "student" ? id : null,
                    email,
                    role,
                    name: role === "teacher" ? name : null, // Include name for teachers
                    dept,
                    research: role === "teacher" ? research : null, // Include research for teachers
                    semester: role === "student" ? semester : null,
                    section: role === "student" ? section : null,
                    room,
                    isPresident: isPresident || false,
                },
            ]);
    
            toast({
                title: "User added successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
    
            onClose(); // Close the modal
        } catch (error) {
            toast({
                title: "Error adding user",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Handle deleting a user
    const handleDeleteUser = async (userId) => {
        try {
            // Call the backend endpoint to delete the user
            const response = await fetch("http://localhost:5000/deleteUser", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to delete user");
            }
    
            // Remove user from local state
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    
            toast({
                title: "User deleted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            await fetchUsers();
        } catch (error) {
            toast({
                title: "Error deleting user",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Handle updating a field in Firestore
    const handleUpdateField = async (userId, field, value) => {
        try {
            const userDocRef = doc(db, "users", userId);
            await updateDoc(userDocRef, { [field]: value });

            // Update local state
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, [field]: value } : user
                )
            );

            // toast({
            //     title: "Field updated successfully",
            //     status: "success",
            //     duration: 3000,
            //     isClosable: true,
            // });
        } catch (error) {
            toast({
                title: "Error updating field",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Filter users by role
    const admins = users.filter((user) => user.role === "admin");
    const teachers = users.filter((user) => user.role === "teacher");
    const students = users.filter((user) => user.role === "student");

    // Determine which users to display based on filter and active tab
    const getUsersToDisplay = () => {
        if (isFilterApplied) {
            return filteredUsers; // Show filtered users
        } else {
            // Show all users for the active tab
            if (tabIndex === 0) return admins;
            else if (tabIndex === 1) return teachers;
            else if (tabIndex === 2) return students;
        }
    };

    const usersToDisplay = getUsersToDisplay();

    return (
        <Box p={5}>
            <Heading as="h1" size="xl" mb={5}>
                Manage Users
            </Heading>
            <Box display="flex" justifyContent="flex-end" mb={5}>
                <Select
                    placeholder="Select Department"
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    mr={2}
                    width="200px"
                >
                    <option value="CSE">CSE</option>
                    <option value="EEE">EEE</option>
                    <option value="MPE">MPE</option>
                    <option value="IPE">IPE</option>
                    <option value="CEE">CEE</option>
                    <option value="SWE">SWE</option>
                    <option value="BTM">BTM</option>
                    <option value="TVE">TVE</option>
                </Select>
                {tabIndex === 2 && ( // Only show ID input for Students tab
                    <Input
                        placeholder="ID"
                        value={filterId}
                        onChange={(e) => setFilterId(e.target.value)}
                        mr={2}
                        width="200px"
                    />
                )}
                <Button backgroundColor="rgb(181, 227, 228)" onClick={handleFilterUsers}>
                    Filter
                </Button>
            </Box>
            <Tabs variant="enclosed" onChange={(index) => setTabIndex(index)}>
                <TabList>
                    <Tab>Admins</Tab>
                    <Tab>Teachers</Tab>
                    <Tab>Students</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        {usersToDisplay.length > 0 ? (
                            <UserTable
                                users={usersToDisplay}
                                onDeleteUser={handleDeleteUser}
                                onUpdateField={handleUpdateField}
                                role="admin"
                            />
                        ) : (
                            <Text textAlign="center" fontSize="lg" color="gray.500">
                                No users found
                            </Text>
                        )}
                    </TabPanel>
                    <TabPanel>
                        {usersToDisplay.length > 0 ? (
                            <UserTable
                                users={usersToDisplay}
                                onDeleteUser={handleDeleteUser}
                                onUpdateField={handleUpdateField}
                                role="teacher"
                            />
                        ) : (
                            <Text textAlign="center" fontSize="lg" color="gray.500">
                                No users found
                            </Text>
                        )}
                    </TabPanel>
                    <TabPanel>
                        {usersToDisplay.length > 0 ? (
                            <UserTable
                                users={usersToDisplay}
                                onDeleteUser={handleDeleteUser}
                                onUpdateField={handleUpdateField}
                                role="student"
                            />
                        ) : (
                            <Text textAlign="center" fontSize="lg" color="gray.500">
                                No users found
                            </Text>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
            <Button backgroundColor="rgb(181, 227, 228)" mb={5} border="aqua" onClick={onOpen}>
                Add User
            </Button>

            <AddUserModal isOpen={isOpen} onClose={onClose} onAddUser={handleAddUser} />
        </Box>
    );
};

export default AdminManageUsers;