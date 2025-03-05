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
    Switch
} from "@chakra-ui/react";

const UserEditModal = ({ isOpen, onClose, user, onUpdateField }) => {
    const [formData, setFormData] = useState({
        dept: user.dept || "",
        semester: user.semester || "",
        section: user.section || "",
        room: user.room || "",
        isPresident: user.isPresident || false,
    });
    const toast = useToast();

    const handleSave = () => {
        if (!formData.dept || !formData.room) {
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
            title: "User updated successfully",
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
                <ModalHeader>Edit User: {user.id}</ModalHeader>
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
                        {user.role === "student" && (
                            <>
                                <FormControl>
                                    <FormLabel>Semester</FormLabel>
                                    <Input
                                        value={formData.semester}
                                        onChange={(e) =>
                                            setFormData({ ...formData, semester: e.target.value })
                                        }
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Section</FormLabel>
                                    <Input
                                        value={formData.section}
                                        onChange={(e) =>
                                            setFormData({ ...formData, section: e.target.value })
                                        }
                                    />
                                </FormControl>
                            </>
                        )}
                        <FormControl isRequired>
                            <FormLabel>Room</FormLabel>
                            <Input
                                value={formData.room}
                                onChange={(e) =>
                                    setFormData({ ...formData, room: e.target.value })
                                }
                            />
                        </FormControl>
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