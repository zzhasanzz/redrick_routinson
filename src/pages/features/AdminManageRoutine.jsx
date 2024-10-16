import React, { useState } from 'react';

// Sample Data
const initialCourses = [
  { id: 1, name: 'CSE 4514', semester: 5, teachers: [{ name: 'Dr. Smith', type: 'Full-Time' }] },
  { id: 2, name: 'EEE 3412', semester: 4, teachers: [{ name: 'Ms. Johnson', type: 'Part-Time', timeslot: '10 AM - 12 PM' }] },
];

// AdminManageRoutine Component
const AdminManageRoutine = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Search Courses
  const filteredCourses = courses.filter(course => course.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Select Course
  const selectCourse = (course) => {
    setSelectedCourse(selectedCourse?.id === course.id ? null : course); // Toggle course details
  };

  // Update Course (for modifying teachers)
  const updateCourse = (updatedCourse) => {
    setCourses(courses.map(course => (course.id === updatedCourse.id ? updatedCourse : course)));
    setSelectedCourse(updatedCourse); // Update selected course details as well
  };

  // Add Teacher
  const addTeacher = (newTeacher) => {
    const updatedCourse = {
      ...selectedCourse,
      teachers: [...selectedCourse.teachers, newTeacher]
    };
    updateCourse(updatedCourse);
  };

  // Remove Teacher
  const removeTeacher = (teacherName) => {
    const updatedCourse = {
      ...selectedCourse,
      teachers: selectedCourse.teachers.filter(teacher => teacher.name !== teacherName)
    };
    updateCourse(updatedCourse);
  };

  return (
    <div className="admin-routine">
      <h2>Manage Courses</h2>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search courses"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* List of Courses */}
      <div className="course-list">
        {filteredCourses.map(course => (
          <div key={course.id} onClick={() => selectCourse(course)} style={{ cursor: 'pointer', margin: '10px 0' }}>
            <h3>{course.name}</h3>
          </div>
        ))}
      </div>

      {/* Course Details & Teacher Management */}
      {selectedCourse && (
        <div className="course-details">
          <h3>Course: {selectedCourse.name}</h3>
          <p>Semester: {selectedCourse.semester}</p>
          <h4>Assigned Teachers:</h4>
          <ul>
            {selectedCourse.teachers.map(teacher => (
              <li key={teacher.name}>
                {teacher.name} ({teacher.type}{teacher.timeslot ? `, Timeslot: ${teacher.timeslot}` : ''})
                <button onClick={() => removeTeacher(teacher.name)}>Remove</button>
                <button onClick={() => editTeacher(teacher.name)}>Edit</button>
              </li>
            ))}
          </ul>

          {/* Add New Teacher */}
          <AddTeacherForm addTeacher={addTeacher} />
        </div>
      )}
    </div>
  );
};

// Form to Add New Teacher
const AddTeacherForm = ({ addTeacher }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Full-Time');
  const [timeslot, setTimeslot] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTeacher = { name, type, ...(type === 'Part-Time' && { timeslot }) };
    addTeacher(newTeacher);
    setName('');
    setType('Full-Time');
    setTimeslot('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Add New Teacher</h4>
      <input type="text" placeholder="Teacher Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="Full-Time">Full-Time</option>
        <option value="Part-Time">Part-Time</option>
      </select>
      {type === 'Part-Time' && (
        <input
          type="text"
          placeholder="Timeslot"
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
          required
        />
      )}
      <button type="submit">Add Teacher</button>
    </form>
  );
};

// Edit Teacher Form (Optional)
const EditTeacherForm = ({ teacher, updateTeacher, removeTeacher }) => {
  const [name, setName] = useState(teacher.name);
  const [type, setType] = useState(teacher.type);
  const [timeslot, setTimeslot] = useState(teacher.timeslot || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedTeacher = { name, type, ...(type === 'Part-Time' && { timeslot }) };
    updateTeacher(updatedTeacher);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Edit Teacher: {teacher.name}</h4>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="Full-Time">Full-Time</option>
        <option value="Part-Time">Part-Time</option>
      </select>
      {type === 'Part-Time' && (
        <input
          type="text"
          placeholder="Timeslot"
          value={timeslot}
          onChange={(e) => setTimeslot(e.target.value)}
        />
      )}
      <button type="submit">Update Teacher</button>
      <button type="button" onClick={() => removeTeacher(teacher.name)}>Remove Teacher</button>
    </form>
  );
};

export default AdminManageRoutine;
