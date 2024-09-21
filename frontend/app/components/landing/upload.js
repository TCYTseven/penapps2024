"use client";

import { useState, useRef } from "react";
import { RocketIcon, UploadIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
<<<<<<< HEAD
import axios from "axios";
=======
import { useRouter } from "next/navigation";
>>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483

export default function UploadCsv() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
<<<<<<< HEAD
=======
  const router = useRouter();
>>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      startUpload(uploadedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const uploadedFile = event.dataTransfer.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      startUpload(uploadedFile);
    }
  };

  const startUpload = async (fileToUpload) => {
    setUploading(true);
<<<<<<< HEAD
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      setResults(response.data);
      console.log("File processed successfully:", response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
=======
    let progressTimer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            setUploading(false);
            router.push("/onboarding");
          }, 500);
          return 100;
        }
        return oldProgress + 25;
      });
    }, 300);
>>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

<<<<<<< HEAD
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animated-bg">
      <div className="relative mb-12 text-center">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-7xl font-extrabold animate-pulse">
          Finance Rocket
        </h1>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 opacity-30 rounded-lg blur-sm"></div>
      </div>
      <p className="text-gray-400 text-lg mt-2 text-center mb-8">
        Your Financial Future, Ready for Launch
      </p>
=======
  const handleSampleSelect = () => {
    router.push("/onboarding");
  };
>>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 text-white"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Header Section */}
      <header className="mb-12 text-center">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "4px solid gray",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 1rem",
            fontSize: "1.5rem",
            color: "gray",
            fontWeight: 800,
          }}
        >
          1
        </div>
        <motion.h1
          className="text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Knowtions
        </motion.h1>
        <h2 className="text-2xl italic text-gray-400">
          It's hard to not know your financial future - let us know for you.
        </h2>
      </header>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-16 w-full max-w-md flex flex-col justify-center items-center cursor-pointer transition-transform transform hover:scale-105 hover:border-opacity-80 ${
          file ? "border-blue-500" : "border-gray-600"
        }`}
<<<<<<< HEAD
        style={{ boxShadow: "0 4px 20px rgba(186, 85, 211, 0.5)" }}
=======
>>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        {!file && !uploading && (
          <>
            <UploadIcon className="text-gray-400 w-16 h-16 mb-4" />
            <p className="text-gray-400 text-lg mb-2">Drag and drop a CSV file</p>
            <p className="text-gray-500 text-sm">or click to select from your desktop</p>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </>
        )}

        {file && !uploading && (
          <div className="text-center">
            <RocketIcon className="text-blue-500 w-16 h-16 mb-4" />
            <p className="text-blue-500 text-lg">Preparing to Upload...</p>
          </div>
        )}

        {uploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center"
          >
            <motion.div
              className="rounded-full w-20 h-20 bg-blue-500 flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1.3 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <RocketIcon className="text-white w-8 h-8" />
            </motion.div>
            <motion.div
              className="bg-gray-700 rounded-full h-2 w-80 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-blue-500 h-full"></div>
            </motion.div>
            <p className="mt-2 text-gray-400">Uploading {progress}%</p>
          </motion.div>
        )}
      </div>

<<<<<<< HEAD
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {results && (
        <div className="mt-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Results:</h2>
          <ul>
            {Object.entries(results).map(([key, value]) => (
              <li key={key} className="mb-2">
                <strong>{key}:</strong> {value.substring(0, 100)}...
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .animated-bg {
          background: linear-gradient(
            270deg,
            #0d1117,
            #161b22,
            #21262d,
            #161b22
          );
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
        }
=======
      {/* Sample Data Buttons */}
      <div className="mt-8 w-full max-w-md">
        <label className="block text-lg text-gray-400 mb-4">
          Or use sample data from:
        </label>
        <div className="space-y-3">
          <button
            onClick={handleSampleSelect}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Capital One
          </button>
          <button
            onClick={handleSampleSelect}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Lorem Ipsum
          </button>
          <button
            onClick={handleSampleSelect}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Ipsum Lorem
          </button>
          <div style={{ height: 20 }}></div>
        </div>
      </div>
>>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483

      {/* Optional: Custom Styles */}
      <style jsx>{`
        .bg-gray-900 {
          background-color: #1a202c;
        }
        .form-radio:checked {
          border-color: #3b82f6;
          background-color: #3b82f6;
        }
      `}</style>
    </motion.div>
  );
}
