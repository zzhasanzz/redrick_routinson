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
    VStack,
    useToast,
    Switch,
} from "@chakra-ui/react";

const UserEditModal = ({ isOpen, onClose, user, onUpdateField }) => {
    const [formData, setFormData] = useState({
        department: user.department || "",
        semester: user.semester || "",
        section: user.section || "",
        room: user.room || "",
        isPresident: user.isPresident || false,
    });
    const toast = useToast();

    // Department options
    const departments = ["CSE", "EEE", "SWE", "IPE", "MPE", "CEE", "BTM", "TVE"];

    // Semester options (1-8)
    const semesters = Array.from({ length: 8 }, (_, i) => (i + 1).toString());

    // Section options (1-3)
    const sections = ["A", "B", "C"]

    const handleSave = () => {
        if (!formData.department || (user.role !== "student" && !formData.room)) {
            toast({
                title: "Missing fields",
                description: "Please fill out all required fields.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        // Update fields in Firestore
        Object.entries(formData).forEach(([field, value]) => {
            if (value !== null && value !== undefined) {
                onUpdateField(user.email, field, value);
            }
        });

        // toast({
        //     title: "User updated successfully",
        //     status: "success",
        //     duration: 3000,
        //     isClosable: true,
        // });

        onClose(); // Close the modal
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit User: {user.id}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        {/* Department Dropdown (for all roles) */}
                        <FormControl isRequired>
                            <FormLabel>Department</FormLabel>
                            <Select
                                placeholder="Select Department"
                                value={formData.department}
                                onChange={(e) =>
                                    setFormData({ ...formData, department: e.target.value })
                                }
                            >
                                {departments.map((department) => (
                                    <option key={department} value={department}>
                                        {department}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Semester and Section (for students only) */}
                        {user.role === "student" && (
                            <>
                                <FormControl>
                                    <FormLabel>Semester</FormLabel>
                                    <Select
                                        placeholder="Select Semester"
                                        value={formData.semester}
                                        onChange={(e) =>
                                            setFormData({ ...formData, semester: e.target.value })
                                        }
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
                                        value={formData.section}
                                        onChange={(e) =>
                                            setFormData({ ...formData, section: e.target.value })
                                        }
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

                        {/* Room Input (for teachers and admins only) */}
                        {user.role !== "student" && (
                            <FormControl isRequired>
                                <FormLabel>Room</FormLabel>
                                <Input
                                    value={formData.room}
                                    onChange={(e) =>
                                        setFormData({ ...formData, room: e.target.value })
                                    }
                                />
                            </FormControl>
                        )}

                        {/* Is President Switch (for students only) */}
                        {user.role === "student" && (
                            <FormControl display="flex" alignItems="center">
                                <FormLabel mb="0">Is President</FormLabel>
                                <Switch
                                    isChecked={formData.isPresident}
                                    onChange={(e) =>
                                        setFormData({ ...formData, isPresident: e.target.checked })
                                    }
                                />
                            </FormControl>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default UserEditModal;