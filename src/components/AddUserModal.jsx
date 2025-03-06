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
    const [id, setID] = useState("");
    const toast = useToast();

    // Department options
    const departments = ["CSE", "EEE", "SWE", "IPE", "MPE", "CEE", "BTM", "TVE"];

    // Semester options (1-8)
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    // Section options (1-3)
    const sections = ["A", "B", "C"]

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
            id,
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
                            <Select
                                placeholder="Select Department"
                                value={dept}
                                onChange={(e) => setDept(e.target.value)}
                            >
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                        {role === "student" && (
                            <>
                                <FormControl>
                                    <FormLabel>Semester</FormLabel>
                                    <Select
                                        placeholder="Select Semester"
                                        value={semester}
                                        onChange={(e) => setSemester(e.target.value)}
                                    >
                                        {semesters.map((sem) => (
                                            <option key={sem} value={sem}>
                                                {sem}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Section</FormLabel>
                                    <Select
                                        placeholder="Select Section"
                                        value={section}
                                        onChange={(e) => setSection(e.target.value)}
                                    >
                                        {sections.map((sec) => (
                                            <option key={sec} value={sec}>
                                                {sec}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}
                        {!(role === "student") && (
                            <FormControl>
                                <FormLabel>Room</FormLabel>
                                <Input
                                    value={room}
                                    onChange={(e) => setRoom(e.target.value)}
                                />
                            </FormControl>
                        )}
                        {role === "student" && (
                            <FormControl>
                                <FormLabel>ID</FormLabel>
                                <Input
                                    value={id}
                                    onChange={(e) => setID(e.target.value)}
                                />
                            </FormControl>
                        )}
                        {role === "student" && (
                            <FormControl display="flex" alignItems="center">
                                <FormLabel mb="0">Is President</FormLabel>
                                <Switch
                                    isChecked={isPresident}
                                    onChange={(e) => setIsPresident(e.target.checked)}
                                />
                            </FormControl>
                        )}
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