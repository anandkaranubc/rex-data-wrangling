import React, { useState } from "react";
import Papa from "papaparse";

const App = () => {
  const [mentorCSV, setMentorCSV] = useState(null);
  const [menteeCSV, setMenteeCSV] = useState(null);
  const [matchCSV, setMatchCSV] = useState(null);
  const [output1, setOutput1] = useState(null);
  const [output2, setOutput2] = useState(null);

  // Function to handle file uploads and parse them into JSON format
  const handleFileUpload = (event, setFile) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: function (results) {
        setFile(results.data);
      },
    });
  };

  // Function to process the files and create Output 1 and Output 2
  const processFiles = () => {
    if (mentorCSV && menteeCSV && matchCSV) {
      // Create a mapping for mentor data using Mentor_ID
      const mentorMap = mentorCSV.reduce((acc, mentor) => {
        acc[mentor.Mentor_ID] = {
          mentor_first: mentor.Mentor_First_Name,
          mentor_last: mentor.Mentor_Last_Name,
          mentor_full: mentor.Mentor_Full_Name,
          mentor_email: mentor.Mentor_Email,
        };
        return acc;
      }, {});

      // Create a mapping for mentee data using uro_number
      const menteeMap = menteeCSV.reduce((acc, mentee) => {
        acc[mentee.uro_number] = {
          mentee_full: `${mentee.first} ${mentee.last}`,
          mentee_email: mentee.email,
        };
        return acc;
      }, {});

      // Process matchCSV to generate Output 1
      const output1Data = matchCSV.map((match) => {
        const mentorInfo = mentorMap[match.mentor_ID] || {};
        const result = {
          mentor_ID: match.mentor_ID,
          mentor_first: mentorInfo.mentor_first || "",
          mentor_last: mentorInfo.mentor_last || "",
          mentor_full: mentorInfo.mentor_full || "",
          mentor_email: mentorInfo.mentor_email || "",
        };

        let menteeIndex = 1;
        // Loop through uro_1, uro_2, etc.
        for (let i = 1; i <= 8; i++) {
          const uroKey = `uro_${i}`;
          const uro = match[uroKey];
          if (uro) {
            const menteeInfo = menteeMap[uro] || {};
            result[`name_${menteeIndex}`] = menteeInfo.mentee_full || "";
            result[`email_${menteeIndex}`] = menteeInfo.mentee_email || "";
            result[`uro_${menteeIndex}`] = uro;
            menteeIndex += 1;
          }
        }
        return result;
      });

      // Generate Output 2: Pivoted data with mentees listed in rows
      const output2Data = [];
      output1Data.forEach((mentor) => {
        for (let i = 1; i <= 8; i++) {
          const uroKey = `uro_${i}`;
          if (mentor[uroKey]) {
            output2Data.push({
              mentor_ID: mentor.mentor_ID,
              mentor_email: mentor.mentor_email,
              uro: mentor[`uro_${i}`],
              mentee_name: mentor[`name_${i}`],
              mentee_email: mentor[`email_${i}`],
            });
          }
        }
      });

      // Set the processed outputs
      setOutput1(output1Data);
      setOutput2(output2Data);
    }
  };

  // Function to download CSV file from processed data
  const downloadCSV = (data, filename) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Mentor-Mentee Matching Tool</h1>

      {/* File Upload Inputs */}
      <div className="mb-4">
        <label className="block">Upload Mentor CSV:</label>
        <input
          type="file"
          onChange={(e) => handleFileUpload(e, setMentorCSV)}
        />
      </div>
      <div className="mb-4">
        <label className="block">Upload Mentee CSV:</label>
        <input
          type="file"
          onChange={(e) => handleFileUpload(e, setMenteeCSV)}
        />
      </div>
      <div className="mb-4">
        <label className="block">Upload Match CSV:</label>
        <input type="file" onChange={(e) => handleFileUpload(e, setMatchCSV)} />
      </div>

      {/* Button to Process Files */}
      <button
        onClick={processFiles}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Process Files
      </button>

      {/* Button to Download Output 1 */}
      {output1 && (
        <div className="mt-8">
          <button
            onClick={() => downloadCSV(output1, "output1.csv")}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Download Output 1
          </button>
        </div>
      )}

      {/* Button to Download Output 2 */}
      {output2 && (
        <div className="mt-8">
          <button
            onClick={() => downloadCSV(output2, "output2.csv")}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Download Output 2
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
