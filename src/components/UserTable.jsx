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

  // Filter users based on the selected role
  const filteredUsers = users.filter((user) => user.role === role);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleTogglePresident = async (userId, isPresident) => {
    await onUpdateField(userId, "isPresident", isPresident);
  };

  return (
    <>
      <Table variant="striped" bgColor="#dfeded">
        <Thead backgroundColor="#dfeded" height="60px">
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
          {filteredUsers.map((user) => (
            <Tr key={user.id}>
              {role == "student" && <Td>{user.id || user.email}</Td>}
              {role == "teacher" && <Td>{user.email}</Td>}
              {role == "admin" && <Td>{user.email}</Td>}
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
                  <Td>{user.department || "N/A"}</Td>
                  <Td>{user.research || "N/A"}</Td>
                </>
              )}
              {role === "student" && (
                <>
                  <Td>{user.department || "N/A"}</Td>
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
                  backgroundColor="#8bbfbd"
                  mr={2}
                  onClick={() => handleEditClick(user)}
                />
                <IconButton
                  aria-label="Delete User"
                  icon={<DeleteIcon />}
                  size="sm"
                  backgroundColor="#d98584"
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
