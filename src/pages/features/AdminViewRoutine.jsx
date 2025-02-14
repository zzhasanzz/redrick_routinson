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
  VStack,
  Spinner,
} from "@chakra-ui/react";
import "./Timetable.css";

const AdminViewRoutine = () => {
  const [data, setData] = useState([]);
  const [data3, setData3] = useState([]);
  const [data5, setData5] = useState([]);
  const [data7, setData7] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("../../../backend/Semester_1_Routine.csv");
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csvData = decoder.decode(result.value);

      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (result) => {
          setData(result.data);
          setLoading(false); // Stop loading when data is fetched
        },
      });
    };

    fetchCSV();
  }, []);

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("../../../backend/Semester_3_Routine.csv");
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csvData = decoder.decode(result.value);

      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (result) => {
          setData3(result.data);
        },
      });
    };

    fetchCSV();
  }, []);

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("../../../backend/Semester_5_Routine.csv");
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csvData = decoder.decode(result.value);

      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (result) => {
          setData5(result.data);
        },
      });
    };

    fetchCSV();
  }, []);

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("../../../backend/Semester_7_Routine.csv");
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csvData = decoder.decode(result.value);

      Papa.parse(csvData, {
        header: false,
        skipEmptyLines: true,
        complete: (result) => {
          setData7(result.data);
        },
      });
    };

    fetchCSV();
  }, []);

  const renderTable = (tableData) => (
    <Table variant="striped" colorScheme="gray" size="md">
      <Thead>
        <Tr>
          {tableData.length > 0 &&
            tableData[0].map((header, index) => (
              <Th key={index} textAlign="center">
                {header}
              </Th>
            ))}
        </Tr>
      </Thead>
      <Tbody>
        {tableData.slice(1).map((row, rowIndex) => (
          <Tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <Td key={cellIndex} textAlign="center">
                {cell}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Heading mt={5}>Loading course routine...</Heading>
      </Box>
    );
  }

  return (
    <VStack spacing={8} p={5} align="stretch">
      {/* Semester 1 */}
      <Box>
        <Heading as="h2" size="lg" textAlign="center" mb={5}>
          Semester 1 Routine
        </Heading>
        {renderTable(data)}
      </Box>

      {/* Semester 3 */}
      <Box>
        <Heading as="h2" size="lg" textAlign="center" mb={5}>
          Semester 3 Routine
        </Heading>
        {renderTable(data3)}
      </Box>

      {/* Semester 5 */}
      <Box>
        <Heading as="h2" size="lg" textAlign="center" mb={5}>
          Semester 5 Routine
        </Heading>
        {renderTable(data5)}
      </Box>

      {/* Semester 7 */}
      <Box>
        <Heading as="h2" size="lg" textAlign="center" mb={5}>
          Semester 7 Routine
        </Heading>
        {renderTable(data7)}
      </Box>
    </VStack>
  );
};

export default AdminViewRoutine;
