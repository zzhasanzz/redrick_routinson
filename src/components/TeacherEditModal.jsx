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
} from "@chakra-ui/react";

const TeacherEditModal = ({ isOpen, onClose, user, onUpdateField }) => {
    const [formData, setFormData] = useState({
        name: user.name || "",
        dept: user.dept || "",
        research: user.research || "",
        room: user.room || "",
    });
    const toast = useToast();

    // Department options
    const departments = ["CSE", "EEE", "SWE", "IPE", "MPE", "CEE", "BTM", "TVE"];

    const handleSave = () => {
        if (!formData.dept || !formData.research || !formData.room) {
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
            onUpdateField(user.email, field, value);
        });

        toast({
            title: "Teacher updated successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
        });

        onClose(); // Close the modal
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Teacher: {user.id}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        {/* Department Dropdown */}
                        <FormControl isRequired>
                            <FormLabel>Department</FormLabel>
                            <Select
                                placeholder="Select Department"
                                value={formData.dept}
                                onChange={(e) =>
                                    setFormData({ ...formData, dept: e.target.value })
                                }
                            >
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Research Domain Input */}
                        <FormControl isRequired>
                            <FormLabel>Research Domain</FormLabel>
                            <Input
                                value={formData.research}
                                onChange={(e) =>
                                    setFormData({ ...formData, research: e.target.value })
                                }
                            />
                        </FormControl>

                        {/* Room Input */}
                        <FormControl isRequired>
                            <FormLabel>Room</FormLabel>
                            <Input
                                value={formData.room}
                                onChange={(e) =>
                                    setFormData({ ...formData, room: e.target.value })
                                }
                            />
                        </FormControl>
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

export default TeacherEditModal;