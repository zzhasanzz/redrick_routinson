import "./StudentRoutine.scss"; // Import the CSS file
import React, { useState, useEffect, useContext } from "react";
import { db, auth } from "../../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const Slots = [
  "8:00-9:15",
  "9:15-10:30",
  "10:30-11:45",
  "11:45-1:00",
  "2:30-3:45",
  "3:45-5:00",
];

const StudentRoutine = () => {
  const [routine, setRoutine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  let course_code = "";
  let course_title = "";
  let teacher_1 = "";
  let teacher_2 = "";
  let room = "";
  let day = "";
  let time = "";
  let course_type = "";

  useEffect(() => {
    const fetchRoutine = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const sem = userData.semester;
            const semName = "semester_" + sem;
            const timeSlotRef = collection(db, semName.toString());
            const timeSlotsSnapshot = await getDocs(timeSlotRef);

            // Initialize an empty routine array
            const newRoutine = daysOfWeek.map(() => Slots.map(() => null));

            timeSlotsSnapshot.forEach((doc) => {
              const timeSlotData = doc.data();
              const {
                class_cancelled,
                perm_course_code,
                perm_course_title,
                perm_course_type,
                perm_day,
                perm_room,
                perm_teacher_1,
                perm_teacher_2,
                perm_time_1,
                perm_time_2,
                temp_course_code,
                temp_course_title,
                temp_day,
                temp_lab,
                temp_room,
                temp_teacher_1,
                temp_teacher_2,
                temp_time_1,
                temp_time_2,
              } = timeSlotData;
              var slotIndex = -1;
              var slotIndex2 = -1;

              course_code = perm_course_code;
              course_title = perm_course_code;
              teacher_1 = perm_teacher_1;
              teacher_2 = perm_teacher_2;
              course_type = perm_course_type;
              room = perm_room;

              var dayIndex = daysOfWeek.indexOf(perm_day);
              slotIndex = Slots.indexOf(timeSlotData.perm_time_1); // Assuming perm_time_1 corresponds to the slot time
              slotIndex2 = Slots.indexOf(timeSlotData.perm_time_1);

              if (class_cancelled === 1) {
                course_code = "Cancelled";
                course_title = "";
                teacher_1 = "";
                teacher_2 = "";
                room = "";
              }
              if (class_cancelled === 1 && temp_course_code !== "") {
                course_code = temp_course_code;
                teacher_1 = temp_teacher_1;
                room = temp_room;
                dayIndex = daysOfWeek.indexOf(temp_day);
                slotIndex = Slots.indexOf(timeSlotData.temp_time_1); // Assuming perm_time_1 corresponds to the slot time
                slotIndex2 = Slots.indexOf(timeSlotData.temp_time_1);

                console.log("Cancelled Class Found");
                console.log(`Course : ${course_code}`);
                console.log(`teacher : ${teacher_1}`);
              }

              // Find the index for the day and slot

              if (course_type === "lab") {
                slotIndex2 = Slots.indexOf(timeSlotData.perm_time_2);
              }

              // Update the 2D routine array with course details
              if (dayIndex !== -1 && slotIndex !== -1) {
                newRoutine[dayIndex][slotIndex] = {
                  course_code,
                  course_title,
                  teacher_1,
                  teacher_2,
                  room,
                };
                if (slotIndex2 !== -1) {
                  newRoutine[dayIndex][slotIndex2] = {
                    course_code,
                    course_title,
                    teacher_1,
                    teacher_2,
                    room,
                  };
                }
              }
            });

            setRoutine(newRoutine);
          } else {
            setError("User data not found.");
          }
        } catch (err) {
          console.error(err);
          setError("Error fetching routine.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRoutine();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="routine-container">
      <table>
        <thead>
          <tr>
            <th>Day/Slot</th>
            {Slots.map((slot, index) => (
              <th key={index}>{slot}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map((day, dayIndex) => (
            <tr key={day}>
              <td>{day}</td>
              {routine[dayIndex].map((slot, slotIndex) => (
                <td key={slotIndex}>
                  {slot ? (
                    <div>
                      <p>{slot.course_code}</p>

                      <p>
                        {slot.teacher_1} --- {slot.teacher_2}
                      </p>
                      <p>{slot.room}</p>
                    </div>
                  ) : (
                    <p>No class</p>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentRoutine;
