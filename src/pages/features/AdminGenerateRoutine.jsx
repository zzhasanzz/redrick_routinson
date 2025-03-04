import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
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
} from "@chakra-ui/react";
import axios from "axios";

const AdminGenerateRoutine = () => {
  const [timetableData, setTimetableData] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(false);
  const [isRoutineGenerating, setIsRoutineGenerating] = useState(false);
  const [activeSemester, setActiveSemester] = useState("1");
  const [currentSeason, setCurrentSeason] = useState(null); // Track the last generated season
  const [lastGeneratedTimestamp, setLastGeneratedTimestamp] = useState(null); // Track the last generated timestamp
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

  useEffect(() => {
    // Fetch the last generated routine type and timestamp from Firestore
    const fetchLastGeneratedRoutine = async () => {
      try {
        const docRef = doc(db, "routine_status", "generation");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentSeason(data.season); 
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

  const fetchAllRoutines = async () => {
    try {
      setLoading(true);
      const processedData = {};
      const semesters = currentSeason === "summer" ? ["2", "4", "6", "8"] : ["1", "3", "5", "7"];
      const sections = ["A", "B"];

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
            if (!data.class_cancelled || data.temp_course_code) {
              const courseInfo = data.temp_course_code
                ? `${data.temp_course_code}\n${data.temp_teacher_1}\n${data.temp_room}`
                : `${data.perm_course_code}\n${data.perm_teacher_1}\n${data.perm_room}`;

              const dayIndex = days.indexOf(data.temp_day || data.perm_day);
              const timeIndex = timeSlots.indexOf(
                data.temp_time_1 || data.perm_time_1
              );

              if (dayIndex !== -1 && timeIndex !== -1) {
                routineStructure[dayIndex][timeIndex + 1] = courseInfo;

                // If it's a lab, fill the next slot too
                const courseType =
                  data.temp_course_type || data.perm_course_type;
                if (courseType === "lab" && timeIndex + 2 <= timeSlots.length) {
                  routineStructure[dayIndex][timeIndex + 2] = courseInfo;
                }
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

  const renderCourseCell = (course) => {
    if (!course) return null;

    const [code, teacher, room] = course.split("\n");
    const isLab = code.endsWith("2") || code.includes("LAB");

    return (
      <Tag
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
        <Text fontSize="sm">{teacher}</Text>
        <Text fontSize="sm">Room: {room}</Text>
      </Tag>
    );
  };

  const renderSectionTable = (sectionData) => {
    return (
      <Box overflowX="auto" mb={8}>
        <Table variant="striped" border="black" colorScheme="white" size="xl">
          <Thead bg="rgb(179, 188, 201)" height ="60px">
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
                  {timeSlots.map((_, timeIndex) => {
                    const course = dayData ? dayData[timeIndex + 1] : null;
                    return (
                      <Td
                        key={timeIndex}
                        textAlign="center"
                        p={2}
                      >
                        {course ? renderCourseCell(course) : "---"}
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

  const semesters = currentSeason === "summer" ? ["2", "4", "6", "8"] : ["1", "3", "5", "7"];

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
            Last Generated Routine: {currentSeason === "summer" ? "Summer" : "Winter"} (Generated on: {lastGeneratedTimestamp})
          </Text>
          <Tabs
            colorScheme="gray"
            onChange={(index) => setActiveSemester(semesters[index])}
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
                  <Tabs variant="enclosed" colorScheme="teal">
                    <TabList>
                      <Tab _hover={{ bg: "gray.100" }}>Section A</Tab>
                      <Tab _hover={{ bg: "gray.100" }}>Section B</Tab>
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