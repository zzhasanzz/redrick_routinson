import React, { useEffect, useState } from 'react';
import { db, auth } from "../../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
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
                const teacherRef = doc(db, "users", email);
                const teacherSnap = await getDoc(teacherRef);
                
                if (teacherSnap.exists()) {
                    setTeacherName(teacherSnap.data().name);
                    console.log(teacherSnap.data().name);
                }
            }
        };

        fetchTeacherName();
    }, []);

    useEffect(() => {
        const fetchSchedule = async () => {
            const teacherSchedule = {};
            const teacherDocRef = doc(db, "teachers", teacherName.toString());
            const coursesCollectionRef = collection(teacherDocRef, "courses");
            const coursesSnapshot = await getDocs(coursesCollectionRef);

            coursesSnapshot.forEach((doc) => {
                const courseData = doc.data();
                const day = courseData.day;
                
                // Initialize an array for each day if not already present
                if (!teacherSchedule[day]) {
                    teacherSchedule[day] = [];
                }

                // Add the course details to the day's schedule
                teacherSchedule[day].push({
                    courseCode: doc.id,
                    courseTitle: courseData['assigned-course-title'],
                    room: courseData['assigned-room'],
                    time: `${courseData['time-1']} - ${courseData['time-2']}`,
                });
            });

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
