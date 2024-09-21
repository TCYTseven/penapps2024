"use client";

import { useState, useRef } from "react";
import { RocketIcon, UploadIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Adjust this import if you're using a different version of Next.js

export default function UploadCsv() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const router = useRouter(); // Initialize the router

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      startUpload();
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const uploadedFile = event.dataTransfer.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      startUpload();
    }
  };

  const startUpload = () => {
    setUploading(true);
    let progressTimer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            setUploading(false);
            router.push("/onboarding"); // Redirect after animation
          }, 500);
          return 100;
        }
        return oldProgress + 25;
      });
    }, 300); // Quick progress speed for animation effect
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 animated-bg">
      <div className="relative mb-12 text-center">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 text-7xl font-extrabold animate-pulse">
          Finance Rocket
        </h1>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 opacity-30 rounded-lg blur-sm"></div>
      </div>
      <p className="text-gray-400 text-lg mt-2 text-center">
        Your Financial Future, Ready for Launch
      </p>

      <div
        className={`border-2 border-dashed rounded-xl p-12 w-104 h-56 flex flex-col justify-center items-center cursor-pointer transition-transform transform hover:scale-105 hover:border-opacity-80 shadow-lg hover:shadow-purple-400 hover:shadow-xl ${
          file ? "border-white" : "border-gray-600"
        }`}
        style={{ boxShadow: "0 4px 20px rgba(186, 85, 211, 0.5)" }} // Light purple drop shadow
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        {!file && !uploading && (
          <>
            <UploadIcon className="text-gray-400 w-16 h-16 mb-4" />
            <label className="text-gray-400 text-lg mb-2 text-center">
              Drag and drop a CSV file
            </label>
            <label className="text-gray-400 text-sm mb-4 text-center">
              or click anywhere to select from your desktop
            </label>
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
            <RocketIcon className="text-gray-400 w-16 h-16 mb-4" />
            <p className="text-gray-400 text-lg">Launching!!!</p>
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
              className="rounded-full w-20 h-20 bg-white flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <RocketIcon className="text-black w-10 h-10" />
            </motion.div>
            <motion.div
              className="bg-gray-500 mt-4 rounded-xl h-2 w-72"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white h-full rounded-xl"></div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .animated-bg {
          background: linear-gradient(270deg, #0d1117, #161b22, #21262d, #161b22);
          background-size: 400% 400%;
          animation: gradientAnimation 15s ease infinite;
        }

        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
