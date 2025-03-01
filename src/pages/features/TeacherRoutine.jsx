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
  addDoc,
  setDoc,
  arrayUnion,
  onSnapshot,
  where,
  query,
} from "firebase/firestore";
import TeacherSidebar from "../home/sidebars/TeacherSidebar";
import SemesterRoutineTable from "../../components/SemesterRoutineTable";

const TeacherRoutine = () => {
  const [schedule, setSchedule] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseType, setSelectedCourseType] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [semesterClasses, setSemesterClasses] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [showSwapRequestModal, setShowSwapRequestModal] = useState(false);
  const [targetClass, setTargetClass] = useState(null);
  const [showUnifiedRescheduleModal, setShowUnifiedRescheduleModal] =
    useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

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
  };

  const revTimeMapping = {
    "8:00-9:15": 1,
    "8:00-10:30": 1,
    "9:15-10:30": 2,
    "10:30-11:45": 3,
    "10:30-1:00": 3,
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

  // Move fetchSchedule outside of useEffect to make it reusable
  const fetchSchedule = async () => {
    const teacherSchedule = [];
    const teacherDocRef = doc(db, "teachers", teacherName.toString());
    const coursesCollectionRef = collection(teacherDocRef, "courses");
    const coursesSnapshot = await getDocs(coursesCollectionRef);

    coursesSnapshot.forEach((doc) => {
      const courseData = doc.data();
      const section = doc.id.slice(-1);
      const classCancelledStatus = courseData["class_cancelled_status"];
      const classRescheduledStatus = courseData["rescheduled_status"];
      const tempClasses = courseData["assigned_temp_time_slots"];

      classCancelledStatus.forEach((stat, index) => {
        const totalSlotsPerDay = Object.keys(timeMapping).length;
        const timeSlot = courseData["assigned_time_slots"][index];
        const dayIndex = Math.floor((timeSlot - 1) / totalSlotsPerDay);
        var courseType = "theory";
        const timeIndex = ((timeSlot - 1) % totalSlotsPerDay) + 1;
        const startTime = timeMapping[timeIndex].split("-")[0];
        var endTime = timeMapping[timeIndex].split("-")[1];
        if (courseData["course_type"] === "lab") {
          courseType = "lab";
          endTime = timeMapping[timeIndex + 1].split("-")[1];
        } else {
          courseType = "theory";
        }

        let classStatus = "Cancelled";
        if (String(stat) !== "1") {
          classStatus = "Active";
        } else if (String(classRescheduledStatus[index]) === "1") {
          classStatus = "Rescheduled";
        }

        teacherSchedule.push({
          courseCode: doc.id.substring(0, doc.id.length - 2),
          courseTitle: courseData["assigned_course_title"],
          day: dayMapping[dayIndex],
          time: `${startTime}-${endTime}`,
          section: section,
          room: courseData["assigned_room"][index],
          status: classStatus,
        });
      });

      if (!(tempClasses && tempClasses.length === 0)) {
        tempClasses.forEach((tempTimeSlot, index) => {
          if (tempTimeSlot !== "") {
            const totalSlotsPerDay = Object.keys(timeMapping).length;
            const timeSlot = tempTimeSlot;
            const dayIndex = Math.floor((timeSlot - 1) / totalSlotsPerDay);
            var courseType = "theory";
            const timeIndex = ((timeSlot - 1) % totalSlotsPerDay) + 1;
            const startTime = timeMapping[timeIndex].split("-")[0];
            var endTime = timeMapping[timeIndex].split("-")[1];
            if (courseData["course_type"] === "lab") {
              courseType = "lab";
              console.log("Course Type: ", courseType);
              endTime = timeMapping[timeIndex + 1].split("-")[1];
            } else {
              courseType = "theory";
            }
            console.log("Temporary Class Time: ", startTime, endTime);
            teacherSchedule.push({
              courseCode: doc.id.substring(0, doc.id.length - 2),
              courseTitle: courseData["assigned-course-title"],
              day: dayMapping[dayIndex],
              time: `${startTime}-${endTime}`,
              section: section,
              type: courseType,
              room: courseData["assigned_temp_room"][index],
              status: "Temporary",
            });
          }
        });
      }
    });
    setSchedule(teacherSchedule);
  };

  // Update the useEffect to use the new fetchSchedule function
  useEffect(() => {
    if (teacherName) {
      fetchSchedule();
    }
  }, [teacherName]);

  const fetchAvailableRooms = async (timeSlot) => {
    let roomID = "";
    const roomsRef = collection(db, `time_slots/${timeSlot}/rooms`);
    const roomsSnapshot = await getDocs(roomsRef);
    roomsSnapshot.forEach((doc) => {
      const roomData = doc.data();
      roomID = doc.id.toString();
      if (
        (roomData["class_cancelled"] === 1 || roomData["rescheduled"] === 1) &&
        roomData["temp_course_code"] === ""
      ) {
        addValueToKey(availableRoomsMap, timeSlot, roomID);
      }
      avRooms.delete(roomID);
    });
    avRooms.forEach((roomID) => {
      addValueToKey(availableRoomsMap, timeSlot, roomID);
    });
    avRooms = new Set([...allRooms]);
    setAvailableRooms(availableRoomsMap);
  };

  function addValueToKey(map, key, value) {
    if (!map.has(key)) {
      map.set(key, new Set());
    }
    map.get(key).add(value);
  }

  const handleCancelClass = async (courseId, day, time, section) => {
    let selectedCourseType = "";
    let rooms = [];
    let room = "";
    let timeSlot = 0;
    try {
      const courseRef = doc(
        db,
        `teachers/${teacherName}/courses`,
        courseId.toString() + "_" + section
      );
      const courseSnapshot = await getDoc(courseRef);
      const courseData = courseSnapshot.data();
      selectedCourseType = courseData["course_type"];
      const classCancelledStatus = courseData["class_cancelled_status"];
      console.log("Day: ", day);
      console.log("Time: ", time);
      timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
      console.log("Time Slot: ", timeSlot);
      rooms = courseData["assigned_room"];
      classCancelledStatus.forEach((stat, idx) => {
        if (courseData["assigned_time_slots"][idx] === timeSlot) {
          classCancelledStatus[idx] = 1;
          room = rooms[idx];
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
      console.log("Time Slot: ", timeSlot);
      const roomRef = doc(db, `time_slots/${timeSlot}/rooms`, room.toString());
      const roomSnapshot = await getDoc(roomRef);
      const roomData = roomSnapshot.data();
      const classCancelledStatus = 1;
      await updateDoc(roomRef, {
        class_cancelled: classCancelledStatus,
      });
    } catch (error) {
      console.error("Error canceling class:", error);
      alert("Failed to cancel class.");
    }

    try {
      let sem = courseId.toString().charAt(courseId.toString().length - 3);
      const semester = "semester_" + sem + "_" + section;
      const timeSlotRef = doc(db, semester, timeSlot.toString());
      const timeSlotSnapshot = await getDoc(timeSlotRef);
      if (timeSlotSnapshot.exists()) {
        const timeSlotData = timeSlotSnapshot.data();
        const classCancelledStatus = 1;
        await updateDoc(timeSlotRef, {
          class_cancelled: classCancelledStatus,
        });
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
        const roomRef = doc(
          db,
          `time_slots/${timeSlot}/rooms`,
          room.toString()
        );
        const roomSnapshot = await getDoc(roomRef);
        const roomData = roomSnapshot.data();
        const classCancelledStatus = 1;
        await updateDoc(roomRef, {
          class_cancelled: classCancelledStatus,
        });
      } catch (error) {
        console.error("Error canceling class:", error);
        alert("Failed to cancel class.");
      }

      try {
        let sem = courseId.toString().charAt(courseId.toString().length - 3);
        const semester = "semester_" + sem + "_" + section;
        const timeSlotRef = doc(db, semester, timeSlot.toString());
        const timeSlotSnapshot = await getDoc(timeSlotRef);
        if (timeSlotSnapshot.exists()) {
          const timeSlotData = timeSlotSnapshot.data();
          const classCancelledStatus = 1;
          await updateDoc(timeSlotRef, {
            class_cancelled: classCancelledStatus,
          });
        } else {
          console.log("No document found with the specified timeslot.");
        }
      } catch (error) {
        console.error("Error canceling class:", error);
        alert("Failed to cancel class.");
      }
    }
    await fetchSchedule(); // Refresh the schedule after cancellation
  };

  const confirmReschedule = async () => {
    try {
      console.log(`Selected Room: ${selectedRoom}`);
      console.log(`Selected Reschedule Time: ${selectedRescheduleTime}`);
      console.log(`Selected Course: ${selectedCourse}`);
      console.log(`Selected Section: ${selectedSection}`);
      console.log(`Selected Course Type: ${selectedCourseType}`);

      if (!selectedRoom || !selectedRescheduleTime) {
        alert("Please select both a room and a time slot for rescheduling.");
        return;
      }

      // Get semester number from course code
      let sem = selectedCourse
        .toString()
        .charAt(selectedCourse.toString().length - 3);
      const semesterCollection = `semester_${sem}_${selectedSection}`;

      // Calculate day and time information for the new timeslot
      const totalSlotsPerDay = Object.keys(timeMapping).length;
      const newDayIndex = Math.floor(
        (selectedRescheduleTime - 1) / totalSlotsPerDay
      );
      const newTimeIndex =
        ((selectedRescheduleTime - 1) % totalSlotsPerDay) + 1;
      const newDay = dayMapping[newDayIndex];
      const newStartTime = timeMapping[newTimeIndex].split("-")[0];
      const newEndTime = timeMapping[newTimeIndex].split("-")[1];
      const newTime = `${newStartTime}-${newEndTime}`;

      // First, cancel the original class
      await handleCancelClass(
        selectedCourse,
        selectedDay,
        selectedTime,
        selectedSection
      );
      console.log("Original class cancelled successfully");

      // Check if trying to reschedule on the same day

      // --- Update the semester collection ---
      const timeSlotDocRef = doc(
        db,
        semesterCollection,
        selectedRescheduleTime.toString()
      );

      // Create or update the semester document
      await setDoc(
        timeSlotDocRef,
        {
          class_cancelled: 0,
          rescheduled: 1,
          temp_course_code: selectedCourse,
          temp_course_type: selectedCourseType,
          temp_room: selectedRoom,
          temp_section: selectedSection,
          temp_time_1: newTime,
          temp_teacher_1: teacherName,
          temp_day: newDay,
          // Preserve permanent fields if any
          perm_course_code: "",
          perm_course_type: "",
          perm_room: "",
          perm_teacher_1: "",
          perm_teacher_2: "",
          perm_day: "",
          perm_time_1: "",
          perm_time_2: "",
        },
        { merge: true }
      );

      console.log(
        `Updated semester collection document at ${semesterCollection}/${selectedRescheduleTime}`
      );

      // --- Update the timeslots collection ---
      const roomRef = doc(
        db,
        `time_slots/${selectedRescheduleTime}/rooms`,
        selectedRoom
      );

      // Create or update the room document in timeslots
      await setDoc(
        roomRef,
        {
          class_cancelled: 0,
          rescheduled: 1,
          course_type: selectedCourseType,
          temp_course_code: selectedCourse,
          temp_teacher_1: teacherName,
          temp_section: selectedSection,
          perm_course_code: "",
          perm_teacher_1: "",
          perm_teacher_2: "",
        },
        { merge: true }
      );

      console.log(
        `Updated timeslot collection at time_slots/${selectedRescheduleTime}/rooms/${selectedRoom}`
      );

      // --- Update teacher's courses collection ---
      const courseRef = doc(
        db,
        `teachers/${teacherName}/courses`,
        `${selectedCourse}_${selectedSection}`
      );

      const courseSnapshot = await getDoc(courseRef);
      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.data();

        // Find the timeslot index that matches the cancelled class
        const originalTimeSlot =
          revDayMapping[selectedDay] * totalSlotsPerDay +
          revTimeMapping[selectedTime];
        let cancelledIndex = -1;

        const timeSlots = courseData.assigned_time_slots || [];
        timeSlots.forEach((slot, idx) => {
          if (Number(slot) === Number(originalTimeSlot)) {
            cancelledIndex = idx;
          }
        });

        // Update the teacher's course document
        await updateDoc(courseRef, {
          assigned_temp_time_slots: arrayUnion(
            selectedRescheduleTime.toString()
          ),
          assigned_temp_room: arrayUnion(selectedRoom),
        });

        console.log(
          `Updated teacher course document at teachers/${teacherName}/courses/${selectedCourse}_${selectedSection}`
        );
      } else {
        console.log(`Teacher course document doesn't exist, creating new one`);
        await setDoc(courseRef, {
          assigned_temp_time_slots: [selectedRescheduleTime.toString()],
          assigned_temp_room: [selectedRoom],
          course_type: selectedCourseType,
          class_cancelled_status: [1],
          rescheduled_status: [1],
          assigned_time_slots: [],
          assigned_room: [],
        });
      }

      // For lab courses, we need to handle two consecutive time slots
      if (selectedCourseType === "lab") {
        console.log("Rescheduling lab class, updating second time slot");
        const secondTimeSlot = Number(selectedRescheduleTime) + 1;
        console.log("Second time slot: ", secondTimeSlot);

        // Update second time slot in semester collection
        const secondTimeSlotRef = doc(
          db,
          semesterCollection,
          secondTimeSlot.toString()
        );
        const newTimeIndex2 = secondTimeSlot + 1;
        const newStartTime2 = timeMapping[newTimeIndex2].split("-")[0];
        const newEndTime2 = timeMapping[newTimeIndex2].split("-")[1];
        const newTime2 = `${newStartTime2}-${newEndTime2}`;
        console.log("New time 2: ", newTime2);
        await setDoc(
          secondTimeSlotRef,
          {
            class_cancelled: 0,
            rescheduled: 0,
            temp_course_code: selectedCourse,
            course_type: "lab",
            temp_room: selectedRoom,
            temp_section: selectedSection,
            temp_time_1: newTime2,
            temp_teacher_1: teacherName,
            temp_day: newDay,
          },
          { merge: true }
        );

        // Update second time slot in time_slots collection
        const secondRoomRef = doc(
          db,
          `time_slots/${secondTimeSlot}/rooms`,
          selectedRoom
        );
        await setDoc(
          secondRoomRef,
          {
            class_cancelled: 0,
            rescheduled: 0,
            course_type: "lab",
            temp_course_code: selectedCourse,
            temp_teacher_1: teacherName,
            temp_section: selectedSection,
          },
          { merge: true }
        );
      }

      // Refresh the schedule and close modal
      await fetchSchedule();
      setShowUnifiedRescheduleModal(false);
      alert("Class rescheduled successfully!");
    } catch (error) {
      console.error("Error in confirmReschedule:", error);
      alert(`Failed to reschedule class: ${error.message}`);
    }
  };

  const handleRescheduleClass = async (
    course,
    day,
    time,
    section,
    room,
    type
  ) => {
    setSelectedCourse(course);
    setSelectedDay(day);
    setSelectedTime(time);
    setSelectedSection(section);
    setSelectedRoom(room);
    setSelectedCourseType(type);

    let sem = course.toString().charAt(course.toString().length - 3);
    await fetchSemesterClasses(sem, section);
    setShowUnifiedRescheduleModal(true);
  };

  const handleUndoCancelledClass = async (courseId, day, time, section) => {
    let selectedCourseType = "";
    let rooms = [];
    let room = "";
    let timeSlot = 0;
    try {
      const courseRef = doc(
        db,
        `teachers/${teacherName}/courses`,
        courseId.toString() + "_" + section
      );
      const courseSnapshot = await getDoc(courseRef);
      const courseData = courseSnapshot.data();
      selectedCourseType = courseData["course_type"];
      const classCancelledStatus = courseData["class_cancelled_status"];
      timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
      rooms = courseData["assigned_room"];
      classCancelledStatus.forEach((stat, idx) => {
        if (courseData["assigned_time_slots"][idx] === timeSlot) {
          classCancelledStatus[idx] = 0;
          room = rooms[idx];
        }
      });
      await updateDoc(courseRef, {
        class_cancelled_status: classCancelledStatus,
      });

      const roomRef = doc(db, `time_slots/${timeSlot}/rooms`, room.toString());
      await updateDoc(roomRef, {
        class_cancelled: 0,
      });

      let sem = courseId.toString().charAt(courseId.toString().length - 3);
      const semester = "semester_" + sem + "_" + section;
      const timeSlotRef = doc(db, semester, timeSlot.toString());
      await updateDoc(timeSlotRef, {
        class_cancelled: 0,
      });

      if (selectedCourseType === "lab") {
        const nextTimeSlot = timeSlot + 1;
        const nextRoomRef = doc(
          db,
          `time_slots/${nextTimeSlot}/rooms`,
          room.toString()
        );
        await updateDoc(nextRoomRef, {
          class_cancelled: 0,
        });
        const nextTimeSlotRef = doc(db, semester, nextTimeSlot.toString());
        await updateDoc(nextTimeSlotRef, {
          class_cancelled: 0,
        });
      }
    } catch (error) {
      console.error("Error undoing cancelled class:", error);
      alert("Failed to undo cancelled class.");
    }
    await fetchSchedule(); // Refresh the schedule after undo
  };

  const handleCancelTemporaryClass = async (
    courseId,
    day,
    time,
    room,
    section
  ) => {
    console.log("Cancelling temporary class");
    console.log("Course ID: ", courseId);
    console.log("Day: ", day);
    console.log("Time: ", time);
    console.log("Room: ", room);
    console.log("Section: ", section);
    try {
      // Calculate timeslot
      const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];

      // Get course reference and data
      const courseRef = doc(
        db,
        `teachers/${teacherName}/courses`,
        `${courseId}_${section}`
      );
      const courseSnapshot = await getDoc(courseRef);
      const courseData = courseSnapshot.data();

      // Convert all timeslots to strings for consistent comparison
      let tempTimeSlots = (courseData.assigned_temp_time_slots || []).map(
        (slot) => String(slot)
      );
      let tempRooms = courseData.assigned_temp_room || [];

      // Find the index using string comparison
      const slotIndex = tempTimeSlots.indexOf(String(timeSlot));

      if (slotIndex > -1) {
        // Remove the specific timeslot and room

        tempTimeSlots = tempTimeSlots.filter((_, index) => index !== slotIndex);
        tempRooms = tempRooms.filter((_, index) => index !== slotIndex);

        // Update course document
        await updateDoc(courseRef, {
          assigned_temp_time_slots: tempTimeSlots,
          assigned_temp_room: tempRooms,
        });

        // Update semester document
        const sem = courseId.charAt(courseId.length - 3);
        const semester = `semester_${sem}_${section}`;
        const timeSlotRef = doc(db, semester, String(timeSlot));
        await updateDoc(timeSlotRef, {
          temp_course_code: "",
          temp_course_type: "",
          temp_room: "",
          temp_teacher_1: "",
          temp_day: "",
          temp_time_1: "",
          temp_section: "",
          rescheduled: 0,
          class_cancelled: 0,
        });

        // Update room document
        const roomRef = doc(db, `time_slots/${timeSlot}/rooms/${room}`);
        await updateDoc(roomRef, {
          temp_course_code: "",
          temp_course_type: "",
          temp_room: "",
          temp_teacher_1: "",
          temp_section: "",
          class_cancelled: 0,
        });

        // Refresh the schedule
        const updatedSchedule = schedule.filter(
          (slot) =>
            !(
              slot.courseCode === courseId &&
              slot.day === day &&
              slot.time === time &&
              slot.room === room &&
              slot.section === section &&
              slot.status === status
            )
        );
        setSchedule(updatedSchedule);
      }
    } catch (error) {
      console.error("Error canceling temporary class:", error);
      console.error("Error details:", error.message);
      alert("Failed to cancel temporary class.");
    }
    await fetchSchedule(); // Refresh the schedule after cancellation
  };

  const renderTable = () => (
    <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>Course</th>
          <th>Day</th>
          <th>Room</th>
          <th>Time</th>
          <th>Status</th>
          <th>Section</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((slot, index) => (
          <tr key={`${slot.courseCode}-${slot.day}-${slot.time}-${index}`}>
            <td>{slot.courseCode}</td>
            <td>{slot.day}</td>
            <td>{slot.room}</td>
            <td>{slot.time}</td>
            <td>{slot.status}</td>
            <td>{slot.section}</td>
            <td>
              {slot.status === "Temporary" ? (
                <button
                  onClick={() =>
                    handleCancelTemporaryClass(
                      slot.courseCode,
                      slot.day,
                      slot.time,
                      slot.room,
                      slot.section
                    )
                  }
                >
                  Cancel Temporary Class
                </button>
              ) : slot.status === "Cancelled" ? (
                <button
                  onClick={() =>
                    handleUndoCancelledClass(
                      slot.courseCode,
                      slot.day,
                      slot.time,
                      slot.section
                    )
                  }
                >
                  Undo Cancel
                </button>
              ) : (
                <button
                  onClick={() =>
                    handleCancelClass(
                      slot.courseCode,
                      slot.day,
                      slot.time,
                      slot.section
                    )
                  }
                >
                  Cancel Class
                </button>
              )}
              <button
                onClick={() =>
                  handleRescheduleClass(
                    slot.courseCode,
                    slot.day,
                    slot.time,
                    slot.section,
                    slot.room,
                    slot.type
                  )
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

  // Listen for incoming swap requests
  useEffect(() => {
    if (!teacherName) return;
    const q = query(
      collection(db, "swap_requests"),
      where("targetTeacher", "==", teacherName),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setSwapRequests(requests);
    });

    return () => unsubscribe();
  }, [teacherName]);

  const fetchSemesterClasses = async (semester, section) => {
    const classes = [];
    const semesterRef = collection(db, `semester_${semester}_${section}`);
    const semesterSnapshot = await getDocs(semesterRef);
    for (const doc of semesterSnapshot.docs) {
      const data = doc.data();

      console.log("Timeslots: ", doc.id);
      console.log(
        "perm Data: ",
        data.perm_course_code,
        data.perm_teacher_1,
        data.perm_day,
        data.perm_time_1,
        data.perm_room,
        section
      );
      console.log(
        "temp Data: ",
        data.temp_course_code,
        data.temp_teacher_1,
        data.temp_day,
        data.temp_time_1,
        data.temp_room,
        data.temp_section
      );
      if (data.perm_teacher_1 && !data.class_cancelled) {
        classes.push({
          timeSlot: doc.id,
          teacher: data.perm_teacher_1,
          course: data.perm_course_code,
          day: data.perm_day,
          time: data.perm_time_1,
          room: data.perm_room,
          type: data.perm_course_type,
          section: section,
        });
      } else if (data.temp_teacher_1) {
        classes.push({
          timeSlot: doc.id,
          teacher: data.temp_teacher_1,
          course: data.temp_course_code,
          day: data.temp_day,
          time: data.temp_time_1,
          room: data.temp_room,
          type: data.course_type || "theory",
          section: data.temp_section,
        });
      }
    }
    setSemesterClasses(classes);
  };

  const handleSlotSelect = async (day, time, slot) => {
    if (slot.type !== selectedCourseType) {
      alert("Lab classes cannot be swapped with Theory classes!");
      console.log("slot: ", slot);
    }
    if (selectedCourseType === "lab") {
      let timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
      let nexTimeSlot = timeSlot + 1;
      if (slot.isFree) {
        timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
        nexTimeSlot = timeSlot + 1;
      }
      if (
        Math.floor((nextTimeSlot - 1) / 6) !== Math.floor((timeSlot - 1) / 6) ||
        (timeSlot - 1) % 6 === 3
      ) {
        alert("Lab classes must have two consecutive slots in the same day!");
        return;
      }

      const nextSlot = semesterClasses.find(
        (classSlot) => Number(classSlot.timeSlot) === nextTimeSlot
      );
      if (nextSlot && nextSlot.isFree) {
        setSelectedRescheduleTime(timeSlot);
        await fetchAvailableRooms(timeSlot);
      } else {
        alert("Lab classes require two consecutive free slots!");
        return;
      }
    } else {
      if (slot.isFree) {
        // Handle free slot selection
        const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
        setSelectedRescheduleTime(timeSlot);
        await fetchAvailableRooms(timeSlot);
      } else if (slot.teacher !== teacherName) {
        // Handle occupied slot selection for swap
        setTargetClass({
          timeSlot: revDayMapping[day] * 6 + revTimeMapping[time],
          teacher: slot.teacher,
          course: slot.course,
          day: day,
          time: time,
          room: slot.room,
          section: slot.section, // Add section to target class
        });
        setShowSwapRequestModal(true);
      } else {
        alert("This is your own class!");
      }
    }
    setSelectedSlot(slot);
  };

  const sendSwapRequest = async () => {
    try {
      const swapRequestRef = collection(db, "swap_requests");
      await addDoc(swapRequestRef, {
        requestingTeacher: teacherName,
        requestingCourse: `${selectedCourse}`,
        requestingTimeSlot:
          revDayMapping[selectedDay] * 6 + revTimeMapping[selectedTime],
        requestingRoom: selectedRoom, // Add requesting room
        targetTeacher: targetClass.teacher,
        targetCourse: `${targetClass.course}`,
        targetTimeSlot: targetClass.timeSlot,
        targetRoom: targetClass.room, // Add target room
        requestingSection: selectedSection,
        targetSection: targetClass.section,
        status: "pending",
        createdAt: new Date(),
      });
      alert("Swap request sent successfully!");
      setShowSwapRequestModal(false);
    } catch (error) {
      console.error("Error sending swap request:", error);
      alert(`Failed to send swap request: ${error.message}`);
    }
  };

  const handleSwapResponse = async (requestId, accept) => {
    try {
      const request = swapRequests.find((req) => req.id === requestId);
      if (!request) return;

      if (accept) {
        // Use full course codes with sections
        await performClassSwap(request);
      }

      await updateDoc(doc(db, "swap_requests", requestId), {
        status: accept ? "accepted" : "rejected",
      });

      alert(`Swap request ${accept ? "accepted" : "rejected"} successfully!`);
    } catch (error) {
      console.error("Error handling swap response:", error);
      alert(`Failed to process swap response: ${error.message}`);
    }
    await fetchSchedule(); // Refresh the schedule after swap
  };

  const performClassSwap = async (request) => {
    try {
      // Course codes already include sections from the request object
      await updateTempSchedule(
        request.requestingTeacher,
        request.requestingCourse, // Already includes section
        request.requestingTimeSlot,
        request.requestingSection,
        request.requestingRoom, // Pass requesting room
        request.targetTeacher,
        request.targetCourse, // Already includes section
        request.targetTimeSlot,
        request.targetSection,
        request.targetRoom // Pass target room
      );
    } catch (error) {
      console.error("Error performing class swap:", error);
      throw error;
    }
  };

  const updateTempSchedule = async (
    reqTeacher,
    reqCourse,
    reqTimeSlot,
    reqSection,
    reqRoom,

    targetTeacher,
    targetCourse,
    targetTimeSlot,
    targetSection,
    targetRoom
  ) => {
    try {
      // Update teacher's course document
      const reqCourseRef = doc(
        db,
        `teachers/${reqTeacher}/courses/${reqCourse}_${reqSection}`
      );
      const reqCourseSnapshot = await getDoc(reqCourseRef);

      if (reqCourseSnapshot.exists()) {
        const reqCourseData = reqCourseSnapshot.data();
        // Find the index of the permanent class that matches the timeslot
        const reqTimeSlots = reqCourseData.assigned_time_slots || [];
        let reqCancelledStatus = reqCourseData.class_cancelled_status || [];
        let reqRescheduledStatus = reqCourseData.rescheduled_status || [];

        // Find the index by matching timeslot
        let reqCancelIndex = -1;
        for (let i = 0; i < reqTimeSlots.length; i++) {
          if (Number(reqTimeSlots[i]) === Number(reqTimeSlot)) {
            reqCancelIndex = i;
            break;
          }
        }

        // Update the specific class's cancelled and rescheduled status
        if (reqCancelIndex !== -1) {
          reqCancelledStatus[reqCancelIndex] = 1;
          reqRescheduledStatus[reqCancelIndex] = 1;
        }

        await updateDoc(reqCourseRef, {
          assigned_temp_time_slots: arrayUnion(targetTimeSlot),
          assigned_temp_room: arrayUnion(targetRoom),
          class_cancelled_status: reqCancelledStatus,
          rescheduled_status: reqRescheduledStatus,
        });

        console.log(
          `Updated requesting teacher course status at index ${reqCancelIndex}`
        );
      }

      // Update target teacher's course document
      const targetCourseRef = doc(
        db,
        `teachers/${targetTeacher}/courses/${targetCourse}_${targetSection}`
      );
      const targetCourseSnapshot = await getDoc(targetCourseRef);

      if (targetCourseSnapshot.exists()) {
        const targetCourseData = targetCourseSnapshot.data();
        // Find the index of the permanent class that matches the timeslot
        const targetTimeSlots = targetCourseData.assigned_time_slots || [];
        let targetCancelledStatus =
          targetCourseData.class_cancelled_status || [];
        let targetRescheduledStatus = targetCourseData.rescheduled_status || [];

        // Find the index by matching timeslot
        let targetCancelIndex = -1;
        for (let i = 0; i < targetTimeSlots.length; i++) {
          if (Number(targetTimeSlots[i]) === Number(targetTimeSlot)) {
            targetCancelIndex = i;
            break;
          }
        }

        // Update the specific class's cancelled and rescheduled status
        if (targetCancelIndex !== -1) {
          targetCancelledStatus[targetCancelIndex] = 1;
          targetRescheduledStatus[targetCancelIndex] = 1;
        }

        await updateDoc(targetCourseRef, {
          assigned_temp_time_slots: arrayUnion(reqTimeSlot),
          assigned_temp_room: arrayUnion(reqRoom),
          class_cancelled_status: targetCancelledStatus,
          rescheduled_status: targetRescheduledStatus,
        });

        console.log(
          `Updated target teacher course status at index ${targetCancelIndex}`
        );
      }

      // Get semester and section from course code
      const reqSemesterNum = reqCourse.charAt(reqCourse.length - 3);
      const reqSemester = `semester_${reqSemesterNum}_${reqSection}`;

      const targetSemesterNum = targetCourse.charAt(targetCourse.length - 3);
      const targetSemester = `semester_${targetSemesterNum}_${targetSection}`;

      // Calculate time and day info
      const totalSlotsPerDay = 6;
      const targetDayIndex = Math.floor(
        (targetTimeSlot - 1) / totalSlotsPerDay
      );
      const targetTimeIndex = ((targetTimeSlot - 1) % totalSlotsPerDay) + 1;
      const targetStartTime = timeMapping[targetTimeIndex].split("-")[0];
      const targetEndTime = timeMapping[targetTimeIndex + 1].split("-")[0];

      const reqDayIndex = Math.floor((reqTimeSlot - 1) / totalSlotsPerDay);
      const reqTimeIndex = ((reqTimeSlot - 1) % totalSlotsPerDay) + 1;
      const reqStartTime = timeMapping[reqTimeIndex].split("-")[0];
      const reqEndTime = timeMapping[reqTimeIndex + 1].split("-")[0];

      // Update semester timeslot document
      const reqTimeSlotRef = doc(db, reqSemester, reqTimeSlot.toString());
      await updateDoc(reqTimeSlotRef, {
        temp_course_code: targetCourse,
        temp_room: targetRoom,
        temp_teacher_1: targetTeacher,
        temp_section: targetSection,
        temp_day: dayMapping[reqDayIndex],
        temp_time_1: `${reqStartTime}-${reqEndTime}`,
        rescheduled: 1,
        class_cancelled: 1,
      });

      const targetTimeSlotRef = doc(
        db,
        targetSemester,
        targetTimeSlot.toString()
      );
      await updateDoc(targetTimeSlotRef, {
        temp_course_code: reqCourse,
        temp_room: reqRoom,
        temp_teacher_1: reqTeacher,
        temp_section: reqSection,
        temp_day: dayMapping[targetDayIndex],
        temp_time_1: `${targetStartTime}-${targetEndTime}`,

        rescheduled: 1,
        class_cancelled: 1,
      });

      // Update room document
      const reqRoomRef = doc(db, `time_slots/${reqTimeSlot}/rooms/${reqRoom}`);
      await updateDoc(reqRoomRef, {
        temp_course_code: targetCourse,
        temp_room: targetRoom,
        temp_teacher_1: targetTeacher,
        temp_section: targetSection,
        class_cancelled: 1,
      });

      const targetRoomRef = doc(
        db,
        `time_slots/${targetTimeSlot}/rooms/${targetRoom}`
      );
      await updateDoc(targetRoomRef, {
        temp_course_code: reqCourse,
        temp_room: reqRoom,
        temp_teacher_1: reqTeacher,
        temp_section: reqSection,
        class_cancelled: 1,
      });
    } catch (error) {
      console.error("Error updating temp schedule:", error);
      throw error;
    }
  };

  return (
    <div style={{ padding: "10px 100px 0px 50px" }}>
      <TeacherSidebar />
      <div>
        <h2>Teacher Routine</h2>
        {schedule.length > 0 ? renderTable() : <p>Loading schedule...</p>}

        {/* Unified Reschedule Modal */}
        {showUnifiedRescheduleModal && (
          <div className="modal" style={modalStyle}>
            <div
              className="modal-content"
              style={{ ...modalContentStyle, maxWidth: "80%" }}
            >
              <h3>Reschedule Class</h3>
              <p>
                Select a free slot to reschedule or an occupied slot to request
                a swap
              </p>

              <SemesterRoutineTable
                semesterClasses={semesterClasses}
                timeSlots={Object.values(timeMapping)}
                dayMapping={dayMapping}
                onSlotSelect={handleSlotSelect}
              />

              {selectedSlot && !selectedSlot.isFree && showSwapRequestModal && (
                <div className="swap-confirmation">
                  <h4>Confirm Swap Request</h4>
                  <p>Request to swap with {targetClass.teacher}'s class?</p>
                  <button onClick={sendSwapRequest}>Send Swap Request</button>
                  <button onClick={() => setShowSwapRequestModal(false)}>
                    Cancel
                  </button>
                </div>
              )}

              {selectedSlot &&
                selectedSlot.isFree &&
                availableRooms.get(Number(selectedRescheduleTime))?.size >
                  0 && (
                  <div className="room-selection">
                    <h4>Select Room</h4>
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
                    <button onClick={confirmReschedule}>
                      Confirm Reschedule
                    </button>
                  </div>
                )}

              <button
                onClick={() => setShowUnifiedRescheduleModal(false)}
                style={{ marginTop: "20px" }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Swap Requests Section */}
        {swapRequests.length > 0 && (
          <div className="swap-requests">
            <h3>Pending Swap Requests</h3>
            {swapRequests.map((request) => (
              <div key={request.id} className="swap-request">
                <p>
                  Teacher {request.requestingTeacher} wants to swap their{" "}
                  {request.requestingCourse} class with your{" "}
                  {request.targetCourse} class
                </p>
                <button onClick={() => handleSwapResponse(request.id, true)}>
                  Accept
                </button>
                <button onClick={() => handleSwapResponse(request.id, false)}>
                  Reject
                </button>
              </div>
            ))}
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
