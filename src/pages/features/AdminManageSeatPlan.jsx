import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import {
  Box,
  Heading,
  Select,
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

const AdminManageSeatPlan = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  // Initialize rooms with dummy fields (runs once on mount)
  useEffect(() => {
    const initializeRooms = async () => {
      try {
        const roomsRef = collection(db, 'seat_plan_summer_day');
        const snapshot = await getDocs(roomsRef);

        if (!snapshot.empty) {
          console.log('No rooms found. Creating initial rooms...');
          for (let roomId = 1; roomId <= 28; roomId++) {
            const roomRef = doc(db, 'seat_plan_summer_day', roomId.toString());
            await setDoc(roomRef, { dummy2: 'dummy2' }, { merge: true });
          }
          toast({
            title: 'Rooms initialized',
            description: 'Dummy fields added to all rooms.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error initializing rooms:', error);
        setError('Failed to initialize rooms');
      }
    };

    initializeRooms();
  }, [toast]);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, 'seat_plan_summer_day');
        const snapshot = await getDocs(roomsRef);
        
        if (snapshot.empty) {
          setError('No rooms found');
          return;
        }

        const roomIds = snapshot.docs.map(doc => doc.id);
        setRooms(roomIds);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms');
      }
    };

    fetchRooms();
  }, []);

  // Fetch seats for selected room
  useEffect(() => {
    if (!selectedRoom) return;

    setLoading(true);
    const seatsRef = collection(db, `seat_plan_summer_day/${selectedRoom}/seats`);
    
    const unsubscribe = onSnapshot(seatsRef, (snapshot) => {
      const seatsData = snapshot.docs.map(doc => ({
        seatNumber: doc.id,
        ...doc.data()
      }));
      setSeats(seatsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching seats:', error);
      setError('Failed to load seats');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedRoom]);

  // Sort seats numerically
  const sortedSeats = [...seats].sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber));

  // Group seats into pairs (e.g., [1, 2], [3, 4], etc.)
  const seatPairs = [];
  for (let i = 0; i < sortedSeats.length; i += 2) {
    seatPairs.push(sortedSeats.slice(i, i + 2));
  }

  // Group pairs into columns (10 pairs per column)
  const seatColumns = [];
  for (let i = 0; i < seatPairs.length; i += 10) {
    seatColumns.push(seatPairs.slice(i, i + 10));
  }

  return (
    <Box p={6}>
      <Heading as="h1" size="xl" mb={6}>
        Manage Seat Plan
      </Heading>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Room Selection Dropdown */}
      <Box mb={8}>
        <Select
          placeholder="Select a Room"
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          bg="white"
          maxW="300px"
        >
          {rooms.map(room => (
            <option key={room} value={room}>
              Room {room}
            </option>
          ))}
        </Select>
      </Box>

      {/* Loading Spinner */}
      {loading && (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" />
        </Box>
      )}

      {/* Seat Plan */}
      {selectedRoom && !loading && (
        <Box>
          {/* Invigilator Table */}
          <Box
            bg="gray.100"
            p={4}
            mb={6}
            borderRadius="md"
            textAlign="center"
          >
            <Text fontSize="lg" fontWeight="bold">
              Invigilator Table
            </Text>
            <Text fontSize="sm" color="gray.600">
              (Invigilator names will appear here)
            </Text>
          </Box>

          {/* Seat Grid */}
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
                        borderWidth="1px"
                        borderRadius="md"
                        bg={seat.id ? departmentColors[seat.dept] || 'gray.100' : 'gray.50'}
                        _hover={{ bg: seat.id ? `${departmentColors[seat.dept].replace('.100', '.200')}` : 'gray.100' }}
                        textAlign="center"
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