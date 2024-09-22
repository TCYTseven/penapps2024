"use client";

import { useState, useRef, useEffect } from "react";
import { RocketIcon, UploadIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UploadCsv() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const router = useRouter();

  // State for stock data
  const [stocks, setStocks] = useState([]);

  // Twelve Data API key
  const API_KEY = "43cde48473de42dfafd97ea39c576abc";

  // Random S&P 500 stock symbols
  const sp500Symbols = [
    "AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "NVDA", "JPM", "V", "UNH", "HD", 
    "PG", "MA", "DIS", "PFE", "KO", "NFLX", "INTC", "WMT", "BAC", "XOM"
  ];

  // Fetch random stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Get random 5 stock symbols from the S&P 500 list
        const randomSymbols = sp500Symbols
          .sort(() => 0.5 - Math.random())
          .slice(0, 5)
          .join(",");

        const response = await axios.get("https://api.twelvedata.com/quote", {
          params: {
            symbol: randomSymbols,
            apikey: API_KEY,
          },
        });

        // Log the raw response data for debugging
        console.log("Raw API Response:", response.data);

        // Check if the response contains data for multiple symbols
        const data = Object.values(response.data).filter(
          (stock) => stock.status !== "error"
        );

        // Further filter out stocks without a valid percent_change
        const validData = data.filter(stock => {
          const change = parseFloat(stock.percent_change);
          return !isNaN(change);
        });

        // Map the valid data to the desired format
        const processedData = validData.map((stock, index) => ({
          id: `${stock.symbol}-${Date.now()}-${index}`,
          symbol: stock.symbol,
          changePercent: parseFloat(stock.percent_change).toFixed(2),
          isPositive: parseFloat(stock.percent_change) >= 0,
        }));

        setStocks(processedData);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchStockData, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = (event) => {
    event.preventDefault();
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
            router.push("/onboarding?data=custom");
          }, 500);
          return 100;
        }
        return oldProgress + 25;
      });
    }, 300);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleSampleSelect = (selection) => {
    router.push(`/onboarding?data=${selection}`);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background Animation Container */}
      <div className="absolute inset-0 z-0">
        {stocks.map((stock) => {
          const isLeftSide = Math.random() < 0.5; // Randomly place stocks on left or right
          const horizontalPositionPercentage = 5 + Math.random() * 20; // 5% to 25% for margin

          return (
            <motion.div
              key={stock.id}
              initial={{ y: "100vh", opacity: 1 }}
              animate={{ y: "-50vh", opacity: 0 }}
              transition={{
                duration: 12, // Increased duration for slower animation
                ease: "easeOut",
                repeat: Infinity,
                delay: Math.random() * 5, // Stagger animations
              }}
              className={`absolute p-4 rounded-md bg-${
                stock.isPositive ? "green-500" : "red-500"
              } bg-opacity-75`}
              style={{
                minWidth: "200px", // Increased width for larger rectangles
                pointerEvents: "none",
                ...(isLeftSide
                  ? { left: `${horizontalPositionPercentage}%` }
                  : { right: `${horizontalPositionPercentage}%` }),
              }}
            >
              <p className="text-sm font-semibold">
                {stock.symbol}: {stock.changePercent}%
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen p-8 z-10 relative"
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
            <div className="flex flex-col items-center">
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
        {/* Login Button */}
        <div className="mt-8 w-full max-w-md">
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Login
          </button>
        </div>

        {/* Sample Data Buttons */}
        <div className="mt-8 w-full max-w-md">
          <label className="block text-lg text-gray-400 mb-4">
            Or use sample data from:
          </label>
          <div className="space-y-3">
            <button
              onClick={() => handleSampleSelect("cof")}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Capital One
            </button>
            <button
              onClick={() => handleSampleSelect("aapl")}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Apple
            </button>
            <button
              onClick={() => handleSampleSelect("nvda")}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Nvidia
            </button>
            <div style={{ height: 20 }}></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
