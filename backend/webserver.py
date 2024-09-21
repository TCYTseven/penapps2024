from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import tempfile
import os
import subprocess
from pathlib import Path

app = FastAPI()

# Add CORS middleware to align where the server calls are coming from
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded file
            temp_file_path = Path(temp_dir) / "input_data.csv"
            with temp_file_path.open("wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Change to the temporary directory
            original_dir = os.getcwd()
            os.chdir(temp_dir)

            # Copy the dataoutput.py script to the temporary directory
            shutil.copy2(Path(original_dir) / "../data/dataoutput.py", temp_dir)

            # Run the dataoutput.py script
            subprocess.run(["python", "dataoutput.py"], check=True)

            # Read the output files
            results = {}
            output_files = [
                "stock_price_with_crashes.html",
                "stock_candlestick_chart.html",
                "correlation_heatmap.html",
                "trading_volume.html",
                "crash_periods.json",
                "processed_data.csv"
            ]
            
            for file_name in output_files:
                file_path = Path(temp_dir) / file_name
                if file_path.exists():
                    results[file_name] = file_path.read_text()
                else:
                    results[file_name] = f"File {file_name} not found"

            # Change back to the original directory
            os.chdir(original_dir)

        return JSONResponse(content=results)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)