import {
  Box,
  SimpleGrid,
  Button,
  Text,
  Spinner,
  Input,
  HStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { db } from "../../firebase.js";
import "./AdminGenerateSeatPlan.css";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

const GenerateSeatPlan = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRoomNo, setNewRoomNo] = useState("");
  const [newTotalSeats, setNewTotalSeats] = useState("");
  const [addRoomNo, setAddRoomNo] = useState("");
  const [addTotalSeats, setAddTotalSeats] = useState("");
  const [showAddRoom, setShowAddRoom] = useState(false); // Toggle state for showing the input field

  const handleSeatPlanSummerClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/seat-plan-admin-summer"
      );

      console.log("✅ Full Response:", response.data); // Debug entire response
      setMessage("✅ Summer seat plan successfully generated!");
    } catch (error) {
      console.error(
        "❌ Error in seat plan admin frontend: ",
        error.response?.data?.message || error.message
      );
      setMessage("❌ Failed to generate Summer seat plan. Try again.");
    }
    setLoading(false);
  };

  const handleSeatPlanWinterClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/seat-plan-admin-winter"
      );

      console.log("✅ Full Response:", response.data); // Debug entire response

      setMessage("✅ Winter seat plan successfully generated!");
    } catch (error) {
      console.error(
        "❌ Error in seat plan admin frontend: ",
        error.response?.data?.message || error.message
      );
      setMessage("❌ Failed to generate Summer seat plan. Try again.");
    }
    setLoading(false);
  };
  useEffect(() => {
    if (message.includes("successfully generated")) {
      setTimeout(() => navigate("/admin-home/admin-manage-seat-plan"));
    }
  }, [message, navigate]);

  // Fetch rooms from Firebase
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "seat_plan_rooms"));
        const roomList = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.room_no.localeCompare(b.room_no)); // Sort rooms as string
        setRooms(roomList);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Handle selecting/deselecting a room
  const handleRoomSelect = (room) => {
    if (selectedRoom && selectedRoom.id === room.id) {
      setSelectedRoom(null); // Deselect if clicked again
    } else {
      setSelectedRoom(room);
      setNewRoomNo(room.room_no);
    }
  };

  // Handle deleting a room from Firebase
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      await deleteDoc(doc(db, "seat_plan_rooms", selectedRoom.id));
      setRooms(rooms.filter((room) => room.id !== selectedRoom.id));
      setSelectedRoom(null);
      toast({
        title: "Room deleted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to delete room.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("❌ Error deleting room:", error);
    }
  };

  // Handle updating a room number in Firebase
  const handleEditRoom = async () => {
    if (!selectedRoom || !newRoomNo.trim() || !newTotalSeats.trim()) return;
    try {
      const roomRef = doc(db, "seat_plan_rooms", selectedRoom.id);
      await updateDoc(roomRef, {
        room_no: newRoomNo,
        total_seats: newTotalSeats,
      });
      setRooms(
        rooms.map((room) =>
          room.id === selectedRoom.id
            ? { ...room, room_no: newRoomNo, total_seats: newTotalSeats }
            : room
        )
      );
      setSelectedRoom(null);
      toast({
        title: "Room updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to update room.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle adding a new room
  // const handleAddRoom = async () => {
  //     if (!addRoomNo.trim()) return;
  //     try {
  //         const newRoomRef = doc(collection(db, "seat_plan_rooms"));
  //         await setDoc(newRoomRef, { room_no: addRoomNo });
  //         setRooms([...rooms, { id: newRoomRef.id, room_no: addRoomNo }].sort((a, b) => a.room_no.localeCompare(b.room_no)));
  //         setAddRoomNo("");
  //         toast({ title: "Room added successfully!", status: "success", duration: 3000, isClosable: true });
  //     } catch (error) {
  //         toast({ title: "Failed to add room.", status: "error", duration: 3000, isClosable: true });
  //         console.error("❌ Error adding room:", error);
  //     }
  // };
  const handleAddRoom = async () => {
    if (!addRoomNo.trim() || !addTotalSeats.trim()) return;
    try {
      const newRoomRef = doc(collection(db, "seat_plan_rooms"));
      await setDoc(newRoomRef, {
        room_no: addRoomNo,
        total_seats: addTotalSeats,
      });
      setRooms(
        [
          ...rooms,
          { id: newRoomRef.id, room_no: addRoomNo, total_seats: addTotalSeats },
        ].sort((a, b) => a.room_no.localeCompare(b.room_no))
      );
      setAddRoomNo("");
      setAddTotalSeats("");
      toast({
        title: "Room added successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to add room.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("❌ Error updating room:", error);
    }
  };
  return (
    <div className="container">
      <HStack className="header">
        <h1 className="title">Generate Seat Plan</h1>
        <IconButton
          icon={showAddRoom ? <MinusIcon /> : <AddIcon />}
          colorScheme={showAddRoom ? "red" : "green"}
          onClick={() => setShowAddRoom(!showAddRoom)}
        />
      </HStack>

      {showAddRoom && (
        <HStack className="add-room-container">
          <Input
            type="text"
            value={addRoomNo}
            onChange={(e) => setAddRoomNo(e.target.value)}
            placeholder="Enter room number"
            className="input-field"
          />
          <Input
            type="number"
            value={addTotalSeats}
            onChange={(e) => setAddTotalSeats(e.target.value)}
            placeholder="Total seats"
            className="input-field"
          />
          <Button colorScheme="blue" onClick={handleAddRoom}>
            Add Room
          </Button>
        </HStack>
      )}

      {loading && (
        <div className="loading-overlay">
          <Spinner size="xl" />
          <p>Generating Seat Plan, please wait...</p>
        </div>
      )}

      <HStack justify="space-between" width="100%" className="title-row">
        <h2 className="subtitle">Available Rooms</h2>
        {selectedRoom && (
          <HStack spacing={3} className="room-actions">
            <Input
              type="text"
              value={newRoomNo}
              onChange={(e) => setNewRoomNo(e.target.value)}
              placeholder="Enter new room number"
              className="input-field"
            />
            <Input
              type="number"
              value={newTotalSeats}
              onChange={(e) => setNewTotalSeats(e.target.value)}
              placeholder="Enter total seats"
              className="input-field"
            />
            <Button colorScheme="yellow" onClick={handleEditRoom}>
              Save
            </Button>
            <Button colorScheme="red" onClick={handleDeleteRoom}>
              Remove
            </Button>
            <Button colorScheme="gray" onClick={() => setSelectedRoom(null)}>
              Cancel
            </Button>
          </HStack>
        )}
      </HStack>

      {roomsLoading ? (
        <Spinner size="lg" />
      ) : (
        <SimpleGrid
          columns={{ base: 2, md: 4, lg: 6 }}
          spacing={5}
          className="room-grid"
        >
          {rooms.map((room) => (
            <Box
              key={room.id}
              className={`room-box ${
                selectedRoom?.id === room.id ? "selected" : ""
              }`}
              onClick={() => handleRoomSelect(room)}
            >
              <Text fontSize="lg" fontWeight="bold">
                Room {room.room_no} ({room.total_seats || "N/A"} seats)
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <div className="button-container">
        <Button
          onClick={() => handleSeatPlanSummerClick()}
          colorScheme="blue"
          isLoading={loading}
        >
          Generate Summer Semester
        </Button>
        <Button
          onClick={() => handleSeatPlanWinterClick()}
          colorScheme="green"
          isLoading={loading}
        >
          Generate Winter Semester
        </Button>
      </div>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default GenerateSeatPlan;
