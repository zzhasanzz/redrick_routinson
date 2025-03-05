import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
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

const AdminViewRoutine = () => {
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState(null); // Initialize as null
  const [availableSemesters, setAvailableSemesters] = useState([]); // Track available semesters

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
    const fetchAllRoutines = async () => {
      try {
        const processedData = {};
        const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]; // All possible semesters
        const sections = ["A", "B"];
        const availableSems = []; // To store semesters that exist in Firestore

        for (const semester of semesters) {
          let semesterExists = false;

          for (const section of sections) {
            const semesterRef = collection(db, `semester_${semester}_${section}`);
            const snapshot = await getDocs(semesterRef);

            if (!snapshot.empty) {
              semesterExists = true;
              processedData[semester] = processedData[semester] || {};

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
                    if (
                      courseType === "lab" &&
                      timeIndex + 2 <= timeSlots.length
                    ) {
                      routineStructure[dayIndex][timeIndex + 2] = courseInfo;
                    }
                  }
                }
              });

              processedData[semester][section] = routineStructure;
            }
          }

          if (semesterExists) {
            availableSems.push(semester); // Add semester to available list
          }
        }

        setTimetableData(processedData);
        setAvailableSemesters(availableSems); // Set available semesters
        if (availableSems.length > 0) {
          setActiveSemester(availableSems[0]); // Set the first available semester as active
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching routines:", error);
        setLoading(false);
      }
    };

    fetchAllRoutines();
  }, []);

  const renderCourseCell = (course) => {
    if (!course) return null;

    const isLab = course.includes(" + ") || course.includes("Lab");
    const colorScheme = isLab ? "green" : "blue";

    return (
      <Tag
        colorScheme={colorScheme}
        variant="subtle"
        borderRadius="md"
        size="md"
        w="100%"
        py={2}
        whiteSpace="normal"
        display="flex"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        minH="60px" // Set minimum height for consistency
      >
        {course}
      </Tag>
    );
  };

  const renderSectionTable = (sectionData) => {
    return (
      <Box overflowX="auto" mb={8}>
        <Table variant="striped" border="black" colorScheme="white" size="xl">
          <Thead bg="rgba(205, 219, 242, 0.89)" height="60px">
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

      {availableSemesters.length > 0 ? (
        <Tabs
          colorScheme="gray"
          _hover={{
            bg: "white", // Light gray on hover
            transition: "background 0.4s ease-in-out",
          }}
          onChange={(index) => setActiveSemester(availableSemesters[index])}
        >
          <TabList mb={6}>
            {availableSemesters.map((semester) => (
              <Tab
                key={semester}
                _hover={{
                  bg: "gray.100", // Light gray on hover
                  transition: "background 0.4s ease-in-out",
                }}
              >
                Semester {semester}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {availableSemesters.map((semester) => (
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
      ) : (
        <Text textAlign="center" p={4}>
          No routine data available.
        </Text>
      )}
    </Box>
  );
};

export default AdminViewRoutine;