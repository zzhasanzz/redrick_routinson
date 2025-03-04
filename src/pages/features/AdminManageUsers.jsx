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
} from "@chakra-ui/react";
import { db, auth } from "../../firebase"; // Ensure Firebase is initialized
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import UserTable from "../../components/UserTable";
import AddUserModal from "../../components/AddUserModal";

const AdminManageUsers = () => {
    const [users, setUsers] = useState([]);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Fetch users from Firestore
    useEffect(() => {
        fetchUsers();
    }, []);

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

    // Handle adding a new user
    const handleAddUser = async (userData) => {
        const { email, password, role, name, dept, research, semester, section, room, isPresident } = userData;
    
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
            });
    
            // Update local state
            setUsers((prevUsers) => [
                ...prevUsers,
                {
                    id: email,
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
            await deleteDoc(doc(db, "users", userId));

            // Remove user from local state
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

            toast({
                title: "User deleted successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
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

            toast({
                title: "Field updated successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
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

    return (
        <Box p={5}>
            <Heading as="h1" size="xl" mb={5}>
                Manage Users
            </Heading>
            <Tabs variant="enclosed">
                <TabList>
                    <Tab>Admins</Tab>
                    <Tab>Teachers</Tab>
                    <Tab>Students</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <UserTable
                            users={admins}
                            onDeleteUser={handleDeleteUser}
                            onUpdateField={handleUpdateField}
                            role="admin"
                        />
                    </TabPanel>
                    <TabPanel>
                        <UserTable
                            users={teachers}
                            onDeleteUser={handleDeleteUser}
                            onUpdateField={handleUpdateField}
                            role="teacher"
                        />
                    </TabPanel>
                    <TabPanel>
                        <UserTable
                            users={students}
                            onDeleteUser={handleDeleteUser}
                            onUpdateField={handleUpdateField}
                            role="student"
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
            <Button backgroundColor="rgb(181, 227, 228)" mb={5} border = "aqua" onClick={onOpen}>
                Add User
            </Button>

            <AddUserModal isOpen={isOpen} onClose={onClose} onAddUser={handleAddUser} />
        </Box>
    );
};

export default AdminManageUsers;