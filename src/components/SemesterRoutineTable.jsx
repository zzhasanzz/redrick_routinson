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

  // Fill in the classes
  semesterClasses.forEach((cls) => {
    if (routineByTime[cls.time] && routineByTime[cls.time][cls.day]) {
      routineByTime[cls.time][cls.day] = {
        isFree: false,
        ...cls,
      };
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
                    }}
                  >
                    {slot.isFree ? (
                      "Free Slot"
                    ) : (
                      <div>
                        <div>{slot.course}</div>
                        <div>Room: {slot.room}</div>
                        <div>Teacher: {slot.teacher}</div>
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
