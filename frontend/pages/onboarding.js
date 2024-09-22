"use client";

import { useState, useEffect } from "react";
import { CircularProgress, Typography, Container, Box, Card, CardContent, Button } from "@mui/material";
import { motion } from "framer-motion";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { useRouter, useSearchParams } from "next/navigation";

export default function Debrief() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize Cerebras client
  const client = new Cerebras({
    apiKey: "csk-3k6ykhjmckwr5t5244pm2eede45ppvtkrc5r9nrhe6mnjedr", // Use environment variable
  });

  // Determine the correct CSV URL based on user selection
  const getCsvUrl = () => {
    const selectedData = searchParams.get("data");
    if (selectedData === "aapl") {
      return "https://raw.githubusercontent.com/TCYTseven/penapps24data/main/aapl_data.csv";
    } else if (selectedData === "nvda") {
      return "https://raw.githubusercontent.com/TCYTseven/penapps24data/main/nvda_data.csv";
    } else {
      return "https://raw.githubusercontent.com/TCYTseven/penapps24data/main/cof_data.csv"; // Default to Capital One
    }
  };

  // Fetch CSV data
  const fetchCsvData = async () => {
    try {
      const csvUrl = getCsvUrl();
      if (!csvUrl) {
        throw new Error("Invalid data parameter.");
      }
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const csvText = await response.text();
      return csvText;
    } catch (error) {
      console.error("Error fetching CSV file:", error);
      return null;
    }
  };

  const continueDashboard = async () => {
    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: searchParams.get("data") }),
      });
      if (response.ok) {
        router.push("/analytics");
      } else {
        console.log("failed to get data from the chosen company");
      }
    } catch (e) {
      console.error("there was an error", e);
    }
  };

  // Summarize CSV data using Cerebras API
  const summarizeCsv = async (csvText) => {
    try {
      setLoading(true);
      const tokens = csvText.split(/\s+/).slice(0, 99);
      const truncatedCsvText = tokens.join(" ");

      const completionCreateResponse = await client.chat.completions.create({
        model: "llama3.1-8b",
        messages: [
          {
            role: "system",
            content:
              "ALWAYS START OFF BY RESPONDING WITH 'Yyooo - before we continue, let me understand your situation:' no typo there! - NEVER say the data ranges from x to y. leave that part OUT. Include specific numbers from the data to show you know what you're talking about BUT NEVER mention a specific date range the data includes. You are an expert financial analyst. Summarize the financial data. Do NOT include predictions. NEVER SAY THE WORD UNDEFINED EVER. Maximum words is 250. Don't use any special characters like colons, asterisks, or markdown. Plain text only.",
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
      // Check if searchParams is available
      if (!searchParams) {
        return;
      }

      const csvData = await fetchCsvData();
      if (csvData) {
        summarizeCsv(csvData);
      }
    };

    parseAndSummarizeCsv();
  }, [searchParams]); // Add searchParams as a dependency

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
      }, 22);
      return () => clearInterval(interval);
    }
  }, [summary]);

  // Show button after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <Box textAlign="center" mb={4}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom sx={{ fontWeight: 800 }}>
                <Box component="span" sx={{ fontSize: "1.5rem", color: "gray", display: "inline-flex", alignItems: "center" }}>
                  <Box
                    component="span"
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: "4px solid gray",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 1,
                    }}
                  >
                    2
                  </Box>
                </Box>
              </Typography>
            </motion.div>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
              Knowtions
            </Typography>
            <Typography variant="h5" color="white" gutterBottom sx={{ fontWeight: 800 }}>
              CSV Debrief
            </Typography>
          </motion.div>
        </Box>

        <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Card sx={{ bgcolor: "#1e1e1e", color: "#ffffff", textAlign: "center", padding: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Loading analysis...
                  </Typography>
                  <CircularProgress color="primary" />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!loading && displayedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ width: "100%", maxWidth: "600px" }}
            >
              <Card sx={{ bgcolor: "#1e1e1e", color: "#ffffff", padding: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                    Summary
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {displayedText}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!loading && !displayedText && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Card sx={{ bgcolor: "#1e1e1e", color: "#ffffff", textAlign: "center", padding: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 700 }}>
                    No data available.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {showButton && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Button
                variant="contained"
                color="primary"
                sx={{ borderRadius: "12px", marginTop: 2 }}
                onClick={() => router.push("/analytics")}
              >
                Continue
              </Button>
            </motion.div>
          )}
        </Box>
      </Container>
    </Box>
  );
}
