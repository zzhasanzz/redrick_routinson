import React, { useState } from "react";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Button,
    IconButton,
    Badge,
    useDisclosure,
    Switch,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import UserEditModal from "./UserEditModal"; // For admins and students
import TeacherEditModal from "./TeacherEditModal"; // For teachers

const UserTable = ({ users, onDeleteUser, onUpdateField, role }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedUser, setSelectedUser] = useState(null);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        onOpen();
    };

    const handleTogglePresident = async (userId, isPresident) => {
        await onUpdateField(userId, "isPresident", isPresident);
    };

    return (
        <>
            <Table variant="striped" bgColor="rgb(181, 227, 228)">
                <Thead backgroundColor = "rgb(181, 227, 228)" height="60px">
                    <Tr>
                        <Th>User ID/Email</Th>
                        <Th>Role</Th>
                        {role === "teacher" && (
                            <>
                                <Th>Name</Th>
                                <Th>Department</Th>
                                <Th>Research</Th>
                            </>
                        )}
                        {role === "student" && (
                            <>
                                <Th>Department</Th>
                                <Th>Semester</Th>
                                <Th>Section</Th>
                            </>
                        )}
                        <Th>Room</Th>
                        {role === "student" && <Th>Is President</Th>}
                        <Th>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {users.map((user) => (
                        <Tr key={user.id}>
                            {role=="student" && <Td>{user.id}</Td>}
                            {role=="teacher" && <Td>{user.email}</Td>}
                            {role=="admin" && <Td>{user.email}</Td>}
                            <Td>
                                <Badge
                                    colorScheme={
                                        user.role === "teacher"
                                            ? "purple"
                                            : user.role === "student"
                                            ? "green"
                                            : "blue"
                                    }
                                >
                                    {user.role}
                                </Badge>
                            </Td>
                            {role === "teacher" && (
                                <>
                                    <Td>{user.name || "N/A"}</Td>
                                    <Td>{user.dept || "N/A"}</Td>
                                    <Td>{user.research || "N/A"}</Td>
                                </>
                            )}
                            {role === "student" && (
                                <>
                                    <Td>{user.dept || "N/A"}</Td>
                                    <Td>{user.semester || "N/A"}</Td>
                                    <Td>{user.section || "N/A"}</Td>
                                </>
                            )}
                            <Td>{user.room || "N/A"}</Td>
                            {role === "student" && (
                                <Td>
                                    <Switch
                                        isChecked={user.isPresident || false}
                                        onChange={(e) =>
                                            handleTogglePresident(user.id, e.target.checked)
                                        }
                                        colorScheme="teal"
                                    />
                                </Td>
                            )}
                            <Td>
                                <IconButton
                                    aria-label="Edit User"
                                    icon={<EditIcon />}
                                    size="sm"
                                    colorScheme="blue"
                                    mr={2}
                                    onClick={() => handleEditClick(user)}
                                />
                                <IconButton
                                    aria-label="Delete User"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => onDeleteUser(user.email)}
                                />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {selectedUser && (
                <>
                    {role === "teacher" ? (
                        <TeacherEditModal
                            isOpen={isOpen}
                            onClose={onClose}
                            user={selectedUser}
                            onUpdateField={onUpdateField}
                        />
                    ) : (
                        <UserEditModal
                            isOpen={isOpen}
                            onClose={onClose}
                            user={selectedUser}
                            onUpdateField={onUpdateField}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default UserTable;