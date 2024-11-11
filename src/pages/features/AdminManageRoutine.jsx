import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminManageRoutine = () => {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/courses");
        const coursesData = response.data.courses;

        setCourses(coursesData);

        // Group courses by semester
        const groupedBySemester = {};
        coursesData.forEach((course) => {
          if (!groupedBySemester[course.semester]) {
            groupedBySemester[course.semester] = [];
          }
          groupedBySemester[course.semester].push(course);
        });
        setSemesters(groupedBySemester);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Error fetching courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  
  // Add Course
  const addCourse = async (newCourse) => {
    const data = {
      semester: newCourse.semester,
      name: newCourse.name,
      credit: newCourse.credit,
      teacher: newCourse.teacher,
      teacherType: newCourse.teacherType,
      ...(newCourse.teacherType === "Part-Time" && {
        day1: newCourse.day1,
        time1: newCourse.time1,
        day2: newCourse.day2,
        time2: newCourse.time2,
        room: newCourse.room,
      }),
    };

    try {
      await axios.post("http://localhost:5000/api/save", data);
      setSuccessMessage("Course added successfully!");

      // Update states
      setCourses((prevCourses) => [...prevCourses, newCourse]);
      setSemesters((prevSemesters) => {
        const updatedSemesters = { ...prevSemesters };
        if (!updatedSemesters[newCourse.semester]) {
          updatedSemesters[newCourse.semester] = [];
        }
        updatedSemesters[newCourse.semester].push(newCourse);
        return updatedSemesters;
      });
    } catch (error) {
      console.error("Error saving course data:", error);
      setError("Error saving course data. Please try again.");
    }
  };

  // Delete Course
  const deleteCourse = async (semester, courseName, teacher) => {
    try {
      await axios.delete("http://localhost:5000/api/delete", {
        data: { semester, name: courseName, teacher },
      });
      setSuccessMessage("Course deleted successfully!");

      // Update states
      setCourses((prevCourses) =>
        prevCourses.filter(
          (course) =>
            !(
              course.semester === semester &&
              course.name === courseName &&
              course.teacher === teacher
            )
        )
      );
      setSemesters((prevSemesters) => {
        const updatedSemesters = { ...prevSemesters };
        updatedSemesters[semester] = updatedSemesters[semester].filter(
          (course) =>
            !(course.name === courseName && course.teacher === teacher)
        );
        return updatedSemesters;
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      setError("Error deleting course. Please try again.");
    }
  };

  // Update Teacher
  const updateTeacher = async (updatedData, clearForm) => {
    try {
      const response = await axios.put("http://localhost:5000/api/update", updatedData);
      setSuccessMessage(response.data.message);
  
      // Update courses state
      const updatedCourses = courses.map((course) =>
        course.semester === updatedData.semester && course.name === updatedData.name
          ? { ...course, teacher: updatedData.teacher }
          : course
      );
      setCourses(updatedCourses);
  
      // Regenerate semesters state based on updated courses
      const updatedSemesters = {};
      updatedCourses.forEach((course) => {
        if (!updatedSemesters[course.semester]) {
          updatedSemesters[course.semester] = [];
        }
        updatedSemesters[course.semester].push(course);
      });
      setSemesters(updatedSemesters);
  
      clearForm(); // Clear the form fields
    } catch (error) {
      console.error("Error updating teacher:", error);
      setError("Failed to update teacher.");
    }
  };

  // Filter courses to remove duplicates
  const filterUniqueCourses = (courses) => {
    const uniqueCourses = [];
    const courseNames = new Set();

    courses.forEach((course) => {
      if (!courseNames.has(course.name)) {
        courseNames.add(course.name);
        uniqueCourses.push(course);
      }
    });

    return uniqueCourses;
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
      <button onClick={() => setSearchTerm("")}>Clear Search</button>

      {/* Update Teacher Form */}
      <UpdateTeacherForm updateTeacher={updateTeacher} />

      {/* Loading State */}
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <div className="semester-list">
          {Object.keys(semesters).map((semester) => (
            <div key={semester}>
              <h3
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const element = document.getElementById(semester);
                  if (element) {
                    element.style.display =
                      element.style.display === "none" ? "block" : "none";
                  }
                }}
              >
                {semester}
              </h3>
              <div id={semester} style={{ display: "none", marginLeft: "20px" }}>
                {filterUniqueCourses(
                  semesters[semester].filter((course) =>
                    course.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                ).map((course) => (
                  <div key={`${course.name}-${course.teacher}`}>
                    <p>
                      {course.name} - {course.credit} credits - {course.teacher}{" "}
                      <button
                        onClick={() =>
                          deleteCourse(course.semester, course.name, course.teacher)
                        }
                      >
                        Delete
                      </button>
                    </p>
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

// AddCourseForm Component
const AddCourseForm = ({ addCourse }) => {
  const [semester, setSemester] = useState("");
  const [course, setCourse] = useState("");
  const [credit, setCredit] = useState("");
  const [teacher, setTeacher] = useState("");
  const [teacherType, setTeacherType] = useState("Full-Time");
  const [room, setRoom] = useState("");
  const [day1, setDay1] = useState("");
  const [time1, setTime1] = useState("");
  const [day2, setDay2] = useState("");
  const [time2, setTime2] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!semester || !course || !credit || !teacher) {
      alert("All fields are required!");
      return;
    }

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
      ...(teacherType === "Part-Time" && { day1, time1, day2, time2, room }),
    };

    addCourse(newCourse);

    // Reset form fields
    setSemester("");
    setCourse("");
    setCredit("");
    setTeacher("");
    setTeacherType("Full-Time");
    setRoom("");
    setDay1("");
    setTime1("");
    setDay2("");
    setTime2("");
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
        placeholder="Course Name"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Credits"
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
      <select
        value={teacherType}
        onChange={(e) => setTeacherType(e.target.value)}
      >
        <option value="Full-Time">Full-Time</option>
        <option value="Part-Time">Part-Time</option>
      </select>

      {teacherType === "Part-Time" && (
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

// UpdateTeacherForm Component
const UpdateTeacherForm = ({ updateTeacher }) => {
  const [semester, setSemester] = useState("");
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [teacherType, setTeacherType] = useState("Full-Time");

  const clearForm = () => {
    setSemester("");
    setName("");
    setTeacher("");
    setTeacherType("Full-Time");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!semester || !name || !teacher) {
      alert("All fields are required!");
      return;
    }

    updateTeacher({ semester, name, teacher, teacherType }, clearForm);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Update Teacher</h4>
      <input
        type="text"
        placeholder="Semester"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Course Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="New Teacher Name"
        value={teacher}
        onChange={(e) => setTeacher(e.target.value)}
        required
      />
      <select
        value={teacherType}
        onChange={(e) => setTeacherType(e.target.value)}
      >
        <option value="Full-Time">Full-Time</option>
        <option value="Part-Time">Part-Time</option>
      </select>
      <button type="submit">Update Teacher</button>
    </form>
  );
};

export default AdminManageRoutine;
