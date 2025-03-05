import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  useColorModeValue,
} from "@chakra-ui/react";

const SemesterRoutineTable = ({
  semesterClasses,
  timeSlots,
  dayMapping,
  onSlotSelect,
}) => {
  // Create day-based organization of classes
  const routineByDay = {};

  Object.values(dayMapping).forEach((day) => {
    routineByDay[day] = {};
    timeSlots.forEach((time) => {
      routineByDay[day][time] = { isFree: true };
    });
  });

  // Fill in the classes with special handling for labs
  semesterClasses.forEach((cls) => {
    if (routineByDay[cls.day] && routineByDay[cls.day][cls.time]) {
      let isLab = false;
      // Check if it's a lab course
      if (cls.type === "lab") {
        isLab = true;
      }

      // For lab courses, mark two consecutive time slots
      if (isLab) {
        // Find the index of current time slot
        const currentTimeIndex = timeSlots.indexOf(cls.time);
        if (currentTimeIndex >= 0 && currentTimeIndex < timeSlots.length - 1) {
          // Mark current time slot
          routineByDay[cls.day][cls.time] = {
            isFree: false,
            isLabFirst: true,
            ...cls,
          };

          // Mark next time slot
          const nextTime = timeSlots[currentTimeIndex + 1];
          routineByDay[cls.day][nextTime] = {
            isFree: false,
            isLabSecond: true,
            ...cls,
          };
        }
      } else {
        // For regular theory classes, mark single time slot
        routineByDay[cls.day][cls.time] = {
          isFree: false,
          ...cls,
        };
      }
    }
  });

  const renderCourseCell = (slot) => {
    if (slot.isFree) {
      return (
        <Tag
          colorScheme="gray"
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
          minH="60px"
        >
          Free Slot
        </Tag>
      );
    }

    const isLab = slot.isLabFirst || slot.isLabSecond;
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
        minH="60px"
      >
        <div>
          <div>{slot.course}</div>
          <div>Room: {slot.room}</div>
          <div>Teacher: {slot.teacher1}</div>
          {slot.type === "lab" && <div>Teacher 2: {slot.teacher2}</div>}
          <div>Type: {slot.type || "theory"}</div>
          {slot.isLabFirst && <div>(Lab - 2 slots)</div>}
        </div>
      </Tag>
    );
  };

  return (
    <Box overflowX="auto" mb={8}>
      <Table variant="striped" border="black" colorScheme="white" size="xl">
        <Thead bg="rgb(43, 65, 98)">
          <Tr>
            <Th width="15%" textAlign="center" color="rgb(43, 41, 41)">
              Day / Time
            </Th>
            {timeSlots.map((time) => (
              <Th
                key={time}
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
          {Object.values(dayMapping).map((day) => (
            <Tr key={day}>
              <Td
                fontWeight="600"
                textAlign="center"
                bg={useColorModeValue("white", "gray.800")}
              >
                {day}
              </Td>
              {timeSlots.map((time) => {
                const slot = routineByDay[day][time];
                return (
                  <Td
                    key={`${day}-${time}`}
                    textAlign="center"
                    p={2}
                    onClick={() => onSlotSelect(day, time, slot)}
                    cursor="pointer"
                    borderTop={slot?.isLabSecond ? "none" : "1px solid"}
                    borderBottom={slot?.isLabFirst ? "none" : "1px solid"}
                  >
                    {slot ? renderCourseCell(slot) : "---"}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default SemesterRoutineTable;
