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
  Button,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
} from '@chakra-ui/react';

const AdminManageRoutine = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unassignedCourses, setUnassignedCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentSemester, setCurrentSemester] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchCourses();
    fetchFacultyList();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/offered-courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      
      const data = await response.json();
      if (!data?.semesters) throw new Error('Invalid data structure');

      const processed = data.semesters
        .map(sem => ({
          semester: sem.semester,
          courses: (sem.courses || []).filter(c => c.assigned)
        }))
        .filter(sem => sem.courses.length > 0);

      setCourses(processed);
      if (processed.length > 0) setCurrentSemester(processed[0].semester);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchFacultyList = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/faculty-ranks');
      if (!response.ok) throw new Error('Failed to fetch faculty');
      
      const data = await response.json();
      setFacultyList(Object.keys(data));
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchUnassignedCourses = async (semester) => {
    try {
      const response = await fetch(`http://localhost:5000/api/unassigned-courses/${semester}`);
      if (!response.ok) throw new Error('Failed to fetch unassigned courses');
      
      const data = await response.json();
      setUnassignedCourses(data);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteCourse = async (semester, courseCode) => {
    try {
      const response = await fetch('http://localhost:5000/api/delete-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester, course: courseCode }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete course');

      toast({
        title: 'Deleted!',
        description: `Course ${courseCode} removed`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      await fetchCourses();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddCourse = async () => {
    try {
      if (!currentSemester || !selectedCourse || !selectedFaculty) {
        throw new Error('Please select both course and faculty');
      }

      const response = await fetch('http://localhost:5000/api/add-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester: currentSemester,
          course: selectedCourse,
          teacher: selectedFaculty,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add course');

      toast({
        title: 'Added!',
        description: `Course ${selectedCourse} added`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setSelectedCourse('');
      setSelectedFaculty('');
      onClose();
      await fetchCourses();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6} fontSize="2xl">Assigned Courses Schedule</Heading>

      {loading ? (
        <Skeleton height="400px" borderRadius="md" />
      ) : courses.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No assigned courses found
        </Alert>
      ) : (
        <Tabs
          variant="enclosed"
          index={courses.findIndex(sem => sem.semester === currentSemester)}
          onChange={index => setCurrentSemester(courses[index]?.semester)}
        >
          <TabList>
            {courses.map(semester => (
              <Tab key={semester.semester} fontSize="lg">
                Semester {semester.semester}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {courses.map(semester => (
              <TabPanel key={semester.semester}>
                <Box overflowX="auto">
                  <Table variant="striped" colorScheme="gray">
                    <Thead>
                      <Tr>
                        <Th>Course Code</Th>
                        <Th>Course Name</Th>
                        <Th>Credits</Th>
                        <Th>Faculty</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {semester.courses.map(course => (
                        <Tr key={course.course}>
                          <Td fontWeight="600">{course.course}</Td>
                          <Td>{course.course_name}</Td>
                          <Td>{course.credit}</Td>
                          <Td>{course.teacher}</Td>
                          <Td>
                            <Button
                              colorScheme="red"
                              size="sm"
                              onClick={() => handleDeleteCourse(semester.semester, course.course)}
                            >
                              Delete
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                <Button
                  mt={4}
                  colorScheme="blue"
                  onClick={() => {
                    fetchUnassignedCourses(semester.semester);
                    onOpen();
                  }}
                >
                  Add Course
                </Button>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Add Course to Semester {currentSemester}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Course</FormLabel>
              <Select
                placeholder="Select course"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
              >
                {unassignedCourses.map(course => (
                  <option key={course.course} value={course.course}>
                    {course.course} - {course.course_name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mt={4} isRequired>
              <FormLabel>Faculty</FormLabel>
              <Select
                placeholder="Select faculty"
                value={selectedFaculty}
                onChange={e => setSelectedFaculty(e.target.value)}
              >
                {facultyList.map(faculty => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddCourse}>
              Add Course
            </Button>
            <Button ml={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminManageRoutine;
