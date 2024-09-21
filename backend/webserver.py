from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import tempfile
import shutil
import os
from pathlib import Path
import subprocess
import requests
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UploadRequest(BaseModel):
    name: str

@app.post("/upload")
async def upload_file(request: UploadRequest):
    try:
        file_paths = {
            "COF": "https://raw.githubusercontent.com/TCYTseven/penapps24data/refs/heads/main/COF%20Historical%20Data.csv",
            "AAPL": "https://raw.githubusercontent.com/TCYTseven/penapps24data/refs/heads/main/AAPL%20Historical%20Data.csv",
            "NVDA": "https://raw.githubusercontent.com/TCYTseven/penapps24data/refs/heads/main/AAPL%20Historical%20Data.csv",
        }

        input_file_path = file_paths.get(request.name)
        if not input_file_path:
            raise HTTPException(status_code=400, detail=f"No data found for name: {request.name}")

        with tempfile.TemporaryDirectory() as temp_dir:
            print(f"Processing file for: {request.name}")
            temp_file_path = Path(temp_dir) / "input_data.csv"

            response = requests.get(input_file_path)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to download file.")

            with open(temp_file_path, 'wb') as f:
                f.write(response.content)

            original_dir = os.getcwd()
            os.chdir(temp_dir)

            # Assuming the script is in the same directory as this FastAPI file
            script_path = Path(original_dir) / "dataoutput.py"
            shutil.copy2(script_path, temp_dir)

            result = subprocess.run(["python", "dataoutput.py"], capture_output=True, text=True)
            if result.returncode != 0:
                raise HTTPException(status_code=500, detail=f"Script error: {result.stderr}")

            results = {}
            output_files = [
                "stock_price_with_crashes.html",
                "stock_candlestick_chart.html",
                "correlation_heatmap.html",
                "trading_volume.html",
                "crash_periods.json",
                "processed_data.csv"
            ]

            for output_file in output_files:
                file_path = Path(temp_dir) / output_file
                if file_path.exists():
                    if output_file.endswith('.json'):
                        with open(file_path, 'r') as json_file:
                            results[output_file] = json.load(json_file)
                    elif output_file.endswith('.csv'):
                        with open(file_path, 'r') as csv_file:
                            results[output_file] = csv_file.read()
                    else:  # HTML files
                        results[output_file] = str(file_path)  # Just store the file path for now
                else:
                    results[output_file] = f"File not found: {output_file}"

            os.chdir(original_dir)

        return JSONResponse(content=results)

    except Exception as e:
        return JSONResponse(status_code=500, content={"message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)