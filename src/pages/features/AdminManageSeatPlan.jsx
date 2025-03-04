import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, onSnapshot, writeBatch,getDoc } from 'firebase/firestore';
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
  // const [totalSeats, setTotalSeats] = useState(); // State to store total seats
  let totalSeats = 60;

// export const generateSeatPlanInFirebase = async () => {
//     try {
//         console.log("Generating seat plan data in Firebase...")
//         const departmentsWith60Students = ["IPE", "SWE", "TVE", "BTM"];
//         const departments = ["CSE", "EEE", "CEE", "MPE","IPE", "SWE", "TVE", "BTM"];
//         const semesters = [1, 3, 5, 7]
//         for(const department of departments)
//         {
//             console.log(department);

//             for(const semester of semesters)
//             {
//                 let studentCount = departmentsWith60Students.includes(department) ? 60:120;
//                 if(department == "EEE")
//                 {
//                     studentCount = 180;
//                 }

//                 let studentID = "";
//                 if(semester == 1)
//                 {
//                     studentID = studentID + "2300";
//                 }
//                 else if(semester == 3)
//                 {
//                     studentID = studentID + "2200";
//                 }
//                 else if(semester == 5)
//                 {
//                     studentID = studentID + "2100";
//                 }
//                 else
//                 {
//                     studentID = studentID + "2000";
//                 }

//                 if(department == "MPE")
//                 {
//                     studentID = studentID + "11";
//                 }
//                 else if(department == "IPE")
//                 {
//                     studentID = studentID + "12";
//                 }
//                 else if(department == "EEE")
//                 {
//                     studentID = studentID + "21";
//                 }
//                 else if(department == "CEE")
//                 {
//                     studentID = studentID + "51";
//                 }
//                 else if(department == "CSE")
//                 {
//                     studentID = studentID + "41";
//                 }
//                 else if(department == "SWE")
//                 {
//                     studentID = studentID + "42";
//                 }
//                 else if(department == "TVE")
//                 {
//                     studentID = studentID + "32";
//                 }
//                 else if(department == "BTM")
//                 {
//                     studentID = studentID + "61";
//                 }

//                 for(let i=1; i<=studentCount; i++)
//                 {
//                     let fullSID = "";
//                     let first9Digits = "";
//                     if(i<10)
//                     {
//                         first9Digits = first9Digits + "0";
//                     }
//                     if(i>60 && i<70)
//                     {
//                         first9Digits = first9Digits + "0";
//                     }
//                     if(i>120 && i<130)
//                     {
//                         first9Digits = first9Digits + "0";
//                     }

//                     if(studentCount <61)
//                     {
//                         fullSID = studentID + "0" +first9Digits+ i.toString();
//                     }
//                     else if(i<61)
//                     {
//                         fullSID = studentID + "1" +first9Digits+ i.toString();
//                     }
//                     else if(i<121)
//                     {
//                         fullSID = studentID + "2" +first9Digits+ (i-60).toString();
//                     }
//                     else
//                     {
//                         fullSID = studentID + "3" +first9Digits+ (i-120).toString();
//                     }

//                     const usersRef = doc(db, `seat_plan_USERS`, `${department.toLowerCase()}_sem${semester}_id${fullSID}_@gmail.com`)
//                     await setDoc(usersRef, {id : fullSID, dept: department, semester: semester, role: "student", isPresident: false, displayName:`Tanjil${fullSID}`});
//                 }
//             }
//         }

//         console.log("✅ Seat plan data successfully added to Firebase!");
//     } catch (error) {
//         console.error("❌ Error generating seat plan in Firebase:", error);
//         throw error;
//     }
// };

  // Initialize rooms with dummy fields (runs once on mount)
  // useEffect(() => {
  //   const initializeRooms = async () => {
  //     try {
  //       const roomsRef = collection(db, selectedCollection);
  //       const snapshot = await getDocs(roomsRef);

  //       if (!snapshot.empty) {
  //         console.log('No rooms found. Creating initial rooms...');
  //         for (let roomId = 1; roomId <= 28; roomId++) {
  //           const roomRef = doc(db, selectedCollection, roomId.toString());
  //           await setDoc(roomRef, { dummy2: 'dummy2' }, { merge: true });
  //         }
  //         toast({
  //           title: 'Rooms initialized',
  //           description: 'Dummy fields added to all rooms.',
  //           status: 'success',
  //           duration: 3000,
  //           isClosable: true,
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error initializing rooms:', error);
  //       setError('Failed to initialize rooms');
  //     }
  //   };

  //   initializeRooms();
  // }, [toast, selectedCollection]);
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

        toast({
          title: "Rooms initialized",
          description: "Dummy fields added to all rooms.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
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
                    // setTotalSeats(data.total_seats || 0); // Store total_seats or default to 0
                    totalSeats = data.total_seats;
                    console.log(totalSeats);
                } else {
                    console.log("No matching room found.");
                    // setTotalSeats(0);
                }
            } else {
                console.log("No rooms found in seat_plan_rooms collection.");
                // setTotalSeats(0);
            }
        } catch (error) {
            console.error("Error fetching total seats:", error);
            // setTotalSeats(0);
        }
    };
    fetchTotalSeats(selectedRoom);
}, [selectedRoom]);






  
  // Fetch rooms
  // useEffect(() => {
  //   const fetchRooms = async () => {
  //     try {
  //       const roomsRef = collection(db, selectedCollection);
  //       const snapshot = await getDocs(roomsRef);
        
  //       if (snapshot.empty) {
  //         setError('No rooms found');
  //         return;
  //       }

  //       const roomIds = snapshot.docs.map(doc => doc.id);
  //       setRooms(roomIds);
  //     } catch (error) {
  //       console.error('Error fetching rooms:', error);
  //       setError('Failed to load rooms');
  //     }
  //   };

  //   fetchRooms();
  // }, [selectedCollection]);
  

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, selectedCollection);
        const snapshot = await getDocs(roomsRef);
  
        if (snapshot.empty) {
          setError("No rooms found.");
          return;
        }
  
        // Fetch and sort room_no field in ascending order
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
  // Fetch seats for selected room
  // useEffect(() => {
  //   if (!selectedRoom) return;

  //   setLoading(true);
  //   const seatsRef = collection(db, `${selectedCollection}/${selectedRoom}/seats`);
    
  //   const unsubscribe = onSnapshot(seatsRef, (snapshot) => {
  //     const seatsData = snapshot.docs.map(doc => ({
  //       seatNumber: doc.id,
  //       ...doc.data()
  //     }));
  //     setSeats(seatsData);
  //     setLoading(false);
  //   }, (error) => {
  //     console.error('Error fetching seats:', error);
  //     setError('Failed to load seats');
  //     setLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, [selectedRoom, selectedCollection]);

  useEffect(() => {
    if (!selectedRoom) return;
  
    setLoading(true);
    const seatsRef = collection(db, `${selectedCollection}/${selectedRoom}/seats`);
    
    const unsubscribe = onSnapshot(seatsRef, (snapshot) => {
      const seatsData = snapshot.docs.map(doc => ({
        seatNumber: parseInt(doc.id, 10),
        ...doc.data()
      }));
  
      // Generate an array of all seat numbers (1-60)
      const allSeats = Array.from({ length: totalSeats }, (_, i) => ({
        seatNumber: i + 1,  // Seat numbers from 1 to 60
        id: null,  // No student assigned
        dept: null // No department
      }));
  
      // Merge the existing seat data into the full list
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
  }, [selectedRoom, selectedCollection]);
  

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
          placeholder="Select a Collection"
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          bg="white"
          maxW="400px"
          mb={4}
        >
          {collections.map(collection => (
            <option key={collection} value={collection}>{collection.replace(/_/g, ' ')}</option>
          ))}
        </Select>
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