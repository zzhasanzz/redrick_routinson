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
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [availableTimeSlot, setAvailableTimeSlot] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [semesterClasses, setSemesterClasses] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [showSwapRequestModal, setShowSwapRequestModal] = useState(false);
  const [targetClass, setTargetClass] = useState(null);
  const [showUnifiedRescheduleModal, setShowUnifiedRescheduleModal] =
  const [selectedSlot, setSelectedSlot] = useState(null);e);
= {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = {
    default: [
      "8:00-9:15",,
      "9:15-10:30",,
      "10:30-11:45",
      "11:45-1:00","3:45-5:00",
      "2:30-3:45",
      "3:45-5:00",Wednesday: ["8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00"],
    ],
    Wednesday: ["8:00-9:15", "9:15-10:30", "10:30-11:45", "11:45-1:00"],ate([]);
  };e([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);ew Set();
  const [roomOptions, setRoomOptions] = useState([]);
  let availableTimeSlotsSet = new Set();();
  let allTimeSlots = new Set();0; i++) {
  let occupiedTimeSlots = new Set(); allTimeSlots.add(i);
  for (let i = 1; i <= 30; i++) {  }
    allTimeSlots.add(i);
  }lRooms = new Set([

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
    "204",105",
    "104",
    "105",  let avRooms = new Set([...allRooms]);
  ]);
  let avRooms = new Set([...allRooms]);  let availableRoomsMap = new Map();

  let availableRoomsMap = new Map(); = {

  const timeMapping = {
    1: "8:00-9:15",,
    2: "9:15-10:30",,
    3: "10:30-11:45",
    4: "11:45-1:00",6: "3:45-5:00",
    5: "2:30-3:45",  };
    6: "3:45-5:00",
  };ng = {

  const dayMapping = {
    0: "Monday",,
    1: "Tuesday",",
    2: "Wednesday",
    3: "Thursday",",
    4: "Friday",6: "Sunday",
    5: "Saturday",  };
    6: "Sunday",
  };ing = {

  const revTimeMapping = {
    "8:00-9:15": 1,
    "8:00-10:30": 1,
    "9:15-10:30": 2,,
    "10:30-1:00": 3,,
    "10:30-11:45": 3,
    "11:45-1:00": 4,
    "2:30-3:45": 5,"3:45-5:00": 6,
    "2:30-5:00": 5,  };
    "3:45-5:00": 6,
  };Mapping = {

  const revDayMapping = {
    Monday: 0,,
    Tuesday: 1,3,
    Wednesday: 2,
    Thursday: 3,5,
    Friday: 4,Sunday: 6,
    Saturday: 5,  };
    Sunday: 6,
  };name using the logged-in user's email

  // Fetch teacher name using the logged-in user's email
  useEffect(() => {= auth.currentUser;
    const fetchTeacherName = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const email = currentUser.email;        const teacherSnap = await getDoc(teacherRef);
        const teacherRef = doc(db, "users", email);
        const teacherSnap = await getDoc(teacherRef);
 setTeacherName(teacherSnap.data().name);
        if (teacherSnap.exists()) { }
          setTeacherName(teacherSnap.data().name);}
        }    };
      }
    };TeacherName();
  }, []);
    fetchTeacherName();
  }, []); from Firestore

  // Fetch schedule from Firestore) => {
  useEffect(() => {
    const fetchSchedule = async () => {acherName.toString());
      const teacherSchedule = [];
      const teacherDocRef = doc(db, "teachers", teacherName.toString());      const coursesCollectionRef = collection(teacherDocRef, "courses");
      console.log(`Teacher Name: ${teacherName}`);
      const coursesCollectionRef = collection(teacherDocRef, "courses");Ref);
      // console.log(`Courses Snapshot: ${coursesSnapshot}`);
      const coursesSnapshot = await getDocs(coursesCollectionRef);
      // console.log(`Courses Snapshot: ${coursesSnapshot}`); {
ata();
      coursesSnapshot.forEach((doc) => {
        const courseData = doc.data();
        console.log(courseData);];
        const section = doc.id.slice(-1);us"];
        const classCancelledStatus = courseData["class_cancelled_status"];rseData["assigned_temp_time_slots"];
        const classRescheduledStatus = courseData["rescheduled_status"];
        const tempClasses = courseData["assigned_temp_time_slots"];
        console.log("Testing");oom"];
        console.log(classCancelledStatus);, index) => {
        // const assignedRooms = courseData["assigned_room"];          // console.log(`Stat: ${stat}`);
        classCancelledStatus.forEach((stat, index) => {
          // console.log(`Stat: ${stat}`);

          const totalSlotsPerDay = Object.keys(timeMapping).length;r((timeSlot - 1) / totalSlotsPerDay);
          const timeSlot = courseData["assigned_time_slots"][index];
          const dayIndex = Math.floor((timeSlot - 1) / totalSlotsPerDay);
          var courseType = "theory";[0]; // "8:00"
          const timeIndex = ((timeSlot - 1) % totalSlotsPerDay) + 1;("-")[1];
          const startTime = timeMapping[timeIndex].split("-")[0]; // "8:00"e_type"] === "lab") {
          var endTime = timeMapping[timeIndex].split("-")[1];
          if (courseData["course_type"] === "lab") {e = timeMapping[timeIndex + 1].split("-")[1]; // "10:30"
            courseType = "lab";
            endTime = timeMapping[timeIndex + 1].split("-")[1]; // "10:30" courseType = "theory";
          } else {
            courseType = "theory";
          }`);
          if (String(stat) !== "1") {            // console.log(courseData["assigned_room"][index]); 0
            console.log(`Class at index ${index} is not cancelled`);
            // console.log(courseData["assigned_room"][index]); 0
),
            teacherSchedule.push({ssigned_course_title"],
              courseCode: doc.id.substring(0, doc.id.length - 2),
              courseTitle: courseData["assigned_course_title"],e}-${endTime}`,
              day: dayMapping[dayIndex],
              time: `${startTime}-${endTime}`,signed_room"][index],
              section: section,tatus: "Permanent",
              room: courseData["assigned_room"][index],            });
              status: "Permanent",
            });sole.log(`Stat: ${stat}`);

            // console.log(`Stat: ${stat}`);
          } else {
            let classStatus = "Cancelled";tus[index]) === "1") {
            console.log(`Class at index ${index} is cancelled`); classStatus = "Rescheduled";
            if (String(classRescheduledStatus[index]) === "1") {
              classStatus = "Rescheduled";
            }),
            teacherSchedule.push({ssigned_course_title"],
              courseCode: doc.id.substring(0, doc.id.length - 2),
              courseTitle: courseData["assigned_course_title"],e}-${endTime}`,
              day: dayMapping[dayIndex],
              time: `${startTime}-${endTime}`,signed_room"][index],
              section: section,tatus: classStatus,
              room: courseData["assigned_room"][index], });
              status: classStatus,
            });
          }{
        });eSlot, index) => {
        if (!(tempClasses && tempClasses.length === 0)) {
          tempClasses.forEach((tempTimeSlot, index) => {
            if (tempTimeSlot !== "") {t.keys(timeMapping).length;
              // console.log(courseData["assigned_temp_room"][index]);
              const totalSlotsPerDay = Object.keys(timeMapping).length;
              const timeSlot = tempTimeSlot;r((timeSlot - 1) / totalSlotsPerDay);
              console.log(`timeslot: ${timeSlot}`);
              const dayIndex = Math.floor((timeSlot - 1) / totalSlotsPerDay);talSlotsPerDay) + 1;
              var courseType = "theory";
              const timeIndex = ((timeSlot - 1) % totalSlotsPerDay) + 1;[0]; // "8:00"
              console.log(`timeslot: ${timeIndex}`);];
              const startTime = timeMapping[timeIndex].split("-")[0]; // "8:00"e_type"][index] === "lab") {
              var endTime = timeMapping[timeIndex].split("-")[1];
              if (courseData["course_type"][index] === "lab") {e = timeMapping[timeIndex + 1].split("-")[1]; // "10:30"
                courseType = "lab";
                endTime = timeMapping[timeIndex + 1].split("-")[1]; // "10:30" courseType = "theory";
              } else {
                courseType = "theory";
              }),
              teacherSchedule.push({ssigned-course-title"],
                courseCode: doc.id.substring(0, doc.id.length - 2),
                courseTitle: courseData["assigned-course-title"],e}-${endTime}`,
                day: dayMapping[dayIndex],
                time: `${startTime}-${endTime}`,signed_temp_room"][index],
                section: section,tatus: "Temporary",
                room: courseData["assigned_temp_room"][index], });
                status: "Temporary",
              }); });
            }
          });      });
        }
      });setSchedule(teacherSchedule);
    };
      setSchedule(teacherSchedule);
    };
 fetchSchedule();
    if (teacherName) {
      fetchSchedule();  }, [teacherName]);
    }
  }, [teacherName]);ots = async (day, time) => {
ectedCourse
  const fetchAvailableTimeSlots = async (day, time) => {
    let sem = selectedCourse
      .toString()er_" + sem + "_" + selectedSection;
      .charAt(selectedCourse.toString().length - 3);
    let _semester = "semester_" + sem + "_" + selectedSection;
    setSemester(_semester);ocs(timeSlotRef);
    const timeSlotRef = collection(db, _semester); {
    const timeSlotsSnapshot = await getDocs(timeSlotRef);
    timeSlotsSnapshot.forEach((doc) => {
      const timeSlotData = doc.data();cancelled"]);
      const timeSlotID = Number(doc.id);lled"] === 1) {
      //   console.log(typeof timeSlotData["class_cancelled"]);
      if (timeSlotData["class_cancelled"] === 1) {        // console.log(timeSlotData["class_cancelled"]);
        // console.log(timeSlotID);
        // console.log(timeSlotData["class_cancelled"]); "") {
tID);
        if (timeSlotData["temp_course_code"] === "") {
          availableTimeSlotsSet.add(timeSlotID);sole.log(availableTimeSlots[availableTimeSlots.length-1]);
          // console.log("Time Slot Added")
          // console.log(availableTimeSlots[availableTimeSlots.length-1]); occupiedTimeSlots.add(timeSlotID);
        } else {
          occupiedTimeSlots.add(timeSlotID);
        } occupiedTimeSlots.add(timeSlotID);
      } else {
        occupiedTimeSlots.add(timeSlotID);
      }
    });{
    allTimeSlots.forEach((item) => { availableTimeSlotsSet.add(item);
      if (!occupiedTimeSlots.has(item)) {
        availableTimeSlotsSet.add(item);
      }
    });ach((it) => {
    console.log(availableTimeSlotsSet);(it);
    availableTimeSlotsSet.forEach((it) => {/ console.log(it);
      fetchAvailableRooms(it);
      // console.log(it);Slots(availableTimeSlotsSet);
    });
    setAvailableTimeSlots(availableTimeSlotsSet);
    console.log("");console.log("");
    console.log("");  };
    console.log("");
  }; time
leRooms = async (timeSlot) => {
  // Fetch available rooms for the selected day and time
  const fetchAvailableRooms = async (timeSlot) => {timeSlot}/rooms`);
    let roomID = "";ocs(roomsRef);
    const roomsRef = collection(db, `time_slots/${timeSlot}/rooms`); {
    const roomsSnapshot = await getDocs(roomsRef);;
    roomsSnapshot.forEach((doc) => {g();
      const roomData = doc.data();onsole.log(roomID);
      roomID = doc.id.toString();
      // console.log(roomID);&
      if (oomData["temp_course_code"] === ""
        roomData["class_cancelled"] === 1 &&
        roomData["temp_course_code"] === ""
      ) {`Room ${doc.id} has both perm_course_code and temp_course_code empty.`
        console.log(
          `Room ${doc.id} has both perm_course_code and temp_course_code empty.`
        );
        // availableRooms.set(roomID,timeSlot);p, timeSlot, roomID);
        // availableRooms[timeSlot].add(roomID); console.log(timeSlot, roomID);
        addValueToKey(availableRoomsMap, timeSlot, roomID);
        console.log(timeSlot, roomID);vRooms.delete(roomID);
      }    });
      avRooms.delete(roomID);
    });
roomID);
    avRooms.forEach((roomID) => {      // console.log(timeSlot,roomID);
      // availableRooms[timeSlot].add(roomID);
      // console.log(timeSlot,roomID);RoomsMap, timeSlot, roomID);
/ console.log(roomID);
      addValueToKey(availableRoomsMap, timeSlot, roomID);    });
      // console.log(roomID);
    });    avRooms = new Set([...allRooms]);

    avRooms = new Set([...allRooms]);setAvailableRooms(availableRoomsMap);
  };
    setAvailableRooms(availableRoomsMap);
  };eslot) {
 setSelectedRescheduleTime(timeslot);
  async function handleTimeSlotClick(timeslot) {
    setSelectedRescheduleTime(timeslot);(map, key, value) {
  }
  function addValueToKey(map, key, value) { map.set(key, new Set());
    if (!map.has(key)) {
      map.set(key, new Set()); map.get(key).add(value);
    }  }
    map.get(key).add(value);
  }
c (courseId, day, time, section) => {
  // Handle Cancel ClassrseType = "";
  const handleCancelClass = async (courseId, day, time, section) => {;
    let selectedCourseType = "";
    let rooms = [];imeSlot = 0;
    let room = "";
    let timeSlot = 0; courseRef = doc(
    try {
      const courseRef = doc(
        db,courseId.toString() + "_" + section
        `teachers/${teacherName}/courses`,
        courseId.toString() + "_" + section, teacherName, "courses", courseId.toString());
      );
      // const courseRef = doc(db, "teachers", teacherName, "courses", courseId.toString()););
      console.log(`Course Ref ${courseRef}`);}`);
      const courseSnapshot = await getDoc(courseRef);
      console.log(`Course Snap ${courseSnapshot}`);      console.log(`Course Data ${courseData}`);
      const courseData = courseSnapshot.data();
      console.log(`Course Data ${courseData}`);
      console.log(`Course Type: ${selectedCourseType}`);
      selectedCourseType = courseData["course_type"];
      console.log(`Course Type: ${selectedCourseType}`);      console.log(`${courseData.id}`);

      console.log(`${courseData.id}`);
ping[day]}`);
      console.log(`Day: ${day}`);
      console.log(`Day: ${revDayMapping[day]}`);
      console.log(`Time: ${time}`);vTimeMapping[time];
      console.log(`Time: ${revTimeMapping[time]}`);
      timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
      console.log(`Time Slot: ${timeSlot}`);lass_cancelled_status"];
      console.log(`Course Type: ${selectedCourseType}`);0]}`);
      const classCancelledStatus = courseData["class_cancelled_status"];
      console.log(`${classCancelledStatus[0]}`);      //   const classTimes = courseData["assigned_time_slots"];
      rooms = courseData["assigned_room"];
      //   const classTimes = courseData["assigned_time_slots"];      //   classTimes.forEach((tSlot , index) =>{

      //   classTimes.forEach((tSlot , index) =>{
${timeSlot}`);
      //   console.log(`Tslot: ${tSlot}`);
      //   console.log(`Time slot: ${timeSlot}`);   room = rooms[index];
      //     if(tSlot=== timeSlot){}
      //         room = rooms[index];      //   })
      //     }
      //   })
ots"][idx] === timeSlot) {
      classCancelledStatus.forEach((stat, idx) => {us[idx] = 1;
        if (courseData["assigned_time_slots"][idx] === timeSlot) {
          classCancelledStatus[idx] = 1;`Room: ${room}`);
          room = rooms[idx];
          console.log(`Room: ${room}`);`Cancelled Course Timeslot ${courseData["class_cancelled_status"][idx]}`
          console.log( );
            `Cancelled Course Timeslot ${courseData["class_cancelled_status"][idx]}`
          );
        }
      });lass_cancelled_status: classCancelledStatus,
      await updateDoc(courseRef, {
        class_cancelled_status: classCancelledStatus,
      });ass:", error);
    } catch (error) { alert("Failed to cancel class.");
      console.error("Error canceling class:", error);    }
      alert("Failed to cancel class.");
    }
eSlot}`);
    try {      console.log(`room ${room}`);
      console.log(`Time Slot ${timeSlot}`);
      console.log(`room ${room}`);
      console.log(`Constructed Path: time_slots/${timeSlot}/rooms/${room}`);
      console.log(`Room Type: ${typeof room}`);
      console.log(`Constructed Path: time_slots/${timeSlot}/rooms/${room}`);/${timeSlot}/rooms`, room.toString());

      const roomRef = doc(db, `time_slots/${timeSlot}/rooms`, room.toString());mRef);
      console.log(`room ref ${roomRef}`);      const roomData = roomSnapshot.data();
      const roomSnapshot = await getDoc(roomRef);
      const roomData = roomSnapshot.data();ta}`);

      console.log(`room Data ${roomData}`);rse Timeslot ${roomData["class_cancelled"]}`);
      const classCancelledStatus = 1;
      console.log(`Cancelled Course Timeslot ${roomData["class_cancelled"]}`);lass_cancelled: classCancelledStatus,
      await updateDoc(roomRef, {
        class_cancelled: classCancelledStatus,
      });ass:", error);
    } catch (error) { alert("Failed to cancel class.");
      console.error("Error canceling class:", error);    }
      alert("Failed to cancel class.");
    }

    try {ing().length - 3);
      // Extract the semester from the courseId
      let sem = courseId.toString().charAt(courseId.toString().length - 3); // Ensure setSemester is updating the state correctly
      const semester = "semester_" + sem + "_" + section;      console.log(semester);
      setSemester(semester); // Ensure setSemester is updating the state correctly
      console.log(semester);
      const timeSlotRef = doc(db, semester, timeSlot.toString());
      // Reference to the specific document for the time slot
      const timeSlotRef = doc(db, semester, timeSlot.toString());
      const timeSlotSnapshot = await getDoc(timeSlotRef);
      // Fetch the document data
      const timeSlotSnapshot = await getDoc(timeSlotRef);

      if (timeSlotSnapshot.exists()) {        console.log(`Time Slot Data:`, timeSlotData);
        const timeSlotData = timeSlotSnapshot.data();
        console.log(`Time Slot Data:`, timeSlotData);the document
ancelledStatus = 1;
        // Check conditions and update the document
        const classCancelledStatus = 1;`Cancelled Course Timeslot: ${timeSlotData["class_cancelled"]}`
        console.log(
          `Cancelled Course Timeslot: ${timeSlotData["class_cancelled"]}`
        );lass_cancelled: classCancelledStatus,
        await updateDoc(timeSlotRef, {        });
          class_cancelled: classCancelledStatus,
        });e.log("Class cancelled status updated successfully.");

        console.log("Class cancelled status updated successfully."); console.log("No document found with the specified timeslot.");
      } else {
        console.log("No document found with the specified timeslot.");
      }ass:", error);
    } catch (error) { alert("Failed to cancel class.");
      console.error("Error canceling class:", error);    }
      alert("Failed to cancel class.");
    }ourseType === "lab") {
lot++;
    if (selectedCourseType === "lab") {
      timeSlot++;eSlot}`);
      try {        console.log(`room ${room}`);
        console.log(`Time Slot ${timeSlot}`);
        console.log(`room ${room}`);
        console.log(`Constructed Path: time_slots/${timeSlot}/rooms/${room}`);
        console.log(`Room Type: ${typeof room}`);
        console.log(`Constructed Path: time_slots/${timeSlot}/rooms/${room}`); roomRef = doc(

        const roomRef = doc(imeSlot}/rooms`,
          db,room.toString()
          `time_slots/${timeSlot}/rooms`,
          room.toString()
        );mRef);
        console.log(`room ref ${roomRef}`);        const roomData = roomSnapshot.data();
        const roomSnapshot = await getDoc(roomRef);
        const roomData = roomSnapshot.data();ta}`);

        console.log(`room Data ${roomData}`);rse Timeslot ${roomData["class_cancelled"]}`);
        const classCancelledStatus = 1;
        console.log(`Cancelled Course Timeslot ${roomData["class_cancelled"]}`);lass_cancelled: classCancelledStatus,
        await updateDoc(roomRef, {
          class_cancelled: classCancelledStatus,
        });ass:", error);
      } catch (error) { alert("Failed to cancel class.");
        console.error("Error canceling class:", error);      }
        alert("Failed to cancel class.");
      }

      try {ing().length - 3);
        // Extract the semester from the courseId
        let sem = courseId.toString().charAt(courseId.toString().length - 3); // Ensure setSemester is updating the state correctly
        const semester = "semester_" + sem + "_" + section;        console.log(semester);
        setSemester(semester); // Ensure setSemester is updating the state correctly
        console.log(semester);
        const timeSlotRef = doc(db, semester, timeSlot.toString());
        // Reference to the specific document for the time slot
        const timeSlotRef = doc(db, semester, timeSlot.toString());
        const timeSlotSnapshot = await getDoc(timeSlotRef);
        // Fetch the document data
        const timeSlotSnapshot = await getDoc(timeSlotRef);

        if (timeSlotSnapshot.exists()) {          console.log(`Time Slot Data:`, timeSlotData);
          const timeSlotData = timeSlotSnapshot.data();
          console.log(`Time Slot Data:`, timeSlotData);the document
ancelledStatus = 1;
          // Check conditions and update the document
          const classCancelledStatus = 1;`Cancelled Course Timeslot: ${timeSlotData["class_cancelled"]}`
          console.log(
            `Cancelled Course Timeslot: ${timeSlotData["class_cancelled"]}`
          );lass_cancelled: classCancelledStatus,
          await updateDoc(timeSlotRef, {          });
            class_cancelled: classCancelledStatus,
          });e.log("Class cancelled status updated successfully.");

          console.log("Class cancelled status updated successfully."); console.log("No document found with the specified timeslot.");
        } else {
          console.log("No document found with the specified timeslot.");
        }ass:", error);
      } catch (error) { alert("Failed to cancel class.");
        console.error("Error canceling class:", error); }
        alert("Failed to cancel class.");}
      }  };
    }
  };
= async (course, day, time, section) => {
  // Handle Reschedule Classurse);
  const handleRescheduleClass = async (course, day, time, section) => {
    setSelectedCourse(course);
    setSelectedDay(day);
    setSelectedTime(time);
    setSelectedSection(section);lectedTime}`);
    ();
    // Fetch all semester classessetShowRescheduleModal(true);
    let sem = course.toString().charAt(course.toString().length - 3);  };
    await fetchSemesterClasses(sem, section);
    setShowUnifiedRescheduleModal(true);
  };
RescheduleTime}`);
  const confirmReschedule = async () => {
    console.log(`Selected Room: ${selectedRoom}`);ion: ${selectedSection}`);
    console.log(`Selected  Reschedule Time: ${selectedRescheduleTime}`);
    console.log(`Selected Course: ${selectedCourse}`);heory";
    console.log(`Selected Section: ${selectedSection}`);selectedCourseType}`);
    const selectedCourseType =
      parseInt(selectedCourse.slice(-1)) % 2 === 0 ? "lab" : "theory";`);
    console.log(`Selected Course Type: ${selectedCourseType}`);
    console.log(`Semester: ${semester}`);e.log("Lab Rescheduling Unavailable");
    // console.log(`${typeof(semester)}`);
    if (selectedCourseType === "lab") {(
      console.log("Lab Rescheduling Unavailable");se,
    } else {
      handleCancelClass(
        selectedCourse,selectedSection
        selectedDay,      );
        selectedTime,
        selectedSectioncheduleTime}`);
      );ect.keys(timeMapping).length;

      const timeSlotDocRef = doc(db, `${semester}/${selectedRescheduleTime}`);(selectedRescheduleTime - 1) / totalSlotsPerDay
      const totalSlotsPerDay = Object.keys(timeMapping).length;
      const dayIndex = Math.floor(SlotsPerDay) + 1;
        (selectedRescheduleTime - 1) / totalSlotsPerDay[0];
      );ndex].split("-")[1];
      const timeIndex = ((selectedRescheduleTime - 1) % totalSlotsPerDay) + 1;
      const startTime = timeMapping[timeIndex].split("-")[0];${endTime}`;
      var endTime = timeMapping[timeIndex].split("-")[1];
      var day = dayMapping[dayIndex];      console.log(`Time: ${time}`);
      const time = `${startTime}-${endTime}`;
      console.log(`Day: ${day}`);
      console.log(`Time: ${time}`);etDoc(timeSlotDocRef);

      try { it
        const docSnap = await getDoc(timeSlotDocRef);lotDocRef, {
        if (docSnap.exists()) {: 1,
          // If the document exists, update it
          await updateDoc(timeSlotDocRef, {
            class_cancelled: 1,edCourseType,
            rescheduled: 1,
            temp_course_code: selectedCourse,n,
            temp_course_type: selectedCourseType,: teacherName,
            temp_room: selectedRoom,
            temp_section: selectedSection,emp_time_1: time,
            temp_teacher_1: teacherName,
            temp_day: day,e.log("Update successful in Semester");
            temp_time_1: time,
          });ist, create it
          console.log("Update successful in Semester");DocRef, {
        } else {: 1,
          // If the document does not exist, create it
          await setDoc(timeSlotDocRef, {
            class_cancelled: 1,edCourseType,
            rescheduled: 1,
            temp_course_code: selectedCourse,n,
            temp_course_type: selectedCourseType,: teacherName,
            temp_room: selectedRoom,
            temp_section: selectedSection,emp_time_1: time,
            temp_teacher_1: teacherName,
            temp_day: day, console.log("Document created in Semester");
            temp_time_1: time,
          });
          console.log("Document created in Semester"); console.error("Error updating/creating semester doc:", error);
        }
      } catch (error) {
        console.error("Error updating/creating semester doc:", error); courseRef = doc(
      }
      try {
        const courseRef = doc(selectedCourse.toString() + "_" + selectedSection
          db,
          `teachers/${teacherName}/courses`,, teacherName, "courses", courseId.toString());
          selectedCourse.toString() + "_" + selectedSection
        );eRef);
        // const courseRef = doc(db, "teachers", teacherName, "courses", courseId.toString());hot.data();
        console.log(`Course Ref ${courseRef}`);
        const courseSnapshot = await getDoc(courseRef);
        const courseData = courseSnapshot.data(); || [];
        if (courseSnapshot.exists()) {ta.rescheduled_status || [];
          const permanentTimeSlots = courseData.assigned_time_slots || [];          console.log(permanentTimeSlots);
          let classCancelledStatus = courseData.class_cancelled_status || [];
          let rescheduledStatus = courseData.rescheduled_status || [];t, index) => {
          console.log(permanentTimeSlots);

          permanentTimeSlots.forEach((timeSlot, index) => {
            console.log(`time: ${timeSlot}`);{typeof selectedTime}`);
            console.log(`time type: ${typeof timeSlot}`);            console.log(classCancelledStatus);
            console.log(`selected time: ${selectedTime}`);
            console.log(`selected time type: ${typeof selectedTime}`);            const totalSlotsPerDay = Object.keys(timeMapping).length;
            console.log(classCancelledStatus);
totalSlotsPerDay) + 1;
            const totalSlotsPerDay = Object.keys(timeMapping).length;            const time = timeMapping[timeIndex];

            const timeIndex = ((timeSlot - 1) % totalSlotsPerDay) + 1;
            const time = timeMapping[timeIndex];              console.log(`Class at index ${index} and ${time} is cancelled`);

            if (time === selectedTime) {ngth
              console.log(`Class at index ${index} and ${time} is cancelled`);ength <= index) {

              //   Ensure classCancelledStatus has the same length
              //   if (classCancelledStatus.length <= index) {...new Array(index - classCancelledStatus.length + 1).fill(0),
              //     classCancelledStatus = [ ];
              //       ...classCancelledStatus,              //   }
              //       ...new Array(index - classCancelledStatus.length + 1).fill(0),
              //     ];
              //   } 1;

              // Mark the class as cancelled console.log(classCancelledStatus);
              classCancelledStatus[index] = 1;
              rescheduledStatus[index] = 1;          });
              console.log(classCancelledStatus);
            }          // const assignedRooms = courseData["assigned_room"];
          });
pdate it
          // const assignedRooms = courseData["assigned_room"];
Status,
          // If the document exists, update it
          await updateDoc(courseRef, {RescheduleTime),
            class_cancelled_status: classCancelledStatus,ssigned_temp_room: arrayUnion(selectedRoom),
            rescheduled_status: rescheduledStatus,
            assigned_temp_time_slots: arrayUnion(selectedRescheduleTime),
            assigned_temp_room: arrayUnion(selectedRoom), console.log("Update successful in teacher courses");
          });
          semester;
          console.log("Update successful in teacher courses"); console.error("Error updating/creating teacher doc:", error);
        }
      } catch (error) {
        console.error("Error updating/creating teacher doc:", error); roomsRef = collection(
      }
      try {`time_slots/${selectedRescheduleTime}/rooms`
        // const roomsRef = collection(
        //   db,t getDocs(roomsRef);
        //   `time_slots/${selectedRescheduleTime}/rooms`
        // );t ${selectedRescheduleTime} does not exist `);
        // const roomsSnapshot = await getDocs(roomsRef); roomRef = doc(
        // if (roomsSnapshot.empty) {
        //   console.log(`Timeslot ${selectedRescheduleTime} does not exist `);`time_slots/${selectedRescheduleTime}/rooms/${selectedRoom}`
        //   const roomRef = doc(
        //     db, {
        //     `time_slots/${selectedRescheduleTime}/rooms/${selectedRoom}`: 1,
        //   );
        //   await setDoc(roomRef, {,
        //     class_cancelled: 1,
        //     rescheduled: 0,"",
        //     course_type: "theory",
        //     perm_course_code: "",
        //     perm_course_title: "",
        //     perm_teacher_1: "",edCourseType,
        //     perm_teacher_2: "",
        //     temp_course_code: selectedCourse,n,
        //     temp_course_type: selectedCourseType,emp_teacher_1: teacherName,
        //     temp_room: selectedRoom,
        //     temp_section: selectedSection,
        //     temp_teacher_1: teacherName,`Timeslot ${selectedRescheduleTime} and room ${selectedRoom} created successfully.`
        //   });
        //   console.log(
        //     `Timeslot ${selectedRescheduleTime} and room ${selectedRoom} created successfully.` roomRef = doc(
        //   );
        // } else {`time_slots/${selectedRescheduleTime}/rooms/${selectedRoom}`
        const roomRef = doc(
          db,etDoc(roomRef);
          `time_slots/${selectedRescheduleTime}/rooms/${selectedRoom}`ists()) {
        );
        const roomDoc = await getDoc(roomRef);`Timeslot ${selectedRescheduleTime} has room no ${selectedRoom} .`
        if (roomDoc.exists()) {          );
          console.log(
            `Timeslot ${selectedRescheduleTime} has room no ${selectedRoom} .`          const roomData = roomDoc.data();
          );

          const roomData = roomDoc.data();
edCourseType,
          await updateDoc(roomRef, {
            temp_course_code: selectedCourse,
            temp_course_type: selectedCourseType,emp_section: selectedSection,
            temp_room: selectedRoom,
            temp_teacher_1: teacherName,
            temp_section: selectedSection,
          });`Timeslot ${selectedRescheduleTime} has rooms but not the selected one.`
        } else {
          console.log( {
            `Timeslot ${selectedRescheduleTime} has rooms but not the selected one.`
          );,
          await setDoc(roomRef, {
            class_cancelled: 1,"",
            course_type: "theory",
            perm_course_code: "",
            perm_course_title: "",
            perm_teacher_1: "",edCourseType,
            perm_teacher_2: "",
            temp_course_code: selectedCourse,n,
            temp_course_type: selectedCourseType,emp_teacher_1: teacherName,
            temp_room: selectedRoom,
            temp_section: selectedSection, console.log(`Room ${selectedRoom} created successfully.`);
            temp_teacher_1: teacherName,
          });
          console.log(`Room ${selectedRoom} created successfully.`);
        } console.error("Error finding timeslot :", error);
        // } }
      } catch (error) {}
        console.error("Error finding timeslot :", error);  };
      }
    } = async (courseId, day, time, section) => {
  };rseType = "";
;
  const handleUndoCancelledClass = async (courseId, day, time, section) => {
    let selectedCourseType = "";imeSlot = 0;
    let rooms = [];
    let room = ""; courseRef = doc(
    let timeSlot = 0;
    try {
      const courseRef = doc(courseId.toString() + "_" + section
        db,
        `teachers/${teacherName}/courses`,eRef);
        courseId.toString() + "_" + section      const courseData = courseSnapshot.data();
      );
      const courseSnapshot = await getDoc(courseRef);
      const courseData = courseSnapshot.data();revTimeMapping[time];

      selectedCourseType = courseData["course_type"];      const classCancelledStatus = courseData["class_cancelled_status"];
      timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
      rooms = courseData["assigned_room"];
      const classCancelledStatus = courseData["class_cancelled_status"];ots"][idx] === timeSlot) {
us[idx] = 0;
      classCancelledStatus.forEach((stat, idx) => { room = rooms[idx];
        if (courseData["assigned_time_slots"][idx] === timeSlot) {
          classCancelledStatus[idx] = 0;
          room = rooms[idx];
        }lass_cancelled_status: classCancelledStatus,
      });      });
      await updateDoc(courseRef, {
        class_cancelled_status: classCancelledStatus,
      });ime_slots/${timeSlot}/rooms`, room.toString());
ef, {
      // Update room statuslass_cancelled: 0,
      const roomRef = doc(db, `time_slots/${timeSlot}/rooms`, room.toString());      });
      await updateDoc(roomRef, {
        class_cancelled: 0,
      });ing().length - 3);

      // Update semester statusmester, timeSlot.toString());
      let sem = courseId.toString().charAt(courseId.toString().length - 3);lotRef, {
      const semester = "semester_" + sem + "_" + section;lass_cancelled: 0,
      const timeSlotRef = doc(db, semester, timeSlot.toString());      });
      await updateDoc(timeSlotRef, {
        class_cancelled: 0,es
      });
eSlot + 1;
      // Handle second slot for lab classes nextRoomRef = doc(
      if (selectedCourseType === "lab") {
        const nextTimeSlot = timeSlot + 1;extTimeSlot}/rooms`,
        const nextRoomRef = doc(room.toString()
          db,
          `time_slots/${nextTimeSlot}/rooms`,oomRef, {
          room.toString()lass_cancelled: 0,
        );        });
        await updateDoc(nextRoomRef, {
          class_cancelled: 0,mester, nextTimeSlot.toString());
        });imeSlotRef, {
lass_cancelled: 0,
        const nextTimeSlotRef = doc(db, semester, nextTimeSlot.toString()); });
        await updateDoc(nextTimeSlotRef, {
          class_cancelled: 0,
        });ass:", error);
      } alert("Failed to undo cancelled class.");
    } catch (error) {}
      console.error("Error undoing cancelled class:", error);  };
      alert("Failed to undo cancelled class.");
    }eCancelTemporaryClass = async (
  };seId,

  const handleCancelTemporaryClass = async (
    courseId,
    day,ion
    time,
    room,
    section
  ) => {      const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
    try {
      // Get the timesloturse document
      const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time]; courseRef = doc(

      // Update teacher's course document
      const courseRef = doc(courseId.toString() + "_" + section
        db,
        `teachers/${teacherName}/courses`,eRef);
        courseId.toString() + "_" + section      const courseData = courseSnapshot.data();
      );
      const courseSnapshot = await getDoc(courseRef);
      const courseData = courseSnapshot.data();ots || [];
      let tempRooms = courseData.assigned_temp_room || [];
      // Get existing temporary slots and rooms
      let tempTimeSlots = courseData.assigned_temp_time_slots || [];
      let tempRooms = courseData.assigned_temp_room || [];      const slotIndex = tempTimeSlots.indexOf(timeSlot.toString());

      // Find the index of the slot to removeby removing the cancelled temporary class
      const slotIndex = tempTimeSlots.indexOf(timeSlot.toString());
tIndex);
      // Update the arrays by removing the cancelled temporary class        tempRooms = tempRooms.filter((_, index) => index !== slotIndex);
      if (slotIndex > -1) {
        tempTimeSlots = tempTimeSlots.filter((_, index) => index !== slotIndex);t with new arrays
        tempRooms = tempRooms.filter((_, index) => index !== slotIndex);
TimeSlots,
        // Update the course document with new arraysssigned_temp_room: tempRooms,
        await updateDoc(courseRef, { });
          assigned_temp_time_slots: tempTimeSlots,      }
          assigned_temp_room: tempRooms,
        });
      }ing().length - 3);

      // Update semester document      const timeSlotRef = doc(db, semester, timeSlot.toString());
      let sem = courseId.toString().charAt(courseId.toString().length - 3);
      const semester = "semester_" + sem + "_" + section;tRef, {
      const timeSlotRef = doc(db, semester, timeSlot.toString());
pe: "",
      await updateDoc(timeSlotRef, {
        temp_course_code: "",1: "",
        temp_course_type: "",
        temp_room: "",
        temp_teacher_1: "",",
        temp_day: "",escheduled: 0,
        temp_time_1: "",      });
        temp_section: "",
        rescheduled: 0,
      });ime_slots/${timeSlot}/rooms/${room}`);
, {
      // Update room document
      const roomRef = doc(db, `time_slots/${timeSlot}/rooms/${room}`);pe: "",
      await updateDoc(roomRef, {
        temp_course_code: "",",
        temp_course_type: "",
        temp_room: "",lass_cancelled: 0,
        temp_teacher_1: "",      });
        temp_section: "",
        class_cancelled: 0,le
      });oad();

      // Refresh the scheduleass:", error);
      // location.reload(); alert("Failed to cancel temporary class.");
    } catch (error) {}
      console.error("Error canceling temporary class:", error);  };
      alert("Failed to cancel temporary class.");
    }
  };rder="1" style={{ borderCollapse: "collapse", width: "100%" }}>
>
  const renderTable = () => (
    <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>th>
      <thead>
        <tr>
          <th>Course</th>
          <th>Day</th>
          <th>Room</th>
          <th>Time</th>>Actions</th>
          <th>Status</th>
          <th>Section</th>>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>ay, time, and index for a unique key */}
        {schedule.map((slot, index) => (e}</td>
          <tr key={`${slot.courseCode}-${slot.day}-${slot.time}-${index}`}>
            {/* Combined courseCode, day, time, and index for a unique key */}
            <td>{slot.courseCode}</td>
            <td>{slot.day}</td>
            <td>{slot.room}</td>            <td>{slot.section}</td>
            <td>{slot.time}</td>
            <td>{slot.status}</td>
            <td>{slot.section}</td>tus === "Temporary" ? (

            <td>
              {slot.status === "Temporary" ? (aryClass(
                <buttonseCode,
                  onClick={() =>
                    handleCancelTemporaryClass(
                      slot.courseCode,/ Pass the room as a parameter
                      slot.day, slot.section
                      slot.time, )
                      slot.room, // Pass the room as a parameter }
                      slot.section
                    )Temporary Class
                  }
                >status === "Cancelled" ? (
                  Cancel Temporary Class
                </button>
              ) : slot.status === "Cancelled" ? (dClass(
                <buttonseCode,
                  onClick={() =>
                    handleUndoCancelledClass(
                      slot.courseCode, slot.section
                      slot.day, )
                      slot.time, }
                      slot.section
                    )ncel
                  }utton>
                >
                  Undo Cancel
                </button>
              ) : (
                <buttonseCode,
                  onClick={() =>
                    handleCancelClass(
                      slot.courseCode, slot.section
                      slot.day, )
                      slot.time, }
                      slot.section
                    )Class
                  }</button>
                >              )}
                  Cancel Class
                </button>
              )}
ass(
              <buttonseCode,
                onClick={() =>
                  handleRescheduleClass(
                    slot.courseCode, slot.section
                    slot.day, )
                    slot.time, }
                    slot.section
                  )ule
                }utton>
              >d>
                Reschedule/tr>
              </button>
            </td>y>
          </tr></table>
        ))}  );
      </tbody>
    </table>oming swap requests
  );
    if (!teacherName) return;
  // Listen for incoming swap requests
  useEffect(() => {
    if (!teacherName) return;
cherName),
    const q = query(where("status", "==", "pending")
      collection(db, "swap_requests"),    );
      where("targetTeacher", "==", teacherName),
      where("status", "==", "pending")Snapshot(q, (snapshot) => {
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {equests.push({ id: doc.id, ...doc.data() });
      const requests = [];
      snapshot.forEach((doc) => {etSwapRequests(requests);
        requests.push({ id: doc.id, ...doc.data() });    });
      });
      setSwapRequests(requests);ubscribe();
    });  }, [teacherName]);

    return () => unsubscribe();
  }, [teacherName]);
ter}_${section}`);
  // Fetch all classes for the selected semesterhot = await getDocs(semesterRef);
  const fetchSemesterClasses = async (semester, section) => {    const classes = [];
    const semesterRef = collection(db, `semester_${semester}_${section}`);
    const semesterSnapshot = await getDocs(semesterRef);Snapshot.docs) {
    const classes = [];
acher_1 && !data.class_cancelled) {
    for (const doc of semesterSnapshot.docs) {
      const data = doc.data();
      if (data.perm_teacher_1 && !data.class_cancelled) {
        classes.push({ourse_code,
          timeSlot: doc.id,
          teacher: data.perm_teacher_1,1,
          course: data.perm_course_code,oom: data.perm_room,
          day: data.perm_day, });
          time: data.perm_time_1, }
          room: data.perm_room,    }
        });
      }setSemesterClasses(classes);
    }  };

    setSemesterClasses(classes);Slot) => {
  };
(cls) => cls.timeSlot === targetTimeSlot
  const handleSlotSelect = async (day, time, slot) => {
    if (slot.isFree) {    if (!targetClass) return;
      // Handle free slot selection
      const timeSlot = revDayMapping[day] * 6 + revTimeMapping[time];
      setSelectedRescheduleTime(timeSlot);You cannot swap with your own class!");
      await fetchAvailableRooms(timeSlot); return;
    } else if (slot.teacher !== teacherName) {    }
      // Handle occupied slot selection for swap
      setTargetClass({
        timeSlot: revDayMapping[day] * 6 + revTimeMapping[time],setShowSwapRequestModal(true);
        teacher: slot.teacher,  };
        course: slot.course,
        day: day,endSwapRequest = async () => {
        time: time,
        room: slot.roomion(db, "swap_requests");
      });
      setShowSwapRequestModal(true);
    } else {electedCourse,
      alert("This is your own class!");
    }revTimeMapping[selectedTime],
    setSelectedSlot(slot);r,
  };
rgetClass.timeSlot,
  const handleSwapRequest = async (targetTimeSlot) => {
    const targetClass = semesterClasses.find(reatedAt: new Date(),
      (cls) => cls.timeSlot === targetTimeSlot      });
    );
    if (!targetClass) return;sfully!");
estModal(false);
    if (targetClass.teacher === teacherName) {
      alert("You cannot swap with your own class!");uest:", error);
      return; alert("Failed to send swap request");
    }}
  };
    setTargetClass(targetClass);
    setShowSwapRequestModal(true);andleSwapResponse = async (requestId, accept) => {
  };
equests.find((req) => req.id === requestId);
  const sendSwapRequest = async () => {      if (!request) return;
    try {
      const swapRequestRef = collection(db, "swap_requests");
      await addDoc(swapRequestRef, {both classes
        requestingTeacher: teacherName, await performClassSwap(request);
        requestingCourse: selectedCourse,      }
        requestingTimeSlot:
          revDayMapping[selectedDay] * 6 + revTimeMapping[selectedTime],
        targetTeacher: targetClass.teacher,questId), {
        targetCourse: targetClass.course,tatus: accept ? "accepted" : "rejected",
        targetTimeSlot: targetClass.timeSlot,      });
        status: "pending",
        createdAt: new Date(),uest ${accept ? "accepted" : "rejected"} successfully!`);
      });
se:", error);
      alert("Swap request sent successfully!"); alert("Failed to process swap response");
      setShowSwapRequestModal(false);}
    } catch (error) {  };
      console.error("Error sending swap request:", error);
      alert("Failed to send swap request");t) => {
    }her's class
  };
,
  const handleSwapResponse = async (requestId, accept) => {e,
    try {
      const request = swapRequests.find((req) => req.id === requestId);request.requestingTimeSlot
      if (!request) return;    );

      if (accept) {s class
        // Perform the swap by updating both classes(
        await performClassSwap(request);,
      }
Slot,
      // Update request statusrequest.targetTimeSlot
      await updateDoc(doc(db, "swap_requests", requestId), {);
        status: accept ? "accepted" : "rejected",  };
      });
teTempSchedule = async (
      alert(`Swap request ${accept ? "accepted" : "rejected"} successfully!`);,
    } catch (error) {
      console.error("Error handling swap response:", error);,
      alert("Failed to process swap response");imeSlot
    }
  };eachers/${teacher}/courses/${course}`);

  const performClassSwap = async (request) => {
    // Update requesting teacher's classlass_cancelled_status: [1], // Mark original slot as cancelled
    await updateTempSchedule(});
      request.requestingTeacher,  };
      request.requestingCourse,
      request.targetTimeSlot,
      request.requestingTimeSlotg: "10px 100px 0px 50px" }}>
    );herSidebar />

    // Update target teacher's class
    await updateTempSchedule(        {schedule.length > 0 ? renderTable() : <p>Loading schedule...</p>}
      request.targetTeacher,
      request.targetCourse,
      request.requestingTimeSlot,
      request.targetTimeSlot
    );nt" style={modalContentStyle}>
  };              <h3>Reschedule Class</h3>

  const updateTempSchedule = async (ch and show all classes for the semester */}
    teacher,
    course,
    newTimeSlot, fetchSemesterClasses(semester.split("_")[1], selectedSection)
    oldTimeSlot }
  ) => {
    const courseRef = doc(db, `teachers/${teacher}/courses/${course}`);l Classes
    await updateDoc(courseRef, {              </button>
      assigned_temp_time_slots: arrayUnion(newTimeSlot),
      class_cancelled_status: [1], // Mark original slot as cancelled>
    });
  };key={cls.timeSlot} className="class-slot">

  return (room})
    <div style={{ padding: "10px 100px 0px 50px" }}>ls.teacher ? ` - ${cls.teacher}` : " (Free)"}
      <TeacherSidebar />
      <div>) => handleSwapRequest(cls.timeSlot)}>
        <h2>Teacher Routine</h2>This Slot
        {schedule.length > 0 ? renderTable() : <p>Loading schedule...</p>}tton>
/div>
        {/* Unified Reschedule Modal */}
        {showUnifiedRescheduleModal && (              </div>
          <div className="modal" style={modalStyle}>
            <div className="modal-content" style={{ ...modalContentStyle, maxWidth: '80%' }}>tion */}
              <h3>Reschedule Class</h3>
              <p>Select a free slot to reschedule or an occupied slot to request a swap</p>otClick(e.target.value)}>
              selected>
              <SemesterRoutineTable ct a time slot --
                semesterClasses={semesterClasses}
                timeSlots={Object.values(timeMapping)} (
                dayMapping={dayMapping}{timeslot} value={timeslot}>
                onSlotSelect={handleSlotSelect}ot}
              />/option>

              {selectedSlot && !selectedSlot.isFree && showSwapRequestModal && (              </select>
                <div className="swap-confirmation">
                  <h4>Confirm Swap Request</h4>oms */}
                  <p>Request to swap with {targetClass.teacher}'s class?</p>
                  <button onClick={sendSwapRequest}>Send Swap Request</button>
                  <button onClick={() => setShowSwapRequestModal(false)}>Cancel</button> ? (
                </div>oom(e.target.value)}>
              )}bled selected>
ct a room --
              {selectedSlot && selectedSlot.isFree && availableRooms.get(Number(selectedRescheduleTime))?.size > 0 && (
                <div className="room-selection">
                  <h4>Select Room</h4>get(Number(selectedRescheduleTime))
                  <select onChange={(e) => setSelectedRoom(e.target.value)}>
                    <option value="" disabled selected>-- Select a room --</option>room} value={room}>
                    {Array.from(availableRooms.get(Number(selectedRescheduleTime))).map((room) => (oom}
                      <option key={room} value={room}>Room {room}</option>/option>
                    ))}
                  </select>elect>
                  <button onClick={confirmReschedule}>Confirm Reschedule</button>
                </div> <p>No rooms available for the selected time slot.</p>
              )}

              <button <p>Please select a time slot to see available rooms.</p>
                onClick={() => setShowUnifiedRescheduleModal(false)}              )}
                style={{ marginTop: '20px' }}
              >
                Closeule()}
              </button> style={{ marginTop: "10px" }}
            </div>
          </div>
        )}              </button>

        {/* Swap Requests Section */}
        {swapRequests.length > 0 && (uleModal(false)}
          // ...existing swap requests section... style={{ marginTop: "10px" }}
        )}
      </div>
    </div>tton>
  );v>
};</div>
        )}
// Styling for modal
const modalStyle = {
  position: "fixed",
  top: "0",
  left: "0",style={modalContentStyle}>
  width: "100%",>Confirm Swap Request</h3>
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",}'s{" "}
  display: "flex",} class on {targetClass.day} at{" "}
  justifyContent: "center",argetClass.time}?
  alignItems: "center",
};
onClick={() => setShowSwapRequestModal(false)}>
const modalContentStyle = {
  backgroundColor: "white",tton>
  padding: "20px",v>
  borderRadius: "8px",</div>
  maxWidth: "500px",        )}
  width: "100%",
};

export default TeacherRoutine;
