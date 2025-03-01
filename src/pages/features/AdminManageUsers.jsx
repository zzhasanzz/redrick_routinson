import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  Button,
  useToast,
  Flex,
  Text,
  Select,
  Switch,
} from "@chakra-ui/react";
import { db } from "../../firebase"; // Ensure Firebase is initialized
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingState, setEditingState] = useState({}); // Track which user and field are being edited
  const toast = useToast();

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

  // Handle editing a field
  const handleEditField = (userId, field, value) => {
    setEditingState((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  // Handle updating a field in Firestore
  const handleUpdateField = async (userId, field) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { [field]: editingState[userId][field] });

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, [field]: editingState[userId][field] } : user
        )
      );

      // Clear editing state for this field
      setEditingState((prev) => ({ ...prev, [userId]: { ...prev[userId], [field]: undefined } }));

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

  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={5}>
        Manage Users
      </Heading>
      <Accordion allowMultiple>
        {users.map((user) => (
          <AccordionItem key={user.id}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Text fontWeight="bold">User ID: {user.id}</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {/* Department */}
              <Flex align="center" mb={2}>
                <Text fontWeight="bold" mr={2} minWidth="100px">
                  Department:
                </Text>
                {editingState[user.id]?.dept !== undefined ? (
                  <>
                    <Input
                      value={editingState[user.id].dept || user.dept || ""}
                      onChange={(e) => handleEditField(user.id, "dept", e.target.value)}
                      size="sm"
                      mr={2}
                    />
                    <Button
                      colorScheme="teal"
                      onClick={() => handleUpdateField(user.id, "dept")}
                      mr={2}
                    >
                      Save
                    </Button>
                    <Button
                      colorScheme="gray"
                      size="sm"
                      onClick={() =>
                        setEditingState((prev) => ({ ...prev, [user.id]: { ...prev[user.id], dept: undefined } }))
                      }
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Text flex="1">{user.dept || "N/A"}</Text>
                    <Button
                      colorScheme="blue"
                      width="100px"
                      height="40px"
                      onClick={() => handleEditField(user.id, "dept", user.dept || "")}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </Flex>

              {/* Semester */}
              <Flex align="center" mb={2}>
                <Text fontWeight="bold" mr={2} minWidth="100px">
                  Semester:
                </Text>
                {editingState[user.id]?.semester !== undefined ? (
                  <>
                    <Input
                      value={editingState[user.id].semester || user.semester || ""}
                      onChange={(e) => handleEditField(user.id, "semester", e.target.value)}
                      size="sm"
                      mr={2}
                    />
                    <Button
                      colorScheme="teal"
                      size="sm"
                      onClick={() => handleUpdateField(user.id, "semester")}
                      mr={2}
                    >
                      Save
                    </Button>
                    <Button
                      colorScheme="gray"
                      size="sm"
                      onClick={() =>
                        setEditingState((prev) => ({ ...prev, [user.id]: { ...prev[user.id], semester: undefined } }))
                      }
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Text flex="1">{user.semester || "N/A"}</Text>
                    <Button
                      colorScheme="blue"
                      width="100px"
                      height="40px"
                      onClick={() => handleEditField(user.id, "semester", user.semester || "")}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </Flex>

              {/* Section */}
              <Flex align="center" mb={2}>
                <Text fontWeight="bold" mr={2} minWidth="100px">
                  Section:
                </Text>
                {editingState[user.id]?.section !== undefined ? (
                  <>
                    <Input
                      value={editingState[user.id].section || user.section || ""}
                      onChange={(e) => handleEditField(user.id, "section", e.target.value)}
                      size="sm"
                      mr={2}
                    />
                    <Button
                      colorScheme="teal"
                      size="sm"
                      onClick={() => handleUpdateField(user.id, "section")}
                      mr={2}
                    >
                      Save
                    </Button>
                    <Button
                      colorScheme="gray"
                      size="sm"
                      onClick={() =>
                        setEditingState((prev) => ({ ...prev, [user.id]: { ...prev[user.id], section: undefined } }))
                      }
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Text flex="1">{user.section || "N/A"}</Text>
                    <Button
                      colorScheme="blue"
                      width="100px"
                      height="40px"
                      onClick={() => handleEditField(user.id, "section", user.section || "")}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </Flex>

              {/* Room */}
              <Flex align="center" mb={2}>
                <Text fontWeight="bold" mr={2} minWidth="100px">
                  Room:
                </Text>
                {editingState[user.id]?.room !== undefined ? (
                  <>
                    <Input
                      value={editingState[user.id].room || user.room || ""}
                      onChange={(e) => handleEditField(user.id, "room", e.target.value)}
                      size="sm"
                      mr={2}
                    />
                    <Button
                      colorScheme="teal"
                      size="sm"
                      onClick={() => handleUpdateField(user.id, "room")}
                      mr={2}
                    >
                      Save
                    </Button>
                    <Button
                      colorScheme="gray"
                      size="sm"
                      onClick={() =>
                        setEditingState((prev) => ({ ...prev, [user.id]: { ...prev[user.id], room: undefined } }))
                      }
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Text flex="1">{user.room || "N/A"}</Text>
                    <Button
                      colorScheme="blue"
                      width="100px"
                      height="40px"
                      onClick={() => handleEditField(user.id, "room", user.room || "")}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </Flex>

              {/* Is President */}
              <Flex align="center" mb={2}>
                <Text fontWeight="bold" mr={2} minWidth="100px">
                  Is President:
                </Text>
                {editingState[user.id]?.isPresident !== undefined ? (
                  <>
                    <Switch
                      isChecked={editingState[user.id].isPresident}
                      onChange={(e) => handleEditField(user.id, "isPresident", e.target.checked)}
                      size="sm"
                      mr={2}
                    />
                    <Button
                      colorScheme="teal"
                      size="sm"
                      onClick={() => handleUpdateField(user.id, "isPresident")}
                      mr={2}
                    >
                      Save
                    </Button>
                    <Button
                      colorScheme="gray"
                      size="sm"
                      onClick={() =>
                        setEditingState((prev) => ({ ...prev, [user.id]: { ...prev[user.id], isPresident: undefined } }))
                      }
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Text flex="1">{user.isPresident ? "Yes" : "No"}</Text>
                    <Button
                      colorScheme="blue"
                      width="100px"
                      height="40px"
                      onClick={() => handleEditField(user.id, "isPresident", user.isPresident || false)}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </Flex>

              {/* Delete User Button */}
              <Button
                colorScheme="red"
                size="sm"
                mt={3}
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete User
              </Button>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default AdminManageUsers;