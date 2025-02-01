/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import TeacherSidebar from "../home/sidebars/TeacherSidebar";

const TeacherRoutine = () => {
  const [schedule, setSchedule] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  // const [selectedCourseType , setSelectedCourseType] = useState("")
  // const [availableRooms, setAvailableRooms] = useState([]);
  const [availableTimeSlot, setAvailableTimeSlot] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = {
    default: [
      "8:00-9:15",
      "9:15-10:30",
      "10:30-11:45",
      "11:45-1:00",
      "2:30-3:45",
      "3:45-5:00",
    ],
    Wednesday: ["8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00"],
  };
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  let availableTimeSlotsSet = new Set();
  let allTimeSlots = new Set();
  let occupiedTimeSlots = new Set();
  for (let i = 1; i <= 30; i++) {
    allTimeSlots.add(i);
  }

  let allRooms = new Set([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "301",
    "302",
    "304",
    "204",
    "104",
    "105",
  ]);
  let avRooms = new Set([...allRooms]);

  let availableRoomsMap = new Map();

  const timeMapping = {
    1: "8:00-9:15",
    2: "9:15-10:30",
    3: "10:30-11:45",
    4: "11:45-1:00",
    5: "2:30-3:45",
    6: "3:45-5:00",
  };

  const dayMapping = {
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
    6: "Sunday",
  };

  const revTimeMapping = {
    "8:00-9:15": 1,
    "8:00-10:30": 1,
    "9:15-10:30": 2,
    "10:30-1:00": 3,
    "10:30-11:45": 3,
    "11:45-1:00": 4,
    "2:30-3:45": 5,
    "2:30-5:00": 5,
    "3:45-5:00": 6,
  };

  const revDayMapping = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
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
      console.log(`Teacher Name: ${teacherName}`);
      const coursesCollectionRef = collection(teacherDocRef, "courses");

      const coursesSnapshot = await getDocs(coursesCollectionRef);
      // console.log(`Courses Snapshot: ${coursesSnapshot}`);

      coursesSnapshot.forEach((doc) => {
        const courseData = doc.data();
        console.log(courseData);
        const classCancelledStatus = courseData["class_cancelled_status"];
        const tempClasses = courseData["assigned_temp_time_slots"];
        console.log("Testing");
        console.log(classCancelledStatus);
        // const assignedRooms = courseData["assigned_room"];
        classCancelledStatus.forEach((stat, index) => {
          // console.log(`Stat: ${stat}`);
          if (String(stat) === "1") {
            console.log(`Class at index ${index} is cancelled`);
            if (tempClasses.length > 0) {
              console.log("There are temporary classes");
            }
            // console.log(`Stat: ${stat}`);
          } else {
            console.log(`Class at index ${index} is not cancelled`);
            // console.log(courseData["assigned_room"][index]); 0
            const totalSlotsPerDay = Object.keys(timeMapping).length;
            const timeSlot = courseData["assigned_time_slots"][index];
            const dayIndex = Math.floor((timeSlot - 1) / totalSlotsPerDay);
            var courseType = "theory";
            const timeIndex = ((timeSlot - 1) % totalSlotsPerDay) + 1;
            const startTime = timeMapping[timeIndex].split("-")[0]; // "8:00"
            var endTime = timeMapping[timeIndex].split("-")[1];
            if (courseData["course_type"] === "lab") {
              courseType = "lab";
              endTime = timeMapping[timeIndex + 1].split("-")[1]; // "10:30"
            } else {
              courseType = "theory";
            }
            teacherSchedule.push({
              courseCode: doc.id,
              courseTitle: courseData["assigned_course_title"],
              day: dayMapping[dayIndex],
              time: `${startTime}-${endTime}`,
              room: courseData["assigned_room"][index],
            });
          }
        });
        if (!(tempClasses && tempClasses.length === 0)) {
          tempClasses.forEach((tempTimeSlot, index) => {
            if (tempTimeSlot !== "") {
              // console.log(courseData["assigned_temp_room"][index]);
              const totalSlotsPerDay = Object.keys(timeMapping).length;
              const timeSlot = tempTimeSlot;
              console.log(`timeslot: ${timeSlot}`);
              const dayIndex = Math.floor((timeSlot - 1) / totalSlotsPerDay);
              var courseType = "theory";
              const timeIndex = ((timeSlot - 1) % totalSlotsPerDay) + 1;
              console.log(`timeslot: ${timeIndex}`);
              const startTime = timeMapping[timeIndex].split("-")[0]; // "8:00"
              var endTime = timeMapping[timeIndex].split("-")[1];
              if (courseData["course_type"][index] === "lab") {
                courseType = "lab";
                endTime = timeMapping[timeIndex + 1].split("-")[1]; // "10:30"
              } else {
                courseType = "theory";
              }
              teacherSchedule.push({
                courseCode: doc.id,
                courseTitle: courseData["assigned-course-title"],
                day: dayMapping[dayIndex],
                time: `${startTime}-${endTime}`,
                room: courseData["assigned_temp_room"][index],
              });
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

  const fetchAvailableTimeSlots = async (day, time) => {
    let sem = selectedCourse
      .toString()
      .charAt(selectedCourse.toString().length - 3);
    let _semester = "semester_" + sem;
    setSemester(_semester);
    const timeSlotRef = collection(db, _semester);
    const timeSlotsSnapshot = await getDocs(timeSlotRef);
    timeSlotsSnapshot.forEach((doc) => {
      const timeSlotData = doc.data();
      const timeSlotID = Number(doc.id);
      //   console.log(typeof timeSlotData["class_cancelled"]);
      if (timeSlotData["class_cancelled"] === 1) {
        // console.log(timeSlotID);
        // console.log(timeSlotData["class_cancelled"]);

        if (timeSlotData["temp_course_code"] === "") {
          availableTimeSlotsSet.add(timeSlotID);
          // console.log("Time Slot Added")
          // console.log(availableTimeSlots[availableTimeSlots.length-1]);
        } else {
          occupiedTimeSlots.add(timeSlotID);
        }
      } else {
        occupiedTimeSlots.add(timeSlotID);
      }
    });
    allTimeSlots.forEach((item) => {
      if (!occupiedTimeSlots.has(item)) {
        availableTimeSlotsSet.add(item);
      }
    });
    console.log(availableTimeSlotsSet);
    availableTimeSlotsSet.forEach((it) => {
      fetchAvailableRooms(it);
      // console.log(it);
    });
    setAvailableTimeSlots(availableTimeSlotsSet);
    console.log("");
    console.log("");
    console.log("");
  };

  // Fetch available rooms for the selected day and time
  const fetchAvailableRooms = async (timeSlot) => {
    let roomID = "";
    const roomsRef = collection(db, `time_slots/${timeSlot}/rooms`);
    const roomsSnapshot = await getDocs(roomsRef);
    roomsSnapshot.forEach((doc) => {
      const roomData = doc.data();
      roomID = doc.id.toString();
      // console.log(roomID);
      if (
        roomData["class_cancelled"] === 1 &&
        roomData["temp_course_code"] === ""
      ) {
        console.log(
          `Room ${doc.id} has both perm_course_code and temp_course_code empty.`
        );
        // availableRooms.set(roomID,timeSlot);
        // availableRooms[timeSlot].add(roomID);
        addValueToKey(availableRoomsMap, timeSlot, roomID);
        console.log(timeSlot, roomID);
      }
      avRooms.delete(roomID);
    });

    avRooms.forEach((roomID) => {
      // availableRooms[timeSlot].add(roomID);
      // console.log(timeSlot,roomID);

      addValueToKey(availableRoomsMap, timeSlot, roomID);
      // console.log(roomID);
    });

    avRooms = new Set([...allRooms]);

    setAvailableRooms(availableRoomsMap);
  };

  async function handleTimeSlotClick(timeslot) {
    setSelectedRescheduleTime(timeslot);
  }
  function addValueToKey(map, key, value) {
    if (!map.has(key)) {
      map.set(key, new Set());
    }
    map.get(key).add(value);
  }

  // Handle Cancel Class
  const handleCancelClass = async (courseId, day, time) => {
    let selectedCourseType = "";
    let rooms = [];
    let room = "";
    let timeSlot = 0;
    try {
      const courseRef = doc(
        db,
        `teachers/${teacherName}/courses`,
        courseId.toString()
      );
      // const courseRef = doc(db, "teachers", teacherName, "courses", courseId.toString());
      console.log(`Course Ref ${courseRef}`);
      const courseSnapshot = await getDoc(courseRef);
      console.log(`Course Snap ${courseSnapshot}`);
      const courseData = courseSnapshot.data();
      console.log(`Course Data ${courseData}`);

      selectedCourseType = courseData["course_type"];
      console.log(`Course Type: ${selectedCourseType}`);

      console.log(`${courseData.id}`);

      console.log(`Day: ${day}`);
      console.log(`Day: ${revDayMapping[day]}`);
      console.log(`Time: ${time}`);
      console.log(`Time: ${revTimeMapping[time]}`);
      timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
      console.log(`Time Slot: ${timeSlot}`);
      console.log(`Course Type: ${selectedCourseType}`);
      const classCancelledStatus = courseData["class_cancelled_status"];
      console.log(`${classCancelledStatus[0]}`);
      rooms = courseData["assigned_room"];
      //   const classTimes = courseData["assigned_time_slots"];

      //   classTimes.forEach((tSlot , index) =>{

      //   console.log(`Tslot: ${tSlot}`);
      //   console.log(`Time slot: ${timeSlot}`);
      //     if(tSlot=== timeSlot){
      //         room = rooms[index];
      //     }
      //   })

      classCancelledStatus.forEach((stat, idx) => {
        if (courseData["assigned_time_slots"][idx] === timeSlot) {
          classCancelledStatus[idx] = 1;
          room = rooms[idx];
          console.log(`Room: ${room}`);
          console.log(
            `Cancelled Course Timeslot ${courseData["class_cancelled_status"][idx]}`
          );
        }
      });
      await updateDoc(courseRef, {
        class_cancelled_status: classCancelledStatus,
      });
    } catch (error) {
      console.error("Error canceling class:", error);
      alert("Failed to cancel class.");
    }

    try {
      console.log(`Time Slot ${timeSlot}`);
      console.log(`room ${room}`);

      console.log(`Room Type: ${typeof room}`);
      console.log(`Constructed Path: time_slots/${timeSlot}/rooms/${room}`);

      const roomRef = doc(db, `time_slots/${timeSlot}/rooms`, room.toString());
      console.log(`room ref ${roomRef}`);
      const roomSnapshot = await getDoc(roomRef);
      const roomData = roomSnapshot.data();

      console.log(`room Data ${roomData}`);
      const classCancelledStatus = 1;
      console.log(`Cancelled Course Timeslot ${roomData["class_cancelled"]}`);
      await updateDoc(roomRef, {
        class_cancelled: classCancelledStatus,
      });
    } catch (error) {
      console.error("Error canceling class:", error);
      alert("Failed to cancel class.");
    }

    try {
      // Extract the semester from the courseId
      let sem = courseId.toString().charAt(courseId.toString().length - 3);
      const semester = "semester_" + sem;
      setSemester(semester); // Ensure setSemester is updating the state correctly
      console.log(semester);

      // Reference to the specific document for the time slot
      const timeSlotRef = doc(db, semester, timeSlot.toString());

      // Fetch the document data
      const timeSlotSnapshot = await getDoc(timeSlotRef);

      if (timeSlotSnapshot.exists()) {
        const timeSlotData = timeSlotSnapshot.data();
        console.log(`Time Slot Data:`, timeSlotData);

        // Check conditions and update the document
        const classCancelledStatus = 1;
        console.log(
          `Cancelled Course Timeslot: ${timeSlotData["class_cancelled"]}`
        );
        await updateDoc(timeSlotRef, {
          class_cancelled: classCancelledStatus,
        });

        console.log("Class cancelled status updated successfully.");
      } else {
        console.log("No document found with the specified timeslot.");
      }
    } catch (error) {
      console.error("Error canceling class:", error);
      alert("Failed to cancel class.");
    }

    if (selectedCourseType === "lab") {
      timeSlot++;
      try {
        console.log(`Time Slot ${timeSlot}`);
        console.log(`room ${room}`);

        console.log(`Room Type: ${typeof room}`);
        console.log(`Constructed Path: time_slots/${timeSlot}/rooms/${room}`);

        const roomRef = doc(
          db,
          `time_slots/${timeSlot}/rooms`,
          room.toString()
        );
        console.log(`room ref ${roomRef}`);
        const roomSnapshot = await getDoc(roomRef);
        const roomData = roomSnapshot.data();

        console.log(`room Data ${roomData}`);
        const classCancelledStatus = 1;
        console.log(`Cancelled Course Timeslot ${roomData["class_cancelled"]}`);
        await updateDoc(roomRef, {
          class_cancelled: classCancelledStatus,
        });
      } catch (error) {
        console.error("Error canceling class:", error);
        alert("Failed to cancel class.");
      }

      try {
        // Extract the semester from the courseId
        let sem = courseId.toString().charAt(courseId.toString().length - 3);
        const semester = "semester_" + sem;
        setSemester(semester); // Ensure setSemester is updating the state correctly
        console.log(semester);

        // Reference to the specific document for the time slot
        const timeSlotRef = doc(db, semester, timeSlot.toString());

        // Fetch the document data
        const timeSlotSnapshot = await getDoc(timeSlotRef);

        if (timeSlotSnapshot.exists()) {
          const timeSlotData = timeSlotSnapshot.data();
          console.log(`Time Slot Data:`, timeSlotData);

          // Check conditions and update the document
          const classCancelledStatus = 1;
          console.log(
            `Cancelled Course Timeslot: ${timeSlotData["class_cancelled"]}`
          );
          await updateDoc(timeSlotRef, {
            class_cancelled: classCancelledStatus,
          });

          console.log("Class cancelled status updated successfully.");
        } else {
          console.log("No document found with the specified timeslot.");
        }
      } catch (error) {
        console.error("Error canceling class:", error);
        alert("Failed to cancel class.");
      }
    }
  };

  // Handle Reschedule Class
  const handleRescheduleClass = async (course, day, time) => {
    setSelectedCourse(course);
    setSelectedDay(day);
    setSelectedTime(time);
    console.log(`Selected Day: ${selectedDay}`);
    console.log(`Selected Time: ${selectedTime}`);
    await fetchAvailableTimeSlots();
    setShowRescheduleModal(true);
  };

  const confirmReschedule = async () => {
    console.log(`Selected Room: ${selectedRoom}`);
    console.log(`Selected  Reschedule Time: ${selectedRescheduleTime}`);
    console.log(`Selected Course: ${selectedCourse}`);
    const selectedCourseType =
      parseInt(selectedCourse.slice(-1)) % 2 === 0 ? "lab" : "theory";
    console.log(`Selected Course Type: ${selectedCourseType}`);
    console.log(`Semester: ${semester}`);
    // console.log(`${typeof(semester)}`);
    if (selectedCourseType === "lab") {
      console.log("Lab Rescheduling Unavailable");
    } else {
      handleCancelClass(selectedCourse, selectedDay, selectedTime);

      const timeSlotDocRef = doc(db, `${semester}/${selectedRescheduleTime}`);
      const totalSlotsPerDay = Object.keys(timeMapping).length;
      const dayIndex = Math.floor(
        (selectedRescheduleTime - 1) / totalSlotsPerDay
      );
      const timeIndex = ((selectedRescheduleTime - 1) % totalSlotsPerDay) + 1;
      const startTime = timeMapping[timeIndex].split("-")[0];
      var endTime = timeMapping[timeIndex].split("-")[1];
      var day = dayMapping[dayIndex];
      const time = `${startTime}-${endTime}`;
      console.log(`Day: ${day}`);
      console.log(`Time: ${time}`);

      try {
        const docSnap = await getDoc(timeSlotDocRef);
        if (docSnap.exists()) {
          // If the document exists, update it
          await updateDoc(timeSlotDocRef, {
            class_cancelled: 1,
            temp_course_code: selectedCourse,
            temp_course_type: selectedCourseType,
            temp_room: selectedRoom,
            temp_teacher_1: teacherName,
            temp_day: day,
            temp_time_1: time,
          });
          console.log("Update successful in Semester");
        } else {
          // If the document does not exist, create it
          await setDoc(timeSlotDocRef, {
            class_cancelled: 1,
            temp_course_code: selectedCourse,
            temp_course_type: selectedCourseType,
            temp_room: selectedRoom,
            temp_teacher_1: teacherName,
            temp_day: day,
            temp_time_1: time,
          });
          console.log("Document created in Semester");
        }
      } catch (error) {
        console.error("Error updating/creating semester doc:", error);
      }
      try {
        const courseRef = doc(
          db,
          `teachers/${teacherName}/courses`,
          selectedCourse.toString()
        );
        // const courseRef = doc(db, "teachers", teacherName, "courses", courseId.toString());
        console.log(`Course Ref ${courseRef}`);
        const courseSnapshot = await getDoc(courseRef);
        const courseData = courseSnapshot.data();
        if (courseSnapshot.exists()) {
          const permanentTimeSlots = courseData.assigned_time_slots || [];
          let classCancelledStatus = courseData.class_cancelled_status || [];
          console.log(permanentTimeSlots);

          permanentTimeSlots.forEach((timeSlot, index) => {
            console.log(`time: ${timeSlot}`);
            console.log(`time type: ${typeof timeSlot}`);
            console.log(`selected time: ${selectedTime}`);
            console.log(`selected time type: ${typeof selectedTime}`);
            console.log(classCancelledStatus);

            const totalSlotsPerDay = Object.keys(timeMapping).length;

            const timeIndex = ((timeSlot - 1) % totalSlotsPerDay) + 1;
            const time = timeMapping[timeIndex];

            if (time === selectedTime) {
              console.log(`Class at index ${index} and ${time} is cancelled`);

              //   Ensure classCancelledStatus has the same length
              //   if (classCancelledStatus.length <= index) {
              //     classCancelledStatus = [
              //       ...classCancelledStatus,
              //       ...new Array(index - classCancelledStatus.length + 1).fill(0),
              //     ];
              //   }

              // Mark the class as cancelled
              classCancelledStatus[index] = 1;
              console.log(classCancelledStatus);
            }
          });

          // const assignedRooms = courseData["assigned_room"];

          // If the document exists, update it
          await updateDoc(courseRef, {
            class_cancelled_status: classCancelledStatus,
            assigned_temp_time_slots: arrayUnion(selectedRescheduleTime),
            assigned_temp_room: arrayUnion(selectedRoom),
          });
          console.log("Update successful in teacher courses");
        }
      } catch (error) {
        console.error("Error updating/creating teacher doc:", error);
      }
    }
  };

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
        {schedule.map((slot, index) => (
          <tr key={`${slot.courseCode}-${slot.day}-${slot.time}-${index}`}>
            {/* Combined courseCode, day, time, and index for a unique key */}
            <td>{slot.courseCode}</td>
            <td>{slot.day}</td>
            <td>{slot.room}</td>
            <td>{slot.time}</td>
            <td>
              <button
                onClick={() =>
                  handleCancelClass(slot.courseCode, slot.day, slot.time)
                }
              >
                Cancel Class
              </button>
              <button
                onClick={() =>
                  handleRescheduleClass(slot.courseCode, slot.day, slot.time)
                }
              >
                Reschedule
              </button>
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

              {/* Select Time Slot */}
              <h3>Select a Time Slot:</h3>
              <select onChange={(e) => handleTimeSlotClick(e.target.value)}>
                <option value="" disabled selected>
                  -- Select a time slot --
                </option>
                {[...availableTimeSlots].map((timeslot) => (
                  <option key={timeslot} value={timeslot}>
                    {timeslot}
                  </option>
                ))}
              </select>

              {/* Display Available Rooms */}
              <h4>Available Rooms</h4>
              {selectedRescheduleTime ? (
                availableRooms.get(Number(selectedRescheduleTime))?.size > 0 ? (
                  <select onChange={(e) => setSelectedRoom(e.target.value)}>
                    <option value="" disabled selected>
                      -- Select a room --
                    </option>
                    {Array.from(
                      availableRooms.get(Number(selectedRescheduleTime))
                    ).map((room) => (
                      <option key={room} value={room}>
                        Room {room}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p>No rooms available for the selected time slot.</p>
                )
              ) : (
                <p>Please select a time slot to see available rooms.</p>
              )}
              <button
                onClick={() => confirmReschedule()}
                style={{ marginTop: "10px" }}
              >
                Confirm
              </button>
              {/* Close Modal */}
              <button
                onClick={() => setShowRescheduleModal(false)}
                style={{ marginTop: "10px" }}
              >
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
