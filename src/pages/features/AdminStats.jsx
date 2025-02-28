import { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Heading,
  Container,
  Skeleton,
  Alert,
  AlertIcon,
  Text,
  Badge,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  // Fetch the scheduler analysis data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('../../../backend/scheduler_analysis.json'); // Update the path to your JSON file
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="40px" my={4} />
        <Skeleton height="20px" my={4} />
        <Skeleton height="20px" my={4} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info">
          <AlertIcon />
          No data available.
        </Alert>
      </Container>
    );
  }

  // Get the list of faculty IDs
  const facultyIds = Object.keys(stats.faculty_details);

  // Get the selected faculty's details
  const selectedFacultyDetails = selectedFaculty
    ? stats.faculty_details[selectedFaculty]
    : null;

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>
        Schedule Analysis Statistics
      </Heading>

      {/* Overall Statistics */}
      <Box mb={8}>
        <Heading as="h2" fontSize="25px" mb={2}>
          Schedule Statistics
        </Heading>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th backgroundColor="rgb(214, 235, 217)" textAlign= "center">Metric</Th>
              <Th backgroundColor="rgb(214, 235, 217)" textAlign= "center">Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td textAlign= "center">Total Courses</Td>
              <Td textAlign= "center">{stats.total_courses}</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center">Theory Courses</Td>
              <Td textAlign= "center">{stats.theory_courses}</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center">Lab Courses</Td>
              <Td textAlign= "center">{stats.lab_courses}</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center">Theory Full Matches</Td>
              <Td textAlign= "center">{stats.theory_full_matches}</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center">Lab Full Matches</Td>
              <Td textAlign= "center">{stats.lab_full_matches}</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center">Lab Partial Matches</Td>
              <Td textAlign= "center">{stats.lab_partial_matches}</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center">No Matches</Td>
              <Td textAlign= "center">{stats.no_matches}</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center" fontWeight="bold">Theory Success Rate</Td>
              <Td textAlign= "center" fontWeight="bold">{stats.theory_success_rate}%</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center" fontWeight="bold">Lab Full Match Percentage</Td>
              <Td textAlign= "center" fontWeight="bold">{stats.lab_full_match_percent}%</Td>
            </Tr>
            <Tr>
              <Td textAlign= "center" fontWeight="bold">Lab Partial Match Percentage</Td>
              <Td textAlign= "center" fontWeight="bold">{stats.lab_partial_match_percent}%</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>

      {/* Faculty Selection Dropdown */}
      <Box mb={8}>
        <FormControl>
          <FormLabel>Select Faculty</FormLabel>
          <Select
            placeholder="Select a faculty"
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            bg="white"
          >
            {facultyIds.map((facultyId) => (
              <option key={facultyId} value={facultyId}>
                {facultyId}
              </option>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Faculty Details */}
      {selectedFacultyDetails && (
        <Box>
          <Heading as="h2" size="md" mb={4}>
            Faculty Details: {selectedFaculty}
          </Heading>

          {/* Faculty Summary */}
          <Box mb={6}>
            <Heading as="h3" size="md" mb={4}>
              Summary
            </Heading>
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>Metric</Th>
                  <Th>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>Total Courses</Td>
                  <Td>{selectedFacultyDetails.total_courses}</Td>
                </Tr>
                <Tr>
                  <Td>Theory Courses</Td>
                  <Td>{selectedFacultyDetails.theory.total}</Td>
                </Tr>
                <Tr>
                  <Td>Lab Courses</Td>
                  <Td>{selectedFacultyDetails.labs.total}</Td>
                </Tr>
                <Tr>
                  <Td>Theory Full Matches</Td>
                  <Td>{selectedFacultyDetails.theory.full_matches}</Td>
                </Tr>
                <Tr>
                  <Td>Lab Full Matches</Td>
                  <Td>{selectedFacultyDetails.labs.full_matches}</Td>
                </Tr>
                <Tr>
                  <Td>Lab Partial Matches</Td>
                  <Td>{selectedFacultyDetails.labs.partial_matches}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>

          {/* Theory Issues */}
          {selectedFacultyDetails.theory.issues.length > 0 && (
            <Box mb={6}>
              <Heading as="h3" size="md" mb={4}>
                Theory Issues
              </Heading>
              <Table variant="striped">
                <Thead>
                  <Tr>
                    <Th>Course</Th>
                    <Th>Day</Th>
                    <Th>Time</Th>
                    <Th>Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedFacultyDetails.theory.issues.map((issue, index) => (
                    <Tr key={index}>
                      <Td>{issue.course}</Td>
                      <Td>{issue.day}</Td>
                      <Td>{issue.time}</Td>
                      <Td>
                        <Badge colorScheme="red">{issue.type}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* Lab Issues */}
          {selectedFacultyDetails.labs.issues.length > 0 && (
            <Box mb={6}>
              <Heading as="h3" size="md" mb={4}>
                Lab Issues
              </Heading>
              <Table variant="striped">
                <Thead>
                  <Tr>
                    <Th>Course</Th>
                    <Th>Day</Th>
                    <Th>Time</Th>
                    <Th>Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedFacultyDetails.labs.issues.map((issue, index) => (
                    <Tr key={index}>
                      <Td>{issue.course}</Td>
                      <Td>{issue.day}</Td>
                      <Td>{issue.time}</Td>
                      <Td>
                        <Badge colorScheme="orange">{issue.type}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default AdminStats;