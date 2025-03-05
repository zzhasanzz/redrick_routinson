import React, { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Switch,
    VStack,
    useToast,
} from "@chakra-ui/react";

const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [name, setName] = useState("");
    const [dept, setDept] = useState("");
    const [research, setResearch] = useState("");
    const [semester, setSemester] = useState("");
    const [section, setSection] = useState("");
    const [room, setRoom] = useState("");
    const [isPresident, setIsPresident] = useState(false);
    const toast = useToast();

    const handleSubmit = () => {
        if (!email || !password || !role || !dept) {
            toast({
                title: "Missing fields",
                description: "Please fill out all required fields.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
    
        const userData = {
            email,
            password,
            role,
            name: role === "teacher" ? name : null, // Include name for teachers
            dept,
            research: role === "teacher" ? research : null, // Include research for teachers
            semester: role === "student" ? semester : null,
            section: role === "student" ? section : null,
            room,
            isPresident,
        };
    
        onAddUser(userData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add New User</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Role</FormLabel>
                            <Select value={role} onChange={(e) => setRole(e.target.value)}>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </Select>
                        </FormControl>
                        {role === "teacher" && (
                            <>
                                <FormControl isRequired>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Research</FormLabel>
                                    <Input
                                        value={research}
                                        onChange={(e) => setResearch(e.target.value)}
                                    />
                                </FormControl>
                            </>
                        )}
                        <FormControl isRequired>
                            <FormLabel>Department</FormLabel>
                            <Input
                                value={dept}
                                onChange={(e) => setDept(e.target.value)}
                            />
                        </FormControl>
                        {role === "student" && (
                            <>
                                <FormControl>
                                    <FormLabel>Semester</FormLabel>
                                    <Input
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Section</FormLabel>
                                    <Input
                                        value={section}
                                        onChange={(e) => setSection(e.target.value)}
                                    />
                                </FormControl>
                            </>
                        )}
                        <FormControl>
                            <FormLabel>Room</FormLabel>
                            <Input
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                            />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">Is President</FormLabel>
                            <Switch
                                isChecked={isPresident}
                                onChange={(e) => setIsPresident(e.target.checked)}
                            />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button backgroundColor="rgb(181, 227, 228)" mr={3} onClick={handleSubmit}>
                        Add User
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddUserModal;