import React, { useState, useEffect } from 'react';
import axios from 'axios';

// AdminManageRoutine Component
const AdminManageRoutine = () => {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch courses from the backend on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true); // Indicate loading has started
      try {
        const response = await axios.get('http://localhost:5000/api/courses');
        const coursesData = response.data.courses; // Make sure this matches your API response
  
        setCourses(coursesData);
  
        // Group courses by semester
        const groupedBySemester = {};
        coursesData.forEach(course => {
          if (!groupedBySemester[course.semester]) {
            groupedBySemester[course.semester] = [];
          }
          groupedBySemester[course.semester].push(course);
        });
        setSemesters(groupedBySemester);
      } catch (error) {
        console.error('Error fetching courses:', error); // Log error
        setError('Error fetching courses. Please try again later.');
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };
  
    fetchCourses();
  }, []);
  
  // Add Course function
  const addCourse = async (newCourse) => {
    // Prepare data for the backend
    const data = {
      semester: newCourse.semester,
      name: newCourse.name,
      credit: newCourse.credit,
      teacher: newCourse.teacher,
      teacherType: newCourse.teacherType,
      ...(newCourse.teacherType === 'Part-Time' && {
        day1: newCourse.day1,
        time1: newCourse.time1,
        day2: newCourse.day2,
        time2: newCourse.time2,
        room: newCourse.room,
      }),
    };

    try {
      const response = await axios.post('http://localhost:5000/api/save', data);
      console.log(response.data.message); // Handle success message
      setSuccessMessage('Course added successfully!'); // Set success message
      // Update the courses state with the newly added course
      setCourses(prevCourses => [...prevCourses, newCourse]);

      // Update the semesters state to include the new course
      setSemesters(prevSemesters => {
        const updatedSemesters = { ...prevSemesters };
        if (!updatedSemesters[newCourse.semester]) {
          updatedSemesters[newCourse.semester] = [];
        }
        updatedSemesters[newCourse.semester].push(newCourse);
        return updatedSemesters;
      });

    } catch (error) {
      setError('Error saving course data. Please try again.');
      console.error('Error saving course data:', error);
    }
  };

  return (
    <div className="admin-routine">
      <h2>Manage Courses</h2>

      {/* Error and Success Messages */}
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search courses"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={() => setSearchTerm('')}>Clear Search</button>

      {/* Loading State */}
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="semester-list">
          {Object.keys(semesters).map(semester => (
            <div key={semester}>
              <h3 style={{ cursor: 'pointer' }} onClick={() => {
                const element = document.getElementById(semester);
                if (element) {
                  element.style.display = element.style.display === 'none' ? 'block' : 'none';
                }
              }}>
                {semester}
              </h3>
              <div id={semester} style={{ display: 'none', marginLeft: '20px' }}>
                {semesters[semester].filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase())).map(course => (
                  <div key={`${course.name}-${course.teacher}`}>
                    <p>{course.name} - {course.credit} credits - {course.teacher}</p>
                    {course.teacherType === 'Part-Time' && (
                      <p>Room: {course.room}, Day 1: {course.day1}, Time 1: {course.time1}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Course Form */}
      <AddCourseForm addCourse={addCourse} />
    </div>
  );
};

// Form to Add New Course and Teacher
const AddCourseForm = ({ addCourse }) => {
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [credit, setCredit] = useState('');
  const [teacher, setTeacher] = useState('');
  const [teacherType, setTeacherType] = useState('Full-Time');
  const [room, setRoom] = useState('');
  const [day1, setDay1] = useState('');
  const [time1, setTime1] = useState('');
  const [day2, setDay2] = useState('');
  const [time2, setTime2] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!semester || !course || !credit || !teacher) {
      alert("All fields are required!");
      return;
    }

    // Ensure credit is a number
    if (isNaN(credit)) {
      alert("Credits must be a number.");
      return;
    }

    const newCourse = {
      semester,
      name: course,
      credit,
      teacher,
      teacherType,
      ...(teacherType === 'Part-Time' && { day1, time1, day2, time2, room })
    };

    addCourse(newCourse);

    // Reset form after submission
    setSemester('');
    setCourse('');
    setCredit('');
    setTeacher('');
    setTeacherType('Full-Time');
    setRoom('');
    setDay1('');
    setTime1('');
    setDay2('');
    setTime2('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Add New Course</h4>
      <input
        type="text"
        placeholder="Semester"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Course"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Credit"
        value={credit}
        onChange={(e) => setCredit(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Teacher Name"
        value={teacher}
        onChange={(e) => setTeacher(e.target.value)}
        required
      />
      <select value={teacherType} onChange={(e) => setTeacherType(e.target.value)}>
        <option value="Full-Time">Full-Time</option>
        <option value="Part-Time">Part-Time</option>
      </select>

      {/* Additional fields for Part-Time teachers */}
      {teacherType === 'Part-Time' && (
        <>
          <input
            type="text"
            placeholder="Room Number"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Day 1"
            value={day1}
            onChange={(e) => setDay1(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Time 1"
            value={time1}
            onChange={(e) => setTime1(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Day 2"
            value={day2}
            onChange={(e) => setDay2(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Time 2"
            value={time2}
            onChange={(e) => setTime2(e.target.value)}
            required
          />
        </>
      )}
      <button type="submit">Add Course</button>
    </form>
  );
};

export default AdminManageRoutine;
