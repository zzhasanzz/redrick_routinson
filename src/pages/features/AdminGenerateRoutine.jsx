import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  useColorModeValue,
  Spinner,
  Text,
  Button,
  Flex,
  useToast,
  Select,
} from "@chakra-ui/react";
import axios from "axios";

const AdminGenerateRoutine = () => {
  const [timetableData, setTimetableData] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(false);
  const [isRoutineGenerating, setIsRoutineGenerating] = useState(false);
  const [activeSemester, setActiveSemester] = useState("1");
  const [currentSeason, setCurrentSeason] = useState(null); // Track the last generated season
  const [lastGeneratedTimestamp, setLastGeneratedTimestamp] = useState(null); // Track the last generated timestamp
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [currentRoom, setCurrentRoom] = useState("");
  const [currentTimeSlot, setCurrentTimeSlot] = useState();
  const [newTimeSlot, setNewTimeSlot] = useState();
  const [selectedNewRoom, setSelectedNewRoom] = useState("");
  const [activeSection, setActiveSection] = useState("A");
  const [rescheduleSource, setRescheduleSource] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null); // Add this state
  const [rescheduleTargetRoom, setRescheduleTargetRoom] = useState(""); // Add this state
  const toast = useToast();

  const timeSlots = [
    "8:00-9:15",
    "9:15-10:30",
    "10:30-11:45",
    "11:45-1:00",
    "2:30-3:45",
    "3:45-5:00",
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const allRooms = new Set([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "301",
    "302",
    "304",
    "204",
    "104",
    "105",
  ]);

  const revTimeMapping = {
    "8:00-9:15": 1,
    "9:15-10:30": 2,
    "10:30-11:45": 3,
    "11:45-1:00": 4,
    "2:30-3:45": 5,
    "3:45-5:00": 6,
  };

  const revDayMapping = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
  };

  useEffect(() => {
    // Fetch the last generated routine type and timestamp from Firestore
    const fetchLastGeneratedRoutine = async () => {
      try {
        const docRef = doc(db, "routine_status", "generation");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = docSnap.data();

          setCurrentSeason(data.season.toLocaleString()); // Set the current season
          console.log("Current Season: ", data["season"]);
          setLastGeneratedTimestamp(data.timestamp.toDate().toLocaleString()); // Convert Firestore timestamp to readable format
        }
      } catch (error) {
        console.error("Error fetching last generated routine:", error);
      }
    };

    fetchLastGeneratedRoutine();
  }, []);

  useEffect(() => {
    // Fetch routine data only if a season has been generated
    if (currentSeason) {
      fetchAllRoutines();
    }
  }, [currentSeason]);

  const fetchAvailableRooms = async (timeSlot) => {
    try {
      console.log("Fetching available rooms for time slot: ", timeSlot);

      let avRooms = new Set([...allRooms]);

      const roomsRef = collection(db, `time_slots/${timeSlot}/rooms`);
      const roomsSnapshot = await getDocs(roomsRef);
      roomsSnapshot.forEach((doc) => {
        const roomID = doc.id.toString();
        avRooms.delete(roomID);
      });
      console.log("Available Rooms: ", avRooms);
      console.log("All Rooms: ", allRooms);

      // Convert Set to array and update availableRooms state
      const available = Array.from(avRooms);
      setAvailableRooms(available);
      console.log("Available Rooms: ", available);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available rooms.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const fetchAllRoutines = async () => {
    try {
      setLoading(true);
      const processedData = {};
      const semesters =
        currentSeason === "summer"
          ? ["2", "4", "6", "8"]
          : ["1", "3", "5", "7"];
      const sections = ["A", "B"];
      console.log("seasons: ", currentSeason);
      setCurrentSeason(currentSeason);

      setActiveSemester(currentSeason === "summer" ? "2" : "1");

      for (const semester of semesters) {
        processedData[semester] = {};

        for (const section of sections) {
          const routineData = [];
          const semesterRef = collection(db, `semester_${semester}_${section}`);
          const snapshot = await getDocs(semesterRef);

          // Initialize empty routine structure
          const routineStructure = days.map((day) => {
            const row = [day];
            for (let i = 0; i < timeSlots.length; i++) {
              row.push(null);
            }
            return row;
          });

          // Fill in the routine with actual data
          snapshot.forEach((doc) => {
            const data = doc.data();

            const courseInfo = `${data.perm_course_code}\n${data.perm_teacher_1}\n${data.perm_teacher_2}\n${data.perm_room}`;

            const dayIndex = days.indexOf(data.perm_day);
            const timeIndex = timeSlots.indexOf(data.perm_time_1);

            if (dayIndex !== -1 && timeIndex !== -1) {
              routineStructure[dayIndex][timeIndex + 1] = courseInfo;

              // If it's a lab, fill the next slot too
              const courseType = data.perm_course_type;
              if (courseType === "lab" && timeIndex + 2 <= timeSlots.length) {
                routineStructure[dayIndex][timeIndex + 2] = courseInfo;
              }
            }
          });

          processedData[semester][section] = routineStructure;
        }
      }

      setTimetableData(processedData);
    } catch (error) {
      console.error("Error fetching routines:", error);
      toast({
        title: "Error",
        description: "Failed to fetch routine data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoutine = async (season) => {
    try {
      setIsRoutineGenerating(true);
      const response = await axios.post(
        "http://localhost:5000/admin-home/admin-generate-routine", // Correct URL
        { season }
      );

      if (response.status === 200) {
        setCurrentSeason(season); // Update the current season
        toast({
          title: "Success",
          description: `Routine generation for ${season} started successfully!`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error generating routine:", error);
      toast({
        title: "Error",
        description: `Failed to generate routine for ${season}.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRoutineGenerating(false);
    }
  };

  const handleCellClick = async (day, time, course) => {
    // If in reschedule mode and source is already selected
    if (selectedAction === "reschedule" && rescheduleSource) {
      // Set target cell for rescheduling
      setRescheduleTarget({ day, time });
      return;
    }
    const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];

    let courseCode = "";
    let teacher1 = "";
    let teacher2 = "";
    let currentRoom = "";
    let courseType = "theory";

    if (course) {
      const parts = course.split("\n");
      courseCode = parts[0];
      teacher1 = parts[1];
      teacher2 = parts[2];
      currentRoom = parts[3];
      const courseRef = doc(db, "courses", courseCode);
      const courseDoc = await getDoc(courseRef);
      const courseData = courseDoc.data();
      const otherTeacher = teacher2;

      courseType = courseData.course_type;
    }
    console.log("Course Code: ", courseCode);
    console.log("Teacher 1: ", teacher1);
    console.log("Teacher 2: ", teacher2);
    console.log("Current Room: ", currentRoom);
    console.log("Course Type: ", courseType);
    console.log("Time Slot: ", timeSlot);
    console.log("Day: ", day);
    console.log("Time: ", time);

    setSelectedCell({
      day,
      time,
      courseCode,
      teacher1,
      teacher2,
      currentRoom,
      courseType,
      semester: activeSemester,
      section: activeSection,
    });

    await fetchAvailableRooms(timeSlot);
  };

  const updateRoomForTimeSlot = async (
    timeSlot,
    selectedNewRoom,
    courseData
  ) => {
    const {
      courseCode,
      teacher1,
      teacher2,
      currentRoom,
      courseType,
      semester,
      section,
    } = courseData;

    // Update semester document
    const semesterRef = doc(
      db,
      `semester_${semester}_${section}`,
      timeSlot.toString()
    );
    await updateDoc(semesterRef, { perm_room: selectedNewRoom });

    // Delete old room document if it exists
    if (currentRoom) {
      const oldRoomRef = doc(db, `time_slots/${timeSlot}/rooms`, currentRoom);
      await deleteDoc(oldRoomRef);
    }

    // Create new room document
    const newRoomRef = doc(db, `time_slots/${timeSlot}/rooms`, selectedNewRoom);
    await setDoc(
      newRoomRef,
      {
        perm_course_code: courseCode,
        temp_course_code: "",
        perm_course_type: courseType,
        perm_teacher_1: teacher1,
        perm_teacher_2: teacher2,
        section: section,
        class_cancelled: 0,
        rescheduled: 0,
      },
      { merge: true }
    );

    // Update teacher's course room assignment
    const courseRef = doc(
      db,
      `teachers/${teacher1}/courses`,
      `${courseCode}_${section}`
    );
    const courseDoc = await getDoc(courseRef);
    const courseDocData = courseDoc.data();

    if (courseDocData && courseDocData.assigned_room) {
      const assignedRooms = [...courseDocData.assigned_room];
      const roomIndex = assignedRooms.indexOf(currentRoom);
      if (roomIndex !== -1) {
        assignedRooms[roomIndex] = selectedNewRoom;
        await updateDoc(courseRef, {
          assigned_room: assignedRooms,
        });
      }
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleSource || !rescheduleTarget || !rescheduleTargetRoom) return;

    try {
      const {
        day: sourceDay,
        time: sourceTime,
        courseCode,
        teacher1,
        teacher2,
        currentRoom,
        courseType,
        semester,
        section,
      } = rescheduleSource;

      console.log("Reschedule Source: ", rescheduleSource);
      console.log("Reschedule Target: ", rescheduleTarget);
      console.log("Course Code: ", courseCode);
      console.log("Teacher 1: ", teacher1);
      console.log("Teacher 2: ", teacher2);
      console.log("Current Room: ", currentRoom);
      console.log("Course Type: ", courseType);
      console.log("Semester: ", semester);
      console.log("Section: ", section);

      const { day: targetDay, time: targetTime } = rescheduleTarget;
      console.log("Target Day: ", targetDay);
      console.log("Target Time: ", targetTime);

      // Calculate time slots
      const sourceTimeSlot =
        revDayMapping[sourceDay] * 6 + revTimeMapping[sourceTime];
      const targetTimeSlot =
        revDayMapping[targetDay] * 6 + revTimeMapping[targetTime];

      // Check if target slot is available
      const targetRoomRef = doc(
        db,
        `time_slots/${targetTimeSlot}/rooms`,
        rescheduleTargetRoom
      );
      const targetRoomSnap = await getDoc(targetRoomRef);

      if (targetRoomSnap.exists()) {
        throw new Error("Selected room is already occupied in target slot");
      }

      // Fetch available rooms for target slot
      // await fetchAvailableRooms(targetTimeSlot);

      // if (!availableRooms.includes(currentRoom)) {
      //   throw new Error("Room not available in target slot");
      // }

      // Update source slot (remove class)
      const sourceSemesterRef = doc(
        db,
        `semester_${semester}_${section}`,
        sourceTimeSlot.toString()
      );
      await deleteDoc(sourceSemesterRef);

      // Update target slot (add class)
      const targetSemesterRef = doc(
        db,
        `semester_${semester}_${section}`,
        targetTimeSlot.toString()
      );
      await setDoc(targetSemesterRef, {
        class_cancelled: 0,
        rescheduled: 0,
        temp_course_code: "",
        perm_course_code: courseCode,
        perm_day: targetDay,
        perm_time_1: targetTime,
        perm_teacher_1: teacher1,
        perm_teacher_2: teacher2,
        perm_room: rescheduleTargetRoom, // Use the new selected room
        perm_course_type: courseType,
      });

      // Update time_slots collection
      // Remove from source
      const sourceRoomRef = doc(
        db,
        `time_slots/${sourceTimeSlot}/rooms`,
        currentRoom
      );
      await deleteDoc(sourceRoomRef);

      // Add to target
      const newRoomRef = doc(
        db,
        `time_slots/${targetTimeSlot}/rooms`,
        rescheduleTargetRoom
      );
      await setDoc(newRoomRef, {
        perm_course_code: courseCode,
        perm_course_type: courseType,
        perm_teacher_1: teacher1,
        perm_teacher_2: teacher2,
        section: section,
        temp_course_code: "",
        class_cancelled: 0,
        rescheduled: 0,
      });

      const courseRef = doc(
        db,
        `teachers/${teacher1}/courses`,
        `${courseCode}_${section}`
      );
      const courseDoc = await getDoc(courseRef);
      const courseDocData = courseDoc.data();

      if (courseDocData && courseDocData.assigned_room) {
        const assignedRooms = [...courseDocData.assigned_room];
        const assignedTimeSlots = [...courseDocData.assigned_time_slots];
        const roomIndex = assignedRooms.indexOf(currentRoom);
        if (roomIndex !== -1) {
          assignedRooms[roomIndex] = rescheduleTargetRoom;
          assignedTimeSlots[roomIndex] = targetTimeSlot;
          await updateDoc(courseRef, {
            assigned_room: assignedRooms,
            assigned_time_slots: assignedTimeSlots,
          });
        }
      }

      toast({
        title: "Success",
        description: "Class rescheduled successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh data and reset states
      await fetchAllRoutines();
      setSelectedAction(null);
      setRescheduleSource(null);
      setRescheduleTarget(null);
      setRescheduleTargetRoom("");
      setSelectedCell(null);
      setAvailableRooms([]);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChangeRoom = async () => {
    if (!selectedNewRoom || !selectedCell) {
      toast({
        title: "Error",
        description: "Please select a room first",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const {
        day,
        time,
        courseCode,
        teacher1,
        teacher2,
        currentRoom,
        courseType,
        semester,
        section,
      } = selectedCell;

      const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
      const courseData = {
        courseCode,
        teacher1,
        teacher2,
        currentRoom,
        courseType,
        semester,
        section,
      };

      // Update the first time slot
      await updateRoomForTimeSlot(timeSlot, selectedNewRoom, courseData);

      // If it's a lab, update the next time slot as well
      if (courseType === "lab") {
        await updateRoomForTimeSlot(timeSlot + 1, selectedNewRoom, courseData);
      }

      toast({
        title: "Success",
        description: `Room changed to ${selectedNewRoom}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the routine data
      await fetchAllRoutines();

      // Reset states
      setSelectedNewRoom("");
      setSelectedCell(null);
      setSelectedAction(null);
      setAvailableRooms([]);
    } catch (error) {
      console.error("Error changing room:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change room",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderCourseCell = (course, day, time) => {
    if (selectedAction === "reschedule") {
      if (
        rescheduleSource &&
        rescheduleTarget?.day === day &&
        rescheduleTarget?.time === time
      ) {
        return (
          <Box bg="yellow.100" p={2} textAlign="center">
            <Text mb={2}>Select room to reschedule:</Text>
            <Select
              placeholder="Select room"
              value={rescheduleTargetRoom}
              onChange={(e) => setRescheduleTargetRoom(e.target.value)}
              size="sm"
              mb={2}
            >
              {availableRooms.map((room) => (
                <option key={room} value={room}>
                  Room {room}
                </option>
              ))}
            </Select>
            <Button
              size="xs"
              colorScheme="green"
              onClick={handleReschedule}
              isDisabled={!rescheduleTargetRoom}
              mr={2}
            >
              Confirm
            </Button>
            <Button
              size="xs"
              onClick={() => {
                setRescheduleTarget(null);
                setRescheduleTargetRoom("");
                setAvailableRooms([]);
              }}
            >
              Cancel
            </Button>
          </Box>
        );
      }

      if (!course) {
        return (
          <Box
            bg="green.50"
            cursor="pointer"
            onClick={async () => {
              const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
              await fetchAvailableRooms(timeSlot);
              setRescheduleTarget({ day, time });
            }}
          >
            Select to reschedule here
          </Box>
        );
      }
    }

    if (selectedCell?.day === day && selectedCell?.time === time) {
      if (selectedAction === "changeRoom") {
        return (
          <Box
            w="100%"
            h="100%"
            p={2}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <Select
              placeholder="Select new room"
              value={selectedNewRoom}
              onChange={(e) => setSelectedNewRoom(e.target.value)}
              size="sm"
            >
              {availableRooms.map((room) => (
                <option key={room} value={room}>
                  Room {room}
                </option>
              ))}
            </Select>
            <Flex gap={2}>
              <Button
                size="xs"
                colorScheme="teal"
                onClick={handleChangeRoom}
                isDisabled={!selectedNewRoom}
              >
                Confirm
              </Button>
              <Button
                size="xs"
                onClick={() => {
                  setSelectedCell(null);
                  setSelectedAction(null);
                }}
              >
                Cancel
              </Button>
            </Flex>
          </Box>
        );
      }

      // Show action buttons when cell is selected
      return (
        <Box
          w="100%"
          h="100%"
          p={2}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          {selectedCell.courseCode ? (
            <>
              <>
                <Button
                  size="sm"
                  colorScheme="teal"
                  onClick={() => setSelectedAction("changeRoom")}
                >
                  Change Room
                </Button>
                <Button
                  size="sm"
                  colorScheme="orange"
                  onClick={() => {
                    setSelectedAction("reschedule");
                    setRescheduleSource(selectedCell);
                  }}
                >
                  Reschedule
                </Button>
              </>
            </>
          ) : (
            <Text fontSize="sm">No course in this slot</Text>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedCell(null);
              setSelectedAction(null);
            }}
          >
            Cancel
          </Button>
        </Box>
      );
    }

    if (!course) {
      return (
        <Box
          cursor="pointer"
          onClick={() => handleCellClick(day, time, null)}
          w="100%"
          h="100%"
          p={2}
          _hover={{ bg: "gray.100" }}
        >
          ---
        </Box>
      );
    }

    // Regular course display
    const [code, teacher1, teacher2, room] = course.split("\n");
    const isLab = code.endsWith("2") || code.includes("LAB");

    return (
      <Tag
        onClick={() => handleCellClick(day, time, course)}
        cursor="pointer"
        colorScheme={isLab ? "purple" : "blue"}
        variant="subtle"
        borderRadius="md"
        size="md"
        w="100%"
        py={2}
        whiteSpace="pre-wrap"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        minH="60px"
        bg={isLab ? "purple.50" : "blue.50"}
        color={isLab ? "purple.800" : "blue.800"}
        boxShadow={`inset 0 0 0 1px ${isLab ? "purple.200" : "blue.200"}`}
      >
        <Text fontWeight="bold">{code}</Text>
        <Text fontSize="sm">{teacher1}</Text>
        <Text fontSize="sm">{teacher2}</Text>
        <Text fontSize="sm">Room: {room}</Text>
      </Tag>
    );
  };

  const renderSectionTable = (sectionData) => {
    return (
      <Box overflowX="auto" mb={8}>
        <Table variant="striped" border="black" colorScheme="white" size="xl">
          <Thead bg="rgb(179, 188, 201)" height="60px">
            <Tr>
              <Th width="15%" textAlign="center" color="rgb(43, 41, 41)">
                Day
              </Th>
              {timeSlots.map((time, index) => (
                <Th
                  key={index}
                  textAlign="center"
                  fontSize="15px"
                  width={`${82 / 6}%`}
                  color="rgb(43, 41, 41)"
                >
                  {time}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {days.map((day, dayIndex) => {
              const dayData = sectionData.find((d) => d[0] === day);
              return (
                <Tr key={dayIndex}>
                  <Td
                    fontWeight="600"
                    textAlign="center"
                    bg={useColorModeValue("white", "gray.800")}
                  >
                    {day}
                  </Td>
                  {timeSlots.map((time, timeIndex) => {
                    const course = dayData ? dayData[timeIndex + 1] : null;
                    return (
                      <Td key={timeIndex} textAlign="center" p={2}>
                        {renderCourseCell(course, day, time)}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    );
  };

  if (isRoutineGenerating) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        <Text mt={4} fontSize="lg" fontWeight="bold">
          Generating Routine...
        </Text>
        <Text mt={2} color="gray.600">
          Please wait while we optimize the class schedule
        </Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box textAlign="center" p={8}>
        <Spinner size="xl" />
        <Text mt={4} fontSize="lg">
          Loading timetable data...
        </Text>
      </Box>
    );
  }

  const semesters =
    currentSeason === "summer" ? ["2", "4", "6", "8"] : ["1", "3", "5", "7"];
  console.log("Semesters: ", semesters);

  return (
    <Box p={6}>
      <Heading mb={6} color="rgb(43, 65, 98)">
        Routine for All Ongoing Semesters
      </Heading>

      {/* Buttons for generating routines */}
      <Flex mb={6} gap={4}>
        <Button
          colorScheme="teal"
          onClick={() => handleGenerateRoutine("summer")}
          isLoading={isRoutineGenerating}
        >
          Generate Summer Routine
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => handleGenerateRoutine("winter")}
          isLoading={isRoutineGenerating}
        >
          Generate Winter Routine
        </Button>
      </Flex>

      {timetableData ? (
        <>
          <Text textAlign="center" mb={8} fontSize="lg" fontWeight="bold">
            Last Generated Routine:{" "}
            {currentSeason === "summer" ? "Summer" : "Winter"} (Generated on:{" "}
            {lastGeneratedTimestamp})
          </Text>
          <Tabs
            colorScheme="gray"
            onChange={(index) => {
              setActiveSemester(semesters[index]);
              console.log("Active Semester: ", semesters[index]);
            }}
          >
            <TabList mb={6}>
              {semesters.map((semester) => (
                <Tab key={semester} _hover={{ bg: "gray.100" }}>
                  Semester {semester}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {semesters.map((semester) => (
                <TabPanel key={semester} p={2}>
                  <Tabs
                    variant="enclosed"
                    colorScheme="teal"
                    onChange={(index) =>
                      setActiveSection(index === 0 ? "A" : "B")
                    }
                  >
                    <TabList>
                      <Tab>Section A</Tab>
                      <Tab>Section B</Tab>
                    </TabList>

                    <TabPanels mt={4}>
                      <TabPanel p={2}>
                        {timetableData[semester]?.A ? (
                          renderSectionTable(timetableData[semester].A)
                        ) : (
                          <Text textAlign="center" p={4}>
                            No data for Section A
                          </Text>
                        )}
                      </TabPanel>
                      <TabPanel p={2}>
                        {timetableData[semester]?.B ? (
                          renderSectionTable(timetableData[semester].B)
                        ) : (
                          <Text textAlign="center" p={4}>
                            No data for Section B
                          </Text>
                        )}
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </>
      ) : (
        <Text textAlign="center" p={4}>
          No routine generated yet. Please generate a routine.
        </Text>
      )}
    </Box>
  );
};

export default AdminGenerateRoutine;
