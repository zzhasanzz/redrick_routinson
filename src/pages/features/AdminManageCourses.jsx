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

const AdminManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unassignedCourses, setUnassignedCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentSemester, setCurrentSemester] = useState(null);
  const [updatingCourse, setUpdatingCourse] = useState(null);
  const [selectedUpdateFaculty, setSelectedUpdateFaculty] = useState('');
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchCourses();
    fetchFacultyList();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/offered-courses?t=${Date.now()}`);
      if (!response.ok) throw new Error('Failed to fetch courses');
  
      const data = await response.json();
      if (!data?.semesters) throw new Error('Invalid data structure');
  
      // Create a map of all semesters (1 to 8)
      const allSemesters = Array.from({ length: 8 }, (_, i) => i + 1).map(semester => ({
        semester,
        courses: [],
      }));
  
      // Merge the fetched data into the allSemesters array
      data.semesters.forEach(sem => {
        const index = allSemesters.findIndex(s => s.semester === sem.semester);
        if (index !== -1) {
          allSemesters[index].courses = (sem.courses || []).filter(c => c.assigned);
        }
      });
  
      setCourses(allSemesters);
      if (allSemesters.length > 0) setCurrentSemester(allSemesters[0].semester);
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
      console.log(`Fetching unassigned courses for semester: ${semester}`);
      const response = await fetch(`http://localhost:5000/api/unassigned-courses/${semester}`);
      
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch unassigned courses');
      }
  
      const data = await response.json();
      console.log('Unassigned courses data:', data);
      setUnassignedCourses(data);
    } catch (err) {
      console.error('Error fetching unassigned courses:', err);
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
        body: JSON.stringify({ semester, course: courseCode, updateOfferedCourses: true }),
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

  const handleUpdateFaculty = async () => {
    try {
      if (!updatingCourse || !selectedUpdateFaculty) {
        throw new Error('Please select a faculty');
      }

      const response = await fetch('http://localhost:5000/api/update-faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester: updatingCourse.semester, // Now properly structured
          course: updatingCourse.course,
          teacher: selectedUpdateFaculty
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update faculty');

      toast({
        title: 'Updated!',
        description: `Faculty updated for ${updatingCourse.course}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onUpdateClose();
      await fetchCourses(); // Refresh the data
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSelectedUpdateFaculty('');
      setUpdatingCourse(null);
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
                <Box overflowX="auto" minWidth="800px">
                  <Table variant="striped" colorScheme="gray">
                    <Thead>
                      <Tr>
                        <Th width="20%" textAlign="center">Course Code</Th>
                        <Th width="35%" textAlign="center">Course Name</Th>
                        <Th width="15%" textAlign="center">Credits</Th>
                        <Th width="20%" textAlign="center">Faculty</Th>
                        <Th width="10%" textAlign="center">Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {semester.courses.map(course => (
                        <Tr key={course.course}>
                          <Td padding="2" fontWeight="600" textAlign="center">{course.course}</Td>
                          <Td padding="2" textAlign="center">{course.course_name}</Td>
                          <Td padding="2" textAlign="center">{course.credit}</Td>
                          <Td padding="2" textAlign="center">{course.teacher}</Td>
                          <Td padding="2" textAlign="center">
                            <Button
                              color="rgb(253, 253, 253)"
                              backgroundColor="rgba(132, 113, 113, 0.69)"
                              borderColor="rgba(132, 113, 113, 0.79)"
                              _hover={{
                                bg: "rgba(132, 113, 113, 0.43)",
                                transition: "background 0.33s ease-in-out",
                              }}
                              size="sm"
                              onClick={() => handleDeleteCourse(semester.semester, course.course)}
                              isLoading={loading} // Add loading state
                            >
                              Delete
                            </Button>
                            <Button
                              color="rgb(253, 253, 253)"
                              backgroundColor="rgba(113, 123, 132, 0.69)"
                              borderColor="rgba(113, 118, 132, 0.79)"
                              _hover={{
                                bg: "rgba(113, 114, 132, 0.43)",
                                transition: "background 0.33s ease-in-out",
                              }}
                              onClick={() => {
                                setUpdatingCourse({
                                  ...course,
                                  semester: semester.semester // Add semester context
                                });
                                setSelectedUpdateFaculty(course.teacher || '');
                                onUpdateOpen();
                              }}
                            >
                              Update
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                <Button
                  mt={4}
                  color="rgb(46, 114, 128)"
                  backgroundColor="rgba(46, 114, 128, 0.16)"
                  _hover={{
                    bg: "rgba(113, 119, 132, 0.48)",
                    transition: "background 0.33s ease-in-out",
                  }}
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
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
        <ModalContent>
          <ModalHeader>Update Faculty for {updatingCourse?.course}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Select New Faculty</FormLabel>
              <Select
                placeholder="Select faculty"
                value={selectedUpdateFaculty}
                onChange={e => setSelectedUpdateFaculty(e.target.value)}
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
            <Button colorScheme="blue" onClick={handleUpdateFaculty}>
              Update
            </Button>
            <Button ml={3} onClick={onUpdateClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminManageCourses;