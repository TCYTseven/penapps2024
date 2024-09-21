import React from "react";

const analytics = () => {
  return <div>analytics</div>;
};

export default analytics;

// "use client";

// import { useState, useEffect } from "react";
// <<<<<<< HEAD
// import Papa from "papaparse";
// import Cerebras from "@cerebras/cerebras_cloud_sdk"; // Import Cerebras SDK
// =======
// import { CircularProgress, Typography, Container, Box, Card, CardContent, Button } from "@mui/material";
// import { motion } from "framer-motion";
// import Cerebras from "@cerebras/cerebras_cloud_sdk";
// import { useRouter } from "next/navigation";
// >>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483

// export default function Debrief() {
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [displayedText, setDisplayedText] = useState("");
//   const [showButton, setShowButton] = useState(false); // Moved outside JSX
//   const router = useRouter();

//   // Initialize Cerebras client
//   const client = new Cerebras({
//     apiKey: "csk-3k6ykhjmckwr5t5244pm2eede45ppvtkrc5r9nrhe6mnjedr", // Use environment variable
//   });

//   // Fetch CSV data
//   const fetchCsvData = async () => {
//     try {
//       const response = await fetch(
//         "https://raw.githubusercontent.com/TCYTseven/penapps24data/refs/heads/main/COF%20Historical%20Data.csv"
// <<<<<<< HEAD
//       ); // Adjust the file path if necessary
//       const csvText = await response.text();
//       return csvText; // Return the parsed CSV text
// =======
//       );
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       const csvText = await response.text();
//       return csvText;
// >>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483
//     } catch (error) {
//       console.error("Error fetching CSV file:", error);
//       return null;
//     }
//   };

//   // Summarize CSV data using Cerebras API
//   const summarizeCsv = async (csvText) => {
//     try {
//       setLoading(true);
//       const tokens = csvText.split(/\s+/).slice(0, 99);
//       const truncatedCsvText = tokens.join(" ");

// <<<<<<< HEAD
//       // Split the CSV text into tokens and truncate to the first 8000 tokens
//       const tokens = csvText.split(/\s+/);
//       const truncatedTokens = tokens.slice(0, 99); // Ensure we have less than 8000 tokens
//       const truncatedCsvText = truncatedTokens.join(" ");

//       //send request to get csv data

//       // Send request to Cerebras API using their SDK
// =======
// >>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483
//       const completionCreateResponse = await client.chat.completions.create({
//         model: "llama3.1-8b",
//         messages: [
//           {
//             role: "system",
//             content:
//               "ALWAYS START OFF BY RESPONDING WITH 'Yyooo - before we continue, let me understand your situation:' no typo there! - NEVER say the data ranges from x to y. leave that part OUT. Include specific numbers from the data to show you know what your talking about BUT NEVER mention a specific date range the data includes. You are an expert financial analyst. Summarize the financial data. Do NOT include predictions. NEVER SAY THE WORD UNDEFINED EVER. Maximum words is 250. Don't use any special characters like colons, asterisks, or markdown. Plain text only.",
//           },
//           {
//             role: "user",
//             content: `Here's the CSV data: ${truncatedCsvText}`,
//           },
//         ],
//         temperature: 0.7,
//       });

//       const result = completionCreateResponse.choices[0].message.content;

//       setSummary(result);
//     } catch (error) {
//       console.error("Error summarizing CSV with Cerebras:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const parseAndSummarizeCsv = async () => {
//       const csvData = await fetchCsvData();
//       if (csvData) {
// <<<<<<< HEAD
//         summarizeCsv(csvData); // Summarize the fetched CSV data
//       }
//     };

//     parseAndSummarizeCsv(); // Call the function
// =======
//         summarizeCsv(csvData);
//       }
//     };
//     parseAndSummarizeCsv();
// >>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483
//   }, []);

//   useEffect(() => {
//     if (summary) {
//       let i = 0;
//       const interval = setInterval(() => {
//         if (i < summary.length) {
//           setDisplayedText((prev) => prev + summary[i]);
//           i++;
//         } else {
//           clearInterval(interval);
//         }
//       }, 22);
//       return () => clearInterval(interval);
//     }
//   }, [summary]);

//   // Moved useEffect for showButton outside JSX
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowButton(true);
//     }, 10000);
//     return () => clearTimeout(timer);
//   }, []);

//   // Determine if text generation is complete
//   const isTextComplete = summary && displayedText === summary;

//   return (
// <<<<<<< HEAD
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         height: "100vh",
//         background:
//           "linear-gradient(270deg, #0d1117, #161b22, #21262d, #161b22)",
//         backgroundSize: "400% 400%",
//         animation: "gradientAnimation 15s ease infinite",
//         color: "#E0E0E0",
//         padding: "24px",
//         textAlign: "center",
//       }}
//     >
//       <style>{`
//         @keyframes gradientAnimation {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//       `}</style>
//       <h2
//         style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "24px" }}
//       >
//         CSV Debrief
//       </h2>
//       {loading && <p style={{ fontSize: "1.125rem" }}>Loading analysis...</p>}
//       {!loading && displayedText && (
//         <div
//           style={{
//             backgroundColor: "#1E1E1E",
//             padding: "24px",
//             borderRadius: "12px",
//             boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
//             maxWidth: "600px",
//             textAlign: "left",
//           }}
//         >
//           <h3
//             style={{
//               fontSize: "1.75rem",
//               fontWeight: "600",
//               marginBottom: "16px",
//             }}
//           >
//             Summary
//           </h3>
//           <p>{displayedText}</p>
//         </div>
//       )}
//     </div>
// =======
//     <Box
//       sx={{
//         minHeight: "100vh",
//         backgroundColor: "#000000",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 4,
//       }}
//     >
//       <Container
//         maxWidth="md"
//         sx={{
//           width: "100%",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           color: "#ffffff",
//           fontFamily: "Inter, sans-serif",
//         }}
//       >
//         <Box textAlign="center" mb={4}>
//           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
//               <Typography variant="h6" color="textSecondary" gutterBottom sx={{ fontWeight: 800 }}>
//                 <Box component="span" sx={{ fontSize: "1.5rem", color: "gray", display: "inline-flex", alignItems: "center" }}>
//                   <Box
//                     component="span"
//                     sx={{
//                       width: 44,
//                       height: 44,
//                       borderRadius: "50%",
//                       border: "4px solid gray",
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                       marginRight: 1,
//                     }}
//                   >
//                     2
//                   </Box>
//                 </Box>
//               </Typography>
//             </motion.div>
//             <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
//               Knowtions
//             </Typography>
//             <Typography variant="h5" color="white" gutterBottom sx={{ fontWeight: 800 }}>
//               CSV Debrief
//             </Typography>
//           </motion.div>
//         </Box>

//         <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
//           {loading && (
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
//               <Card sx={{ bgcolor: "#1e1e1e", color: "#ffffff", textAlign: "center", padding: 2 }}>
//                 <CardContent>
//                   <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
//                     Loading analysis...
//                   </Typography>
//                   <CircularProgress color="primary" />
//                 </CardContent>
//               </Card>
//             </motion.div>
//           )}

//           {!loading && displayedText && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               style={{ width: "100%", maxWidth: "600px" }}
//             >
//               <Card sx={{ bgcolor: "#1e1e1e", color: "#ffffff", padding: 2 }}>
//                 <CardContent>
//                   <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
//                     Summary
//                   </Typography>
//                   <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
//                     {displayedText}
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           )}

//           {!loading && !displayedText && (
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
//               <Card sx={{ bgcolor: "#1e1e1e", color: "#ffffff", textAlign: "center", padding: 2 }}>
//                 <CardContent>
//                   <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 700 }}>
//                     No data available.
//                   </Typography>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           )}

//           {/* Move the button outside of the JSX conditional blocks */}
//           {showButton && (
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 sx={{ borderRadius: "12px", marginTop: 2 }}
//                 onClick={() => router.push("/gyat")}
//               >
//                 Continue
//               </Button>
//             </motion.div>
//           )}
//         </Box>
//       </Container>
//     </Box>
// >>>>>>> 52b256dc583858124d85877c5f3ec47d186b1483
//   );
// }
