"use client";
import { useState, useEffect } from "react";
import Papa from "papaparse";
import Cerebras from "@cerebras/cerebras_cloud_sdk";  // Import Cerebras SDK

export default function Debrief() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  // Initialize Cerebras client
  const client = new Cerebras({
    apiKey: "csk-3k6ykh******************",  // Your Cerebras API key
  });

  // Function to fetch and parse CSV data
  const fetchCsvData = async () => {
    try {
      const response = await fetch("https://raw.githubusercontent.com/TCYTseven/penapps24data/refs/heads/main/COF%20Historical%20Data.csv");  // Adjust the file path if necessary
      const csvText = await response.text();
      return csvText;  // Return the parsed CSV text
    } catch (error) {
      console.error("Error fetching CSV file:", error);
      return null;
    }
  };

  const summarizeCsv = async (csvText) => {
    try {
      setLoading(true);

      // Split the CSV text into tokens and truncate to the first 8000 tokens
      const tokens = csvText.split(/\s+/);
      const truncatedTokens = tokens.slice(0, 99); // Ensure we have less than 8000 tokens
      const truncatedCsvText = truncatedTokens.join(" ");

      // Send request to Cerebras API using their SDK
      const completionCreateResponse = await client.chat.completions.create({
        model: 'llama3.1-8b',
        messages: [
          {
            role: "system",
            content:
              "You are an expert financial analyst. Summarize the financial data from the provided CSV, highlighting how a company's financials are impacted. Focus on key metrics and trends such as revenue, profits, and costs. Avoid using any special symbols or markdown characters. NEVER EVER USE A COLIN. NEVER EVER USE AN ASTERIK. BE BRIEF - MAXIMUM WORDS IS 250. NEVER say undefined and NEVER EVER use *",
          },
          {
            role: "user",
            content: `Here's the CSV data: ${truncatedCsvText}`,
          },
        ],
        temperature: 0.7,
      });

      const result = completionCreateResponse.choices[0].message.content;
      setSummary(result);
    } catch (error) {
      console.error("Error summarizing CSV with Cerebras:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const parseAndSummarizeCsv = async () => {
      const csvData = await fetchCsvData(); // Fetch CSV data
      if (csvData) {
        summarizeCsv(csvData);  // Summarize the fetched CSV data
      }
    };

    parseAndSummarizeCsv();  // Call the function
  }, []);

  useEffect(() => {
    if (summary) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < summary.length) {
          setDisplayedText((prev) => prev + summary[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 22); // Adjust typing speed here
      return () => clearInterval(interval);
    }
  }, [summary]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(270deg, #0d1117, #161b22, #21262d, #161b22)',
        backgroundSize: '400% 400%',
        animation: 'gradientAnimation 15s ease infinite',
        color: '#E0E0E0',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
        CSV Debrief
      </h2>
      {loading && <p style={{ fontSize: '1.125rem' }}>Loading analysis...</p>}
      {!loading && displayedText && (
        <div
          style={{
            backgroundColor: '#1E1E1E',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            maxWidth: '600px',
            textAlign: 'left',
          }}
        >
          <h3 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '16px' }}>
            Summary
          </h3>
          <p>{displayedText}</p>
        </div>
      )}
    </div>
  );
}
