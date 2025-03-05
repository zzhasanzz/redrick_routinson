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
  Flex
} from '@chakra-ui/react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  const facultyDonutData = selectedFacultyDetails
    ? [
      { name: 'Theory Issues', value: selectedFacultyDetails.theory.total - selectedFacultyDetails.theory.full_matches},
      { name: 'Lab Issues', value: selectedFacultyDetails.labs.total - selectedFacultyDetails.labs.full_matches},
      { name: 'Theory Full Matches', value: selectedFacultyDetails.theory.full_matches },
      { name: 'Lab Full Matches', value: selectedFacultyDetails.labs.full_matches },
      { name: 'Lab Partial Matches', value: selectedFacultyDetails.labs.partial_matches },
    ]
    : [];

  // Colors for the donut chart


  // Data for Pie Charts
  const theoryMatchData = [
    { name: 'Full Matches', value: stats.theory_full_matches },
    { name: 'No Matches', value: stats.no_matches },
  ];

  const labMatchData = [
    { name: 'Full Matches', value: stats.lab_full_matches },
    { name: 'Partial Matches', value: stats.lab_partial_matches },
    { name: 'No Matches', value: stats.no_matches },
  ];

  // Data for Faculty Load Histogram
  const facultyLoadData = facultyIds.map((facultyId) => ({
    faculty: facultyId,
    courses: stats.faculty_details[facultyId].total_courses,
  }));

  // Colors for Pie Charts
  const COLORS = ['rgb(235, 118, 118)', 'rgb(177, 88, 88)', 'rgb(62, 191, 129)', 'rgb(39, 139, 116)', 'rgb(168, 183, 148)'];
  const COLORS2 = [ 'rgb(62, 191, 129)', 'rgb(235, 118, 118)', 'rgb(159, 66, 16)'];

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        Schedule Analysis Statistics
      </Heading>

      {/* Pie Charts for Matches */}
      <Box mb={8}>
        <Box display="flex" justifyContent="space-around">
          <Box>
            <Heading as="h3" size="md" mb={2} textAlign="center" marginTop="22px">
              Theory Matches
            </Heading>
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                <Pie
                  data={theoryMatchData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {theoryMatchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box>
            <Heading as="h3" size="md" mb={2} textAlign="center" marginTop="22px">
              Lab Matches
            </Heading>
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                <Pie
                  data={labMatchData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {labMatchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS2[index % COLORS2.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Box>

      {/* Overall Statistics */}
      <Box mb={8}>

        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Metric</Th>
              <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td textAlign="center">Total Courses</Td>
              <Td textAlign="center">{stats.total_courses}</Td>
            </Tr>
            <Tr>
              <Td textAlign="center">Theory Courses</Td>
              <Td textAlign="center">{stats.theory_courses}</Td>
            </Tr>
            <Tr>
              <Td textAlign="center">Lab Courses</Td>
              <Td textAlign="center">{stats.lab_courses}</Td>
            </Tr>
            <Tr>
              <Td textAlign="center">Theory Full Matches</Td>
              <Td textAlign="center">{stats.theory_full_matches}</Td>
            </Tr>
            <Tr>
              <Td textAlign="center">Lab Full Matches</Td>
              <Td textAlign="center">{stats.lab_full_matches}</Td>
            </Tr>
            <Tr>
              <Td textAlign="center">Lab Partial Matches</Td>
              <Td textAlign="center">{stats.lab_partial_matches}</Td>
            </Tr>
            <Tr>
              <Td textAlign="center">No Matches</Td>
              <Td textAlign="center">{stats.no_matches}</Td>
            </Tr>
            <Tr>
              <Td textAlign="center" fontWeight="bold">Theory Success Rate</Td>
              <Td textAlign="center" fontWeight="bold">{stats.theory_success_rate}%</Td>
            </Tr>
            <Tr>
              <Td textAlign="center" fontWeight="bold">Lab Full Match Percentage</Td>
              <Td textAlign="center" fontWeight="bold">{stats.lab_full_match_percent}%</Td>
            </Tr>
            <Tr>
              <Td textAlign="center" fontWeight="bold">Lab Partial Match Percentage</Td>
              <Td textAlign="center" fontWeight="bold">{stats.lab_partial_match_percent}%</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>


      {/* Faculty Load Histogram */}
      {/* <Box mb={8}>
        <Heading as="h2" fontSize="25px" mb={4}>
          Faculty Course Load Distribution
        </Heading>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={facultyLoadData}>
            <XAxis dataKey="faculty" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="courses" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box> */}

      {/* Faculty Selection Dropdown */}
      {/* Faculty Selection Dropdown */}
      <Box mb={8}>
        <FormControl>
          <FormLabel textAlign="center" fontSize="20px" margin="20px">Select Faculty</FormLabel>
          <Flex justifyContent="center">
            <Select
              placeholder="Select a faculty"
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              bg="white"
              width="200px"
              textAlign="center"
            >
              {facultyIds.map((facultyId) => (
                <option key={facultyId} value={facultyId}>
                  {facultyId}
                </option>
              ))}
            </Select>
          </Flex>
        </FormControl>
      </Box>

      {/* Faculty Details */}
      {selectedFacultyDetails && (
        <Box>
          <Heading as="h2" size="md" mb={4} textAlign="center">
            Course Distribution of: {selectedFaculty}
          </Heading>

          {/* Donut Chart */}
          <Box mb={6}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={facultyDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {facultyDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Faculty Summary */}
          <Box mb={6}>
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Metric</Th>
                  <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td textAlign="center">Total Courses</Td>
                  <Td textAlign="center">{selectedFacultyDetails.total_courses}</Td>
                </Tr>
                <Tr>
                  <Td textAlign="center">Theory Courses</Td>
                  <Td textAlign="center">{selectedFacultyDetails.theory.total}</Td>
                </Tr>
                <Tr>
                  <Td textAlign="center">Lab Courses</Td>
                  <Td textAlign="center">{selectedFacultyDetails.labs.total}</Td>
                </Tr>
                <Tr>
                  <Td textAlign="center">Theory Full Matches</Td>
                  <Td textAlign="center">{selectedFacultyDetails.theory.full_matches}</Td>
                </Tr>
                <Tr>
                  <Td textAlign="center">Lab Full Matches</Td>
                  <Td textAlign="center">{selectedFacultyDetails.labs.full_matches}</Td>
                </Tr>
                <Tr>
                  <Td textAlign="center">Lab Partial Matches</Td>
                  <Td textAlign="center">{selectedFacultyDetails.labs.partial_matches}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>

          {/* Theory Issues */}
          {selectedFacultyDetails.theory.issues.length > 0 && (
            <Box mb={6}>
              <Heading as="h3" size="md" mb={4} textAlign="center" marginTop="40px">
                Theory Issues
              </Heading>
              <Table variant="striped">
                <Thead>
                  <Tr>
                    <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Course</Th>
                    <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Day</Th>
                    <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Time</Th>
                    <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedFacultyDetails.theory.issues.map((issue, index) => (
                    <Tr key={index}>
                      <Td textAlign="center">{issue.course}</Td>
                      <Td textAlign="center">{issue.day}</Td>
                      <Td textAlign="center">{issue.time}</Td>
                      <Td textAlign="center">
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
              <Heading as="h3" size="md" mb={4} textAlign="center" marginTop="40px">
                Lab Issues
              </Heading>
              <Table variant="striped">
                <Thead>
                  <Tr>
                    <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Course</Th>
                    <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Day</Th>
                    <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Time</Th>
                    <Th backgroundColor="rgb(214, 235, 217)" textAlign="center">Type</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedFacultyDetails.labs.issues.map((issue, index) => (
                    <Tr key={index}>
                      <Td textAlign="center">{issue.course}</Td>
                      <Td textAlign="center">{issue.day}</Td>
                      <Td textAlign="center">{issue.time}</Td>
                      <Td textAlign="center">
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