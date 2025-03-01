import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, onSnapshot, doc } from "firebase/firestore";
import Papa from "papaparse";
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
} from "@chakra-ui/react";

const AdminGenerateRoutine = () => {
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRoutineGenerating, setIsRoutineGenerating] = useState(true);
  const [activeSemester, setActiveSemester] = useState("1");

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
    // First, check if routine generation is complete
    const unsubscribe = onSnapshot(
      doc(db, "routine_status", "generation"),
      (doc) => {
        if (doc.exists() && doc.data().status === "complete") {
          setIsRoutineGenerating(false);
          fetchAllRoutines();
        }
      },
      (error) => {
        console.error("Error listening to routine status:", error);
        setIsRoutineGenerating(false);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchAllRoutines = async () => {
    try {
      const processedData = {};
      const semesters = ["1", "3", "5", "7"];
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
    } finally {
      setLoading(false);
    }
  };

  const renderCourseCell = (course) => {
    if (!course) return null;

    const [code, teacher, room] = course.split("\n");
    // Check if course code ends with 2 (lab courses) or contains "LAB"
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
          <Thead bg="rgb(43, 65, 98)">
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
                        //bg={course ? useColorModeValue('white', 'gray.800') : useColorModeValue('gray.100', 'gray.700')}
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

  return (
    <Box p={6}>
      <Heading mb={6} color="rgb(43, 65, 98)">
        Routine for All Ongoing Semesters
      </Heading>

      <Tabs
        colorScheme="gray"
        _hover={{
          bg: "white", // Light gray on hover
          transition: "background 0.4s ease-in-out",
        }}
        onChange={(index) => setActiveSemester(["1", "3", "5", "7"][index])}
      >
        <TabList mb={6}>
          <Tab
            _hover={{
              bg: "gray.100", // Light gray on hover
              transition: "background 0.4s ease-in-out",
            }}
          >
            Semester 1
          </Tab>
          <Tab
            _hover={{
              bg: "gray.100", // Light gray on hover
              transition: "background 0.4s ease-in-out",
            }}
          >
            Semester 3
          </Tab>
          <Tab
            _hover={{
              bg: "gray.100", // Light gray on hover
              transition: "background 0.4s ease-in-out",
            }}
          >
            Semester 5
          </Tab>
          <Tab
            _hover={{
              bg: "gray.100", // Light gray on hover
              transition: "background 0.4s ease-in-out",
            }}
          >
            Semester 7
          </Tab>
        </TabList>

        <TabPanels>
          {["1", "3", "5", "7"].map((semester) => (
            <TabPanel key={semester} p={0}>
              <Tabs variant="enclosed" colorScheme="teal">
                <TabList>
                  <Tab
                    _hover={{
                      bg: "gray.100", // Light gray on hover
                      transition: "background 0.4s ease-in-out",
                    }}
                  >
                    Section A
                  </Tab>
                  <Tab
                    _hover={{
                      bg: "gray.100", // Light gray on hover
                      transition: "background 0.4s ease-in-out",
                    }}
                  >
                    Section B
                  </Tab>
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
    </Box>
  );
};

export default AdminGenerateRoutine;
