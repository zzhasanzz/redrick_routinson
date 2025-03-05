import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickerInput = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <div>
            <h3>Select a Date:</h3>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy/MM/dd"
                isClearable
                showYearDropdown
                scrollableYearDropdown
            />
        </div>
    );
};

export default DatePickerInput;
