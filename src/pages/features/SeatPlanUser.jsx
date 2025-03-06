import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import {
  Box,
  Heading,
  Grid,
  GridItem,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';

// Department colors (light shades)
const departmentColors = {
  CSE: 'blue.200',
  SWE: 'blue.100',
  EEE: 'yellow.100',
  MPE: 'red.100',
  IPE: 'red.200',
  CEE: 'green.100',
  BTM: 'purple.100',
  TVE: 'pink.400',
};

const collections = [
  'seat_plan_summer_day',
  'seat_plan_summer_morning',
  'seat_plan_winter_day',
  'seat_plan_winter_morning',
];

const AdminManageSeatPlan = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const [selectedCollection, setSelectedCollection] = useState('seat_plan_summer_day');
  const [theUserID, setTheUserID] = useState(null); // Store theUserID in state
  let totalSeats = 60;
  const currentUser = auth.currentUser;

  useEffect(() => {
    const initializeRooms = async () => {
      try {
        const seatPlanRef = collection(db, "seat_plan_rooms");
        const seatPlanSnapshot = await getDocs(seatPlanRef);

        if (seatPlanSnapshot.empty) {
          console.log("No room IDs found in seat_plan_rooms.");
          return;
        }

        const roomIds = seatPlanSnapshot.docs.map((doc) => doc.data().room_no);

        if (roomIds.length === 0) {
          console.log("No valid room numbers found.");
          return;
        }

        console.log("Initializing rooms with IDs:", roomIds);

        for (const roomId of roomIds) {
          const roomRef = doc(db, selectedCollection, roomId.toString());
          await setDoc(roomRef, { dummy2: "dummy2" }, { merge: true });
        }

        // toast({
        //   title: "Rooms initialized",
        //   description: "Dummy fields added to all rooms.",
        //   status: "success",
        //   duration: 3000,
        //   isClosable: true,
        // });
      } catch (error) {
        console.error("Error initializing rooms:", error);
        setError("Failed to initialize rooms");
      }
    };

    initializeRooms();
  }, [toast, selectedCollection, db]);

  useEffect(() => {
    if (!selectedRoom) return;

    const fetchTotalSeats = async (room) => {
      try {
        const seatPlanRef = collection(db, "seat_plan_rooms");
        const seatPlanSnapshot = await getDocs(seatPlanRef);

        if (!seatPlanSnapshot.empty) {
          const matchedRoom = seatPlanSnapshot.docs.find(doc => doc.data().room_no === room);
          if (matchedRoom) {
            const data = matchedRoom.data();
            totalSeats = data.total_seats;
            console.log(totalSeats);
          } else {
            console.log("No matching room found.");
          }
        } else {
          console.log("No rooms found in seat_plan_rooms collection.");
        }
      } catch (error) {
        console.error("Error fetching total seats:", error);
      }
    };
    fetchTotalSeats(selectedRoom);
  }, [selectedRoom]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, selectedCollection);
        const snapshot = await getDocs(roomsRef);

        if (snapshot.empty) {
          setError("No rooms found.");
          return;
        }

        const roomList = snapshot.docs
          .map((doc) => doc.id)
          .sort((a, b) => (parseInt(a) > parseInt(b) ? 1 : -1));

        setRooms(roomList);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setError("Failed to load rooms.");
      }
    };
    fetchRooms();
  }, [selectedCollection]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!currentUser?.email) return;

      const userDocRef = doc(db, "users", currentUser.email);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setSelectedRoom(userDocSnap.data().room);
        setTheUserID(userDocSnap.data().id); // Set theUserID in state
        console.log(theUserID);
      } else {
        console.log("No such document!");
      }
    };

    fetchRoom();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedRoom) return;

    setLoading(true);
    const seatsRef = collection(db, `${selectedCollection}/${selectedRoom}/seats`);

    const unsubscribe = onSnapshot(seatsRef, (snapshot) => {
      const seatsData = snapshot.docs.map(doc => ({
        seatNumber: parseInt(doc.id, 10),
        ...doc.data()
      }));

      const allSeats = Array.from({ length: totalSeats }, (_, i) => ({
        seatNumber: i + 1,
        id: null,
        dept: null
      }));

      seatsData.forEach(seat => {
        allSeats[seat.seatNumber - 1] = seat;
      });

      setSeats(allSeats);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching seats:', error);
      setError('Failed to load seats');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedRoom, selectedCollection, totalSeats]);

  const sortedSeats = [...seats].sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));
  const seatPairs = [];
  for (let i = 0; i < sortedSeats.length; i += 2) {
    seatPairs.push(sortedSeats.slice(i, i + 2));
  }

  const seatColumns = [];
  for (let i = 0; i < seatPairs.length; i += 10) {
    seatColumns.push(seatPairs.slice(i, i + 10));
  }

  return (
    <Box p={6}>
      {/* Display the user's room number */}
      {selectedRoom && (
        <Heading as="h2" size="lg" mb={6}>
          Room: {selectedRoom}
        </Heading>
      )}

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading && (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" />
        </Box>
      )}

      {/* Seat Plan */}
      {selectedRoom && !loading && (
        <Box>
          <Grid templateColumns={`repeat(${seatColumns.length}, 1fr)`} gap={12}>
            {seatColumns.map((column, columnIndex) => (
              <Grid key={columnIndex} templateRows="repeat(10, 1fr)" gap={1}>
                {column.map((pair, pairIndex) => (
                  <GridItem
                    key={pairIndex}
                    display="flex"
                    gap={2}
                  >
                    {pair.map((seat) => (
                      <Box
                        key={seat.seatNumber}
                        flex={1}
                        p={4}
                        borderWidth="4px"
                        borderRadius="md"
                        bg={seat.id ? departmentColors[seat.dept] || 'gray.100' : 'gray.50'}
                        _hover={{ bg: seat.id ? `${departmentColors[seat.dept].replace('.100', '.200')}` : 'gray.100' }}
                        textAlign="center"
                        borderColor={seat.id === theUserID ? 'blue.500' : 'transparent'} // Highlight the seat with theUserID
                      >
                        <Text fontSize="xs" color="gray.500">
                          Seat {seat.seatNumber}
                        </Text>
                        {seat.id ? (
                          <>
                            <Text fontSize="sm" fontWeight="medium">
                              {seat.id}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {seat.dept}
                            </Text>
                          </>
                        ) : (
                          <Text fontSize="xs" color="gray.400">
                            Vacant
                          </Text>
                        )}
                      </Box>
                    ))}
                  </GridItem>
                ))}
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AdminManageSeatPlan;