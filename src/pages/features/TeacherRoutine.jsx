import React, { useEffect, useState } from 'react';
import { db, auth } from "../../firebase";
import { doc, getDoc ,collection} from "firebase/firestore";
import TeacherSidebar from "../home/sidebars/TeacherSidebar";

const TeacherRoutine = () => {
    const [schedule, setSchedule] = useState({});
    const [teacherName, setTeacherName] = useState("");

    // Fetch teacher name using the logged-in user's email
    useEffect(() => {
        const fetchTeacherName = async () => {
            const currentUser = auth.currentUser; // Get the currently logged-in user
            if (currentUser) {
                const email = currentUser.email; // Get user's email
                const userRef = doc(db, "users", currentUser.email);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists) {
                    setTeacherName(userSnap.data().name);
                    console.log(userSnap);
                }
                
            }
        };

        fetchTeacherName();
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            let teacherSchedule = {};
    
            // Loop through each semester collection
            const semesters = ["semester-1", "semester-3", "semester-5", "semester-7"];
            for (let semester of semesters) {
                for (let i = 1; i <= 30; i++) {
                    const timeslotRef = doc(db, semester.toString(), i.toString());
                    console.log(semester);
                    const timeslotSnap = await getDoc(timeslotRef);
    
                    if (timeslotSnap.exists()) {
                        const data = timeslotSnap.data();
                        console.log(`Data found for timeslot ${i}`);

                        
                        // Check if data is defined and includes the fields you need
                        if (data && (data['teacher-1'] === teacherName || data['teacher-2'] === teacherName)) {
                            const day = data.day || "Unknown Day"; // Default to avoid undefined
                            const timeSlot = {
                                courseCode: data['course-code'] || "N/A",
                                room: data.room || "N/A",
                                time: data['time-1'] || data['time-2'] || "N/A",
                            };
    
                            // Organize schedule by day
                            if (!teacherSchedule[day]) teacherSchedule[day] = [];
                            teacherSchedule[day].push(timeSlot);
                        }
                    } else {
                        console.log(`No data found for ${semester}, timeslot ${i}`);
                    }
                }
            }
    
            setSchedule(teacherSchedule);
        };
    
        if (teacherName) {
            fetchSchedule();
        }
    }, [teacherName]);
    

    // Render the schedule in a readable format
    const renderSchedule = () => {
        return Object.keys(schedule).map(day => (
            <div key={day}>
                <h3>{day}</h3>
                <ul>
                    {schedule[day].map((slot, index) => (
                        <li key={index}>
                            <strong>Course:</strong> {slot.courseCode} | <strong>Room:</strong> {slot.room} | <strong>Time:</strong> {slot.time}
                        </li>
                    ))}
                </ul>
            </div>
        ));
    };

    return (
        <div style={{ padding: '50px 0px 0px 370px' }}>
            <TeacherSidebar />
            <div>
                <h2>Teacher Routine</h2>
                {Object.keys(schedule).length > 0 ? renderSchedule() : <p>Loading schedule...</p>}
            </div>
        </div>
    );
};

export default TeacherRoutine;
