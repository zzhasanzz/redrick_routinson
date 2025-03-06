import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import "./AdminManageRooms.scss";

const AdminManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomNumber, setNewRoomNumber] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const roomsCollection = collection(db, "rooms");
      const roomsSnapshot = await getDocs(roomsCollection);
      const roomsList = roomsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsList);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const addRoom = async (e) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    try {
      await setDoc(doc(db, "rooms", newRoomNumber), {
        roomNumber: newRoomNumber,
        createdAt: new Date().toISOString(),
      });
      setNewRoomNumber("");
      fetchRooms();
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await deleteDoc(doc(db, "rooms", roomId));
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  return (
    <div className="admin-manage-rooms">
      <h1>Manage Rooms</h1>

      <form onSubmit={addRoom} className="add-room-form">
        <input
          type="text"
          value={newRoomNumber}
          onChange={(e) => setNewRoomNumber(e.target.value)}
          placeholder="Enter room number"
        />
        <button type="submit">Add Room</button>
      </form>

      <div className="rooms-container">
        {rooms.map((room) => (
          <div key={room.id} className="room-item">
            <span>Room {room.id}</span>
            <button onClick={() => deleteRoom(room.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminManageRooms;
