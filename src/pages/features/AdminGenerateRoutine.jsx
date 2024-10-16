import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './Timetable.css' 

const AdminGenerateRoutine = () => {
  const [data, setData] = useState([]);
  const [data3, setData3] = useState([]);
  const [data5, setData5] = useState([]);
  const [data7, setData7] = useState([]);


  useEffect(() => {
    // Fetch the CSV file from the public folder
    const fetchCSV = async () => {
      const response = await fetch('../../../backend/Semester_1_Routine.csv'); // File in the public folder
      const reader = response.body.getReader();
      const result = await reader.read(); // Read the stream to completion
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result.value); // Decode the result

      // Parse the CSV data using PapaParse
      Papa.parse(csvData, {
        header: false, // Since your CSV has no headers
        skipEmptyLines: true,
        complete: (result) => {
          setData(result.data); // Store the parsed data
        }
      });
    };

    fetchCSV();
  }, []);


  // for semester 3

  useEffect(() => {
    // Fetch the CSV file from the public folder
    const fetchCSV = async () => {
      const response = await fetch('../../../backend/Semester_3_Routine.csv'); // File in the public folder
      const reader = response.body.getReader();
      const result = await reader.read(); // Read the stream to completion
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result.value); // Decode the result

      // Parse the CSV data using PapaParse
      Papa.parse(csvData, {
        header: false, // Since your CSV has no headers
        skipEmptyLines: true,
        complete: (result) => {
          setData3(result.data); // Store the parsed data
        }
      });
    };

    fetchCSV();
  }, []);

  // for semester 5

  useEffect(() => {
    // Fetch the CSV file from the public folder
    const fetchCSV = async () => {
      const response = await fetch('../../../backend/Semester_5_Routine.csv'); // File in the public folder
      const reader = response.body.getReader();
      const result = await reader.read(); // Read the stream to completion
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result.value); // Decode the result

      // Parse the CSV data using PapaParse
      Papa.parse(csvData, {
        header: false, // Since your CSV has no headers
        skipEmptyLines: true,
        complete: (result) => {
          setData5(result.data); // Store the parsed data
        }
      });
    };

    fetchCSV();
  }, []);

  // for semester 7

  useEffect(() => {
    // Fetch the CSV file from the public folder
    const fetchCSV = async () => {
      const response = await fetch('../../../backend/Semester_7_Routine.csv'); // File in the public folder
      const reader = response.body.getReader();
      const result = await reader.read(); // Read the stream to completion
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result.value); // Decode the result

      // Parse the CSV data using PapaParse
      Papa.parse(csvData, {
        header: false, // Since your CSV has no headers
        skipEmptyLines: true,
        complete: (result) => {
          setData7(result.data); // Store the parsed data
        }
      });
    };

    fetchCSV();
  }, []);

  return (<>
    <div style={{ padding: '20px' }}>
      <h2>Course Routine</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {/* Assuming first row in CSV contains the time slots */}
            {data.length > 0 && data[0].map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>


    {/*for semester 3*/}
    <div style={{ padding: '20px' }}>
      <h2>Course Routine</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {/* Assuming first row in CSV contains the time slots */}
            {data3.length > 0 && data[0].map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data3.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>



    {/*for semester 5*/}
    <div style={{ padding: '20px' }}>
      <h2>Course Routine</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {/* Assuming first row in CSV contains the time slots */}
            {data5.length > 0 && data[0].map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data5.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>




    {/*for semester 7*/}
    <div style={{ padding: '20px' }}>
      <h2>Course Routine</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {/* Assuming first row in CSV contains the time slots */}
            {data7.length > 0 && data[0].map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data7.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    </>
  );
};

export default AdminGenerateRoutine;