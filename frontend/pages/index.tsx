import React, { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/router';
import Papa from 'papaparse';

const SentimentAnalysisChecker = () => {
  const [text, setText] = useState<string>(""); // State for text input
  const [csvFile, setCsvFile] = useState<File | null>(null); // State for CSV file
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const router = useRouter();

  // Handles text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (e.target.value === "") setAnalysisResult(null); // Clear result when text is erased
  };

  // Handles CSV file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setCsvFile(file);
      handleUploadCsv(file); // Upload CSV file
    }
  };

  // Handle CSV upload and analysis
  const handleUploadCsv = async (file: File) => {
    // Check if file is a CSV
    if (file.type !== "text/csv") {
      alert("Please upload a valid CSV file.");
      return;
    }

    // Process CSV file
    Papa.parse(file, {
      complete: async (results) => {
        if (results.data.length === 0 || results.data[0].length !== 1) {
          alert("CSV file must have only one column for tweets.");
          return;
        }

        // Prepare FormData for upload
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axios.post("http://localhost:5000/analyze_csv", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            responseType: "blob", // To handle file response
          });

          // Create a URL for the blob
          const url = window.URL.createObjectURL(new Blob([response.data]));
          // Navigate to results page with the file URL
          router.push({
            pathname: '/ResultsPage',
            query: { fileUrl: url },
          });
        } catch (error) {
          console.error("Error uploading CSV:", error);
        }
      }
    });
  };

  // Handle text analysis
  const handleAnalyzeText = async () => {
    try {
      const response = await axios.post("http://localhost:5000/predict", { text });
      setAnalysisResult(response.data.prediction === 1 ? "Cyberbullying Detected" : "No Cyberbullying Detected");
    } catch (error) {
      console.error("Error analyzing text:", error);
      setAnalysisResult("Error analyzing text");
    }
  };

  return (
    <div className="h-screen">

    <div className="h-1/2 bg-gradient-to-b from-green-400 to-teal-500  rounded-b-[170px]  relative flex justify-center">
    <div className="text-center pb-5 absolute bottom-5 ">
    <h1 className="text-3xl font-bold mb-4 text-white">Stand Against Cyberbullying</h1>
        <p className="text-xl mb-8 text-white">Join us in creating a safer online community.</p>        
      <p className="text-white text-lg mb-6">Analyze text or upload a CSV file for sentiment analysis.</p>
      </div>
    </div>
    <div className="flex flex-col justify-center items-center p-4 ">   

      <div className="w-full max-w-3xl">
        {/* Text Input Section */}
        <textarea
          value={text}
          onChange={handleTextChange}
          className="w-full h-40 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 shadow-md"
          placeholder="Enter text for analysis"
        ></textarea>

        <div className="flex justify-between mt-4">
          <button
            onClick={handleAnalyzeText}
            className="bg-green-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-600 transition"
          >
            Analyze Text
          </button>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csvUpload"
          />
          <label
            htmlFor="csvUpload"
            className="bg-teal-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-teal-600 transition cursor-pointer"
            title=" The file must be in CSV format (e.g., name.csv) and have a single filled column named 'Text'" >

          
            Upload CSV
          </label>
        </div>

        {/* Display analysis result */}
        {analysisResult && (
          <div className="mt-4 ">
            <h2 className="text-xl font-bold">Analysis Result:</h2>
            <p>{analysisResult}</p>
          </div>
        )}
    </div>
    </div>
    </div>
  );
};

export default SentimentAnalysisChecker;
