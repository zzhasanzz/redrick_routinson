import Papa from 'papaparse';
import './StudentRoutine.scss'; // Import the CSS file

import React, { useState, useEffect, useContext } from 'react';
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";

const StudentRoutine = () => {
    const [routine, setRoutine] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const fetchRoutine = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.email));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const semester = userData.semester;
                        const csvFilePath = `../../../backend/Semester_${semester}_Routine.csv`;

                        const response = await fetch(csvFilePath);
                        if (response.ok) {
                            const csvText = await response.text();
                            Papa.parse(csvText, {
                                header: true,
                                complete: (result) => {
                                    const parsedData = result.data;
                                    const routineData = transformCSVToRoutine(parsedData);
                                    setRoutine(routineData);
                                },
                                error: (err) => {
                                    console.error("Error parsing CSV:", err);
                                    setError("Error parsing routine data.");
                                }
                            });
                        } else {
                            setError('Routine file not found for this semester.');
                        }
                    } else {
                        setError('User data not found.');
                    }
                } catch (err) {
                    console.error(err);
                    setError('Error fetching routine.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRoutine();
    }, [currentUser]);

    const transformCSVToRoutine = (csvData) => {
        const routineData = {};
        const timeSlots = new Set();

        csvData.forEach(row => {
            const day = row[""];
            if (!routineData[day]) {
                routineData[day] = {};
            }

            for (const [time, subject] of Object.entries(row)) {
                if (time && time !== "") {
                    const teacher = subject; // Assuming subject contains teacher info
                    routineData[day][time] = teacher;
                    timeSlots.add(time);
                }
            }
        });

        routineData.timeSlots = Array.from(timeSlots);
        return routineData;
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="routine-container">
            <h1>Routine</h1>
            {Object.keys(routine).length === 0 ? (
                <div>No routine available</div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Day</th>
                            {routine.timeSlots.map((time, index) => (
                                <th key={index}>{time}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(routine)
                            .filter(day => day !== 'timeSlots' && day !== 'Saturday') // Exclude Saturday
                            .map((day, dayIndex) => (
                                <tr key={dayIndex}>
                                    <td>{day}</td>
                                    {routine.timeSlots.map((time, timeIndex) => (
                                        <td key={timeIndex}>
                                            {routine[day][time] || "No class"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default StudentRoutine;
