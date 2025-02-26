import React, { useState, useEffect } from "react";
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

const AdminViewRoutine = () => {
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
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
    const loadData = async () => {
      try {
        const response = await fetch("../../../backend/final_schedule.csv");
        const csvData = await response.text();

        const results = Papa.parse(csvData, { header: false }).data;
        const processedData = {};

        let currentSemester = "";
        let currentSection = "";

        results.forEach((row) => {
          if (row[0] && row[0].startsWith("Semester")) {
            // New section header
            const [sem, sec] = row[0].split(", Section ");
            currentSemester = sem.replace("Semester ", "").trim();
            currentSection = sec.replace('"', "").trim();

            if (!processedData[currentSemester]) {
              processedData[currentSemester] = {};
            }
            processedData[currentSemester][currentSection] = [];
          } else if (days.includes(row[0])) {
            // Day row data
            processedData[currentSemester][currentSection].push(row);
          }
        });

        setTimetableData(processedData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading timetable:", error);
        setLoading(false);
      }
    };

    loadData();
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

export default AdminViewRoutine;
