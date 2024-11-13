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

    const timeMapping = {
        1: "8:00-9:15",
        2: "9:15-10:30",
        3: "10:30-11:45",
        4: "11:45-1:00",
        5: "2:30-3:45",
        6: "3:45-5:00"
    };

    const dayMapping = {
        0: "Monday",
        1: "Tuesday",
        2: "Wednesday",
        3: "Thursday",
        4: "Friday",
        5: "Saturday",
        6: "Sunday"
    };

    const revTimeMapping = {
        "8:00-9:15": 1,
        "8:00-10:30": 1,
        "9:15-10:30": 2,
        "10:30-1:00":3,
        "10:30-11:45": 3,
        "11:45-1:00": 4,
        "2:30-3:45": 5,
        "2:30-5:00": 5,
        "3:45-5:00": 6
    };

    const revDayMapping = {
        "Monday": 0,
        "Tuesday": 1,
        "Wednesday": 2,
        "Thursday": 3,
        "Friday": 4,
        "Saturday": 5,
        "Sunday": 6
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
                console.log(courseData);
                const classCancelledStatus = courseData["class_cancelled_status"];
                const tempClasses = courseData["assigned_temp_time_slots"];
                console.log("Testing");
                console.log(classCancelledStatus);
                // const assignedRooms = courseData["assigned_room"];
                classCancelledStatus.forEach((stat, index) => {
                    if (String(stat) === "1") {
                        // console.log(`Class at index ${index} is cancelled`);
                        console.log(`Stat: ${stat}`);

                    }
                    else {
                        console.log(`Class at index ${index} is not cancelled`);
                        console.log(courseData["assigned_room"][index]); 0
                        const totalSlotsPerDay = Object.keys(timeMapping).length;
                        const timeSlot = courseData["assigned_time_slots"][index]
                        const dayIndex = Math.floor((timeSlot - 1) / totalSlotsPerDay);
                        var courseType = "theory";
                        const timeIndex = (timeSlot - 1) % totalSlotsPerDay + 1;
                        const startTime = timeMapping[timeIndex].split("-")[0]; // "8:00"
                        var endTime = timeMapping[timeIndex].split("-")[1];
                        if (courseData["course_type"] === "lab") {
                            courseType = "lab";
                            endTime = timeMapping[timeIndex + 1].split("-")[1];   // "10:30"
                        }
                        else {
                            courseType = "theory";
                        }
                        teacherSchedule.push({

                            courseCode: doc.id,
                            courseTitle: courseData["assigned_course_title"],
                            day: dayMapping[dayIndex],
                            time: `${startTime}-${endTime}`,
                            room: courseData["assigned_room"][index]

                        })
                    }
                });
                if (!(tempClasses && tempClasses.length === 0)) {
                    tempClasses.forEach((tempTimeSlot, index) => {
                        if (tempTimeSlot !== "") {
                            console.log(courseData["assigned_temp_room"][index]);
                            const totalSlotsPerDay = Object.keys(timeMapping).length;
                            const timeSlot = tempTimeSlot;
                            const dayIndex = Math.floor((timeSlot - 1) / totalSlotsPerDay);
                            var courseType = "theory";
                            const timeIndex = (timeSlot - 1) % totalSlotsPerDay + 1;
                            const startTime = timeMapping[timeIndex].split("-")[0]; // "8:00"
                            var endTime = timeMapping[timeIndex].split("-")[1];
                            if (courseData["course_type"][index] === "lab") {
                                courseType = "lab";
                                endTime = timeMapping[timeIndex + 1].split("-")[1];   // "10:30"
                            }
                            else {
                                courseType = "theory";
                            }
                            teacherSchedule.push({

                                courseCode: doc.id,
                                courseTitle: courseData["assigned-course-title"],
                                day: dayMapping[dayIndex],
                                time: `${startTime}-${endTime}`,
                                room: courseData["assigned_temp_room"][index]

                            })
                        }



                    });
                }

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
    const handleCancelClass = async (courseId, day, time) => {

        try {
            
            const courseRef = doc(db, "teachers", teacherName, "courses", courseId);
            console.log(`Course Ref ${courseRef}`);
            const courseSnapshot = await getDoc(courseRef);
            console.log(`Course Snap ${courseSnapshot}`);
            
            const courseData = courseSnapshot.data(); 
            console.log(`Course Data ${courseData}`);
            
            


            console.log(`${courseData.id}`);
            const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
            console.log(`Day: ${day}`);
            console.log(`Day: ${revDayMapping[day]}`)
            console.log(`Time: ${time}`);
            console.log(`Time: ${revTimeMapping[time]}`)
            console.log(`Time Slot: ${timeSlot}`);
            const classCancelledStatus = courseData["class_cancelled_status"];
            console.log(`${classCancelledStatus[0]}`);
            

            classCancelledStatus.forEach((stat, idx) => {
                if (courseData["assigned_time_slots"][idx] === timeSlot) {
                    classCancelledStatus[idx] = 1;
                    console.log(`Cancelled Course Timeslot ${courseData["class_cancelled_status"][idx]}`);
                }

            });
            await updateDoc(courseRef,{
                class_cancelled_status:classCancelledStatus,
            });


        } catch (error) {
            console.error("Error canceling class:", error);
            alert("Failed to cancel class.");
        }
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
                    <tr key={slot.courseCode}> {/* Using courseCode as a unique key */}
                        <td>{slot.courseCode}</td>
                        <td>{slot.day}</td>
                        <td>{slot.room}</td>
                        <td>{slot.time}</td>
                        <td>
                            <button onClick={() => handleCancelClass(slot.courseCode, slot.day, slot.time)}>Cancel Class</button>
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
