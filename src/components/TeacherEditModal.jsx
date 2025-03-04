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
            onUpdateField(user.id, field, value);
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
                        <FormControl isRequired>
                            <FormLabel>Department</FormLabel>
                            <Input
                                value={formData.dept}
                                onChange={(e) =>
                                    setFormData({ ...formData, dept: e.target.value })
                                }
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Research Domain</FormLabel>
                            <Input
                                value={formData.research}
                                onChange={(e) =>
                                    setFormData({ ...formData, research: e.target.value })
                                }
                            />
                        </FormControl>
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