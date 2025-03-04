import React, { useState, useEffect, useContext } from "react";
import { db } from "../../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Tag,
  useColorModeValue,
  Spinner,
  Text,
} from "@chakra-ui/react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const Slots = [
  "8:00-9:15",
  "9:15-10:30",
  "10:30-11:45",
  "11:45-1:00",
  "2:30-3:45",
  "3:45-5:00",
];

const StudentRoutine = () => {
  const [routine, setRoutine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchRoutine = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const sem = userData.semester;
            const sect = userData.section;
            const sem_sect = "semester_" + sem + "_" + sect;
            const timeSlotRef = collection(db, sem_sect.toString());
            const timeSlotsSnapshot = await getDocs(timeSlotRef);

            // Initialize an empty routine array
            const newRoutine = daysOfWeek.map(() => Slots.map(() => null));

            timeSlotsSnapshot.forEach((doc) => {
              const timeSlotData = doc.data();
              const {
                class_cancelled,
                rescheduled,
                perm_course_code,
                perm_course_title,
                perm_course_type,
                perm_day,
                perm_room,
                perm_teacher_1,
                perm_teacher_2,
                perm_time_1,
                perm_time_2,
                temp_course_code,
                temp_course_title,
                temp_day,
                temp_lab,
                temp_room,
                temp_teacher_1,
                temp_teacher_2,
                temp_time_1,
                temp_time_2,
              } = timeSlotData;
              var slotIndex = -1;
              var slotIndex2 = -1;

              let course_code = perm_course_code;
              let course_title = perm_course_title;
              let teacher_1 = perm_teacher_1;
              let teacher_2 = perm_teacher_2;
              let course_type = perm_course_type;
              let room = perm_room;

              var dayIndex = daysOfWeek.indexOf(perm_day);
              slotIndex = Slots.indexOf(timeSlotData.perm_time_1); // Assuming perm_time_1 corresponds to the slot time
              slotIndex2 = Slots.indexOf(timeSlotData.perm_time_1);

              if (class_cancelled === 1 || rescheduled === 1) {
                course_code = "Cancelled";
                course_title = "";
                teacher_1 = "";
                teacher_2 = "";
                room = "";
                console.log("Class Cancelled or Rescheduled");
              }
              if (temp_course_code !== "") {
                course_code = temp_course_code;
                teacher_1 = temp_teacher_1;
                room = temp_room;

                dayIndex = daysOfWeek.indexOf(temp_day);
                console.log(`dayIndex: ${dayIndex}`);
                slotIndex = Slots.indexOf(timeSlotData.temp_time_1); // Assuming perm_time_1 corresponds to the slot time
                console.log(`slot Index: ${slotIndex}`);
                slotIndex2 = Slots.indexOf(timeSlotData.temp_time_1);

                console.log("Temporary Class Found");
                console.log(`Course : ${course_code}`);
                console.log(`teacher : ${teacher_1}`);
                console.log(`room : ${room}`);
                console.log(`day : ${temp_day}`);
                console.log(`time : ${timeSlotData.temp_time_1}`);
              }

              // Find the index for the day and slot

              if (course_type === "lab") {
                slotIndex2 = Slots.indexOf(timeSlotData.perm_time_2);
              }

              // Update the 2D routine array with course details
              if (dayIndex !== -1 && slotIndex !== -1) {
                newRoutine[dayIndex][slotIndex] = {
                  course_code,
                  course_title,
                  teacher_1,
                  teacher_2,
                  room,
                };
                if (slotIndex2 !== -1) {
                  newRoutine[dayIndex][slotIndex2] = {
                    course_code,
                    course_title,
                    teacher_1,
                    teacher_2,
                    room,
                  };
                }
              }
            });

            setRoutine(newRoutine);
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          console.error(err);
          setError("Error fetching routine.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRoutine();
  }, [currentUser]);

  const renderCourseCell = (course) => {
    if (!course) return null;

    const isLab = course.course_type === "lab";
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
        {course.course_code}
        <br />
        {course.teacher_1} {course.teacher_2 && `& ${course.teacher_2}`}
        <br />
        {course.room}
      </Tag>
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

  if (error) {
    return (
      <Box textAlign="center" p={8}>
        <Text fontSize="lg" color="red.500">
          {error}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6} color="rgb(43, 65, 98)">
        Your Routine
      </Heading>

      <Box overflowX="auto">
        <Table variant="striped" border="black" colorScheme="white" size="xl">
          <Thead bg="rgba(205, 219, 242, 0.89)" height="60px">
            <Tr>
              <Th width="15%" textAlign="center" color="rgb(43, 41, 41)">
                Day
              </Th>
              {Slots.map((time, index) => (
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
            {daysOfWeek.map((day, dayIndex) => (
              <Tr key={dayIndex}>
                <Td
                  fontWeight="600"
                  textAlign="center"
                  bg={useColorModeValue("white", "gray.800")}
                >
                  {day}
                </Td>
                {Slots.map((_, timeIndex) => {
                  const course = routine[dayIndex][timeIndex];
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
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default StudentRoutine;