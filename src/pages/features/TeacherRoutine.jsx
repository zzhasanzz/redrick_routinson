import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";
import TeacherSidebar from "../home/sidebars/TeacherSidebar";

const TeacherRoutine = () => {
    const [schedule, setSchedule] = useState([]);
    const [teacherName, setTeacherName] = useState("");
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const times = {
        default: ["8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00", "2:30-3:45", "3:45-5:00"],
        Wednesday: ["8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00"],
    };

    // Fetch teacher name using the logged-in user's email
    useEffect(() => {
        const fetchTeacherName = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const email = currentUser.email;
                const teacherRef = doc(db, "users", email);
                const teacherSnap = await getDoc(teacherRef);

                if (teacherSnap.exists()) {
                    setTeacherName(teacherSnap.data().name);
                }
            }
        };

        fetchTeacherName();
    }, []);

    // Fetch schedule from Firestore
    useEffect(() => {
        const fetchSchedule = async () => {
            const teacherSchedule = [];
            const teacherDocRef = doc(db, "teachers", teacherName.toString());
            const coursesCollectionRef = collection(teacherDocRef, "courses");
            const coursesSnapshot = await getDocs(coursesCollectionRef);

            coursesSnapshot.forEach((doc) => {
                const courseData = doc.data();
                teacherSchedule.push({
                    id: doc.id,
                    courseCode: doc.id,
                    courseTitle: courseData["assigned-course-title"],
                    day: courseData.day,
                    room: courseData["assigned-room"],
                    time: `${courseData["time-1"]} - ${courseData["time-2"]}`,
                });
            });

            setSchedule(teacherSchedule);
        };

        if (teacherName) {
            fetchSchedule();
        }
    }, [teacherName]);

    // Fetch available rooms for the selected day and time
    const fetchAvailableRooms = async (day, time) => {
        const allRooms = ["101", "102", "103", "104", "105"]; // Example rooms
        const unavailableRooms = []; // Collect unavailable rooms based on Firestore data

        const coursesSnapshot = await getDocs(collection(db, "courses"));
        coursesSnapshot.forEach((doc) => {
            const courseData = doc.data();
            if (courseData.day === day && courseData["time-1"] === time) {
                unavailableRooms.push(courseData["assigned-room"]);
            }
        });

        const freeRooms = allRooms.filter((room) => !unavailableRooms.includes(room));
        setAvailableRooms(freeRooms);
    };

    // Handle Cancel Class
    const handleCancelClass = async (courseId) => {
        // try {
        //     const teacherDocRef = doc(db, "teachers", teacherName.toString());
        //     const courseDocRef = doc(collection(teacherDocRef, "courses"), courseId);
        //     await deleteDoc(courseDocRef); // Delete the course document
        //     setSchedule((prev) => prev.filter((course) => course.id !== courseId));
        //     alert("Class canceled successfully.");
        // } catch (error) {
        //     console.error("Error canceling class:", error);
        //     alert("Failed to cancel class.");
        // }
    };

    // Handle Reschedule Class
    const handleRescheduleClass = (course) => {
        setSelectedCourse(course);
        setShowRescheduleModal(true);
    };

    // Confirm reschedule
    const confirmReschedule = async (room) => {
        try {
            const teacherDocRef = doc(db, "teachers", teacherName.toString());
            const courseDocRef = doc(collection(teacherDocRef, "courses"), selectedCourse.id);

            await updateDoc(courseDocRef, {
                day: selectedDay,
                "time-1": selectedTime.split(" - ")[0],
                "time-2": selectedTime.split(" - ")[1],
                "assigned-room": room,
            });

            // Update the state to reflect the changes
            setSchedule((prevSchedule) =>
                prevSchedule.map((course) =>
                    course.id === selectedCourse.id
                        ? { ...course, day: selectedDay, time: selectedTime, room }
                        : course
                )
            );

            alert("Class rescheduled successfully!");
            setShowRescheduleModal(false);
        } catch (error) {
            console.error("Error rescheduling class:", error);
            alert("Failed to reschedule class.");
        }
    };

    // Render the table
    const renderTable = () => (
        <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
                <tr>
                    <th>Course</th>
                    <th>Day</th>
                    <th>Room</th>
                    <th>Time</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {schedule.map((slot) => (
                    <tr key={slot.id}>
                        <td>{slot.courseCode}</td>
                        <td>{slot.day}</td>
                        <td>{slot.room}</td>
                        <td>{slot.time}</td>
                        <td>
                            <button onClick={() => handleCancelClass(slot.id)}>Cancel Class</button>
                            <button onClick={() => handleRescheduleClass(slot)}>Reschedule</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div style={{ padding: "10px 100px 0px 50px" }}>
            <TeacherSidebar />
            <div>
                <h2>Teacher Routine</h2>
                {schedule.length > 0 ? renderTable() : <p>Loading schedule...</p>}

                {showRescheduleModal && (
                    <div className="modal" style={modalStyle}>
                        <div className="modal-content" style={modalContentStyle}>
                            <h3>Reschedule Class</h3>
                            <label>
                                Select Day:
                                <select
                                    value={selectedDay}
                                    onChange={(e) => {
                                        setSelectedDay(e.target.value);
                                        setAvailableRooms([]); // Reset available rooms
                                    }}
                                >
                                    <option value="">-- Select Day --</option>
                                    {days.map((day) => (
                                        <option key={day} value={day}>
                                            {day}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <br />
                            <label>
                                Select Time:
                                <select
                                    value={selectedTime}
                                    onChange={(e) => {
                                        setSelectedTime(e.target.value);
                                        fetchAvailableRooms(selectedDay, e.target.value);
                                    }}
                                    disabled={!selectedDay}
                                >
                                    <option value="">-- Select Time --</option>
                                    {(selectedDay === "Wednesday" ? times.Wednesday : times.default).map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <br />
                            <h4>Available Rooms</h4>
                            {availableRooms.length > 0 ? (
                                availableRooms.map((room) => (
                                    <button
                                        key={room}
                                        onClick={() => confirmReschedule(room)}
                                        style={{ margin: "5px" }}
                                    >
                                        Room {room}
                                    </button>
                                ))
                            ) : (
                                <p>No rooms available or select a time.</p>
                            )}
                            <button onClick={() => setShowRescheduleModal(false)} style={{ marginTop: "10px" }}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Styling for modal
const modalStyle = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const modalContentStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "100%",
};

export default TeacherRoutine;
