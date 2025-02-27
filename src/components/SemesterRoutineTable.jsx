import React from "react";

const SemesterRoutineTable = ({
  semesterClasses,
  timeSlots,
  dayMapping,
  onSlotSelect,
}) => {
  // Create time-based organization of classes
  const routineByTime = {};

  timeSlots.forEach((time) => {
    routineByTime[time] = {};
    Object.values(dayMapping).forEach((day) => {
      routineByTime[time][day] = { isFree: true };
    });
  });

  // Fill in the classes with special handling for labs
  semesterClasses.forEach((cls) => {
    if (routineByTime[cls.time] && routineByTime[cls.time][cls.day]) {
      let isLab = false;
      // Check if it's a lab course (course code ends with even number)
      if (cls.type === "lab") {
        isLab = true;
      }

      // For lab courses, mark two consecutive time slots
      if (isLab) {
        // Find the index of current time slot
        const currentTimeIndex = timeSlots.indexOf(cls.time);
        if (currentTimeIndex >= 0 && currentTimeIndex < timeSlots.length - 1) {
          // Mark current time slot
          routineByTime[cls.time][cls.day] = {
            isFree: false,
            isLabFirst: true,
            ...cls,
          };

          // Mark next time slot
          const nextTime = timeSlots[currentTimeIndex + 1];
          routineByTime[nextTime][cls.day] = {
            isFree: false,
            isLabSecond: true,
            ...cls,
          };
        }
      } else {
        // For regular theory classes, mark single time slot
        routineByTime[cls.time][cls.day] = {
          isFree: false,
          ...cls,
        };
      }
    }
  });

  return (
    <div className="semester-routine">
      <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Time / Day</th>
            {Object.values(dayMapping).map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time) => (
            <tr key={time}>
              <td>{time}</td>
              {Object.values(dayMapping).map((day) => {
                const slot = routineByTime[time][day];
                return (
                  <td
                    key={`${day}-${time}`}
                    onClick={() => onSlotSelect(day, time, slot)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: slot.isFree ? "#e8f5e9" : "#fff3e0",
                      ...(slot.isLabSecond && {
                        borderTop: "none",
                      }),
                      ...(slot.isLabFirst && {
                        borderBottom: "none",
                      }),
                    }}
                  >
                    {slot.isFree ? (
                      "Free Slot"
                    ) : (
                      <div>
                        <div>{slot.course}</div>
                        <div>Room: {slot.room}</div>
                        <div>Teacher: {slot.teacher}</div>
                        {slot.isLabFirst && <div>(Lab - 2 slots)</div>}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SemesterRoutineTable;
