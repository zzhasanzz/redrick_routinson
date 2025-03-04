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

const AdminManageLabs = () => {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [unassignedLabs, setUnassignedLabs] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [selectedLab, setSelectedLab] = useState('');
    const [selectedTeacher1A, setSelectedTeacher1A] = useState('');
    const [selectedTeacher2A, setSelectedTeacher2A] = useState('');
    const [selectedTeacher1B, setSelectedTeacher1B] = useState('');
    const [selectedTeacher2B, setSelectedTeacher2B] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [currentSemester, setCurrentSemester] = useState(1);
    const [updatingLab, setUpdatingLab] = useState(null);
    const [selectedUpdateTeacher1, setSelectedUpdateTeacher1] = useState('');
    const [selectedUpdateTeacher2, setSelectedUpdateTeacher2] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        fetchLabs();
        fetchFacultyList();
    }, []);

    const fetchLabs = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/offered-labs?t=${Date.now()}`);
            if (!response.ok) throw new Error('Failed to fetch labs');

            const data = await response.json();
            console.log("API Response:", data); // Debugging line
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
                    // Filter out labs with assigned: false
                    allSemesters[index].courses = sem.courses.filter(course => course.assigned);
                }
            });

            console.log("Processed Labs:", allSemesters); // Debugging line
            setLabs(allSemesters);
            if (allSemesters.length > 0 && !currentSemester) {
                setCurrentSemester(allSemesters[0].semester);
            }
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

    const fetchUnassignedLabs = async (semester) => {
        try {
            const response = await fetch(`http://localhost:5000/api/unassigned-labs/${semester}`);
            if (!response.ok) throw new Error('Failed to fetch unassigned labs');

            const data = await response.json();
            setUnassignedLabs(data);
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

    const handleDeleteLab = async (semester, courseCode) => {
        try {
            const requestBody = { semester, course: courseCode };
            console.log("Delete Lab Request Body:", requestBody); // Debugging line

            const response = await fetch('http://localhost:5000/api/delete-lab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to delete lab');

            // Update the state directly
            setLabs(prevLabs => {
                const updatedLabs = prevLabs.map(sem => {
                    if (sem.semester === semester) {
                        return {
                            ...sem,
                            courses: sem.courses.filter(course => course.course !== courseCode),
                        };
                    }
                    return sem;
                });
                console.log("Updated Labs State:", updatedLabs); // Debugging line
                return updatedLabs;
            });


            toast({
                title: 'Deleted!',
                description: `Lab ${courseCode} removed`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
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

    const handleUpdateLab = async () => {
        try {
            if (!updatingLab || !selectedSection || !selectedUpdateTeacher1 || !selectedUpdateTeacher2) {
                throw new Error('Please select section and both teachers');
            }

            const response = await fetch('http://localhost:5000/api/update-lab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: updatingLab.semester,
                    section: selectedSection,
                    course: updatingLab.course,
                    teacher1: selectedUpdateTeacher1,
                    teacher2: selectedUpdateTeacher2,
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to update lab');

            toast({
                title: 'Updated!',
                description: `Lab ${updatingLab.course} updated for Section ${selectedSection}`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onUpdateClose();
            await fetchLabs(); // Refresh the labs list
        } catch (err) {
            toast({
                title: 'Update Failed',
                description: err.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSelectedSection('');
            setSelectedUpdateTeacher1('');
            setSelectedUpdateTeacher2('');
            setUpdatingLab(null);
        }
    };

    const handleAddLab = async () => {
        try {
            if (
                !currentSemester ||
                !selectedLab ||
                !selectedTeacher1A ||
                !selectedTeacher2A ||
                !selectedTeacher1B ||
                !selectedTeacher2B
            ) {
                throw new Error('Please select lab and teachers for both sections');
            }

            const response = await fetch('http://localhost:5000/api/add-lab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semester: currentSemester,
                    course: selectedLab,
                    sectionA: {
                        teacher1: selectedTeacher1A,
                        teacher2: selectedTeacher2A,
                    },
                    sectionB: {
                        teacher1: selectedTeacher1B,
                        teacher2: selectedTeacher2B,
                    },
                }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to add lab');

            toast({
                title: 'Added!',
                description: `Lab ${selectedLab} added to both sections`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Reset form fields
            setSelectedLab('');
            setSelectedTeacher1A('');
            setSelectedTeacher2A('');
            setSelectedTeacher1B('');
            setSelectedTeacher2B('');
            onClose();
            await fetchLabs(); // Refresh the labs list
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
            <Heading mb={6} fontSize="2xl">Assigned Labs Schedule</Heading>

            {loading ? (
                <Skeleton height="400px" borderRadius="md" />
            ) : labs.length === 0 ? (
                <Alert status="info">
                    <AlertIcon />
                    No assigned labs found
                </Alert>
            ) : (
                <Tabs
                    variant="enclosed"
                    index={labs.findIndex(sem => sem.semester === currentSemester)}
                    onChange={index => setCurrentSemester(labs[index]?.semester)}
                >
                    <TabList>
                        {labs.map(semester => (
                            <Tab key={semester.semester} fontSize="lg">
                                Semester {semester.semester}
                            </Tab>
                        ))}
                    </TabList>

                    <TabPanels>
                        {labs.map(semester => {
                            console.log("Semester:", semester); // Debugging line
                            return (
                                <TabPanel key={semester.semester}>
                                    <Box mb={6}>
                                        <Heading fontSize="xl" mb={4}>Semester {semester.semester}</Heading>
                                        <Box overflowX="auto" minWidth="800px">
                                            <Table variant="striped" colorScheme="gray">
                                                <Thead>
                                                    <Tr>
                                                        <Th width="20%" textAlign="center">Lab Code</Th>
                                                        <Th width="25%" textAlign="center">Lab Name</Th>
                                                        <Th width="15%" textAlign="center">Credits</Th>
                                                        <Th width="20%" textAlign="center">Teachers A</Th>
                                                        <Th width="20%" textAlign="center">Teachers B</Th>
                                                        <Th width="10%" textAlign="center">Actions</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    {semester.courses.map(lab => {
                                                        console.log("Lab:", lab); // Debugging line
                                                        return (
                                                            <Tr key={lab.course}>
                                                                <Td padding="2" fontWeight="600" textAlign="center">{lab.course}</Td>
                                                                <Td padding="2" textAlign="center">{lab.course_name}</Td>
                                                                <Td padding="2" textAlign="center">{lab.credit}</Td>
                                                                <Td padding="2" textAlign="center">
                                                                    {lab.sectionA?.teacher1}, {lab.sectionA?.teacher2}
                                                                </Td>
                                                                <Td padding="2" textAlign="center">
                                                                    {lab.sectionB?.teacher1}, {lab.sectionB?.teacher2}
                                                                </Td>
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
                                                                        onClick={() => handleDeleteLab(semester.semester, lab.course)}
                                                                        isLoading={loading}
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
                                                                            setUpdatingLab({
                                                                                ...lab,
                                                                                semester: semester.semester,
                                                                            });
                                                                            setSelectedUpdateTeacher1(lab.sectionA?.teacher1 || '');
                                                                            setSelectedUpdateTeacher2(lab.sectionA?.teacher2 || '');
                                                                            onUpdateOpen();
                                                                        }}
                                                                    >
                                                                        Update
                                                                    </Button>
                                                                </Td>
                                                            </Tr>
                                                        );
                                                    })}
                                                </Tbody>
                                            </Table>
                                        </Box>
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
                                            fetchUnassignedLabs(semester.semester);
                                            onOpen();
                                        }}
                                    >
                                        Add Lab
                                    </Button>
                                </TabPanel>
                            );
                        })}
                    </TabPanels>
                </Tabs>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Add Lab to Semester {currentSemester}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Lab</FormLabel>
                            <Select
                                placeholder="Select lab"
                                value={selectedLab}
                                onChange={e => setSelectedLab(e.target.value)}
                            >
                                {unassignedLabs.map(lab => (
                                    <option key={lab.course} value={lab.course}>
                                        {lab.course} - {lab.course_name}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Section A Teachers */}
                        <Heading fontSize="md" mt={4}>Section A Teachers</Heading>
                        <FormControl mt={2} isRequired>
                            <FormLabel>Teacher 1 (Sec A)</FormLabel>
                            <Select
                                placeholder="Select teacher 1"
                                value={selectedTeacher1A}
                                onChange={e => setSelectedTeacher1A(e.target.value)}
                            >
                                {facultyList.map(faculty => (
                                    <option key={faculty} value={faculty}>
                                        {faculty}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl mt={4} isRequired>
                            <FormLabel>Teacher 2 (Sec A)</FormLabel>
                            <Select
                                placeholder="Select teacher 2"
                                value={selectedTeacher2A}
                                onChange={e => setSelectedTeacher2A(e.target.value)}
                            >
                                {facultyList.map(faculty => (
                                    <option key={faculty} value={faculty}>
                                        {faculty}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Section B Teachers */}
                        <Heading fontSize="md" mt={4}>Section B Teachers</Heading>
                        <FormControl mt={2} isRequired>
                            <FormLabel>Teacher 1 (Sec B)</FormLabel>
                            <Select
                                placeholder="Select teacher 1"
                                value={selectedTeacher1B}
                                onChange={e => setSelectedTeacher1B(e.target.value)}
                            >
                                {facultyList.map(faculty => (
                                    <option key={faculty} value={faculty}>
                                        {faculty}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl mt={4} isRequired>
                            <FormLabel>Teacher 2 (Sec B)</FormLabel>
                            <Select
                                placeholder="Select teacher 2"
                                value={selectedTeacher2B}
                                onChange={e => setSelectedTeacher2B(e.target.value)}
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
                        <Button colorScheme="blue" onClick={handleAddLab}>
                            Add Lab
                        </Button>
                        <Button ml={3} onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
                <ModalContent>
                    <ModalHeader>Update Lab {updatingLab?.course}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl isRequired>
                            <FormLabel>Section</FormLabel>
                            <Select
                                placeholder="Select section"
                                value={selectedSection}
                                onChange={e => setSelectedSection(e.target.value)}
                            >
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                            </Select>
                        </FormControl>

                        <FormControl mt={4} isRequired>
                            <FormLabel>Teacher 1</FormLabel>
                            <Select
                                placeholder="Select teacher 1"
                                value={selectedUpdateTeacher1}
                                onChange={e => setSelectedUpdateTeacher1(e.target.value)}
                            >
                                {facultyList.map(faculty => (
                                    <option key={faculty} value={faculty}>
                                        {faculty}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl mt={4} isRequired>
                            <FormLabel>Teacher 2</FormLabel>
                            <Select
                                placeholder="Select teacher 2"
                                value={selectedUpdateTeacher2}
                                onChange={e => setSelectedUpdateTeacher2(e.target.value)}
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
                        <Button colorScheme="blue" onClick={handleUpdateLab}>
                            Update
                        </Button>
                        <Button ml={3} onClick={onUpdateClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default AdminManageLabs;