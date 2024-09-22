import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import tempfile
import shutil
from pathlib import Path
import subprocess
import requests
import json
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
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
            "cof": "https://raw.githubusercontent.com/TCYTseven/penapps24data/refs/heads/main/cof_data.csv",
            "aapl": "https://raw.githubusercontent.com/TCYTseven/penapps24data/refs/heads/main/aapl_data.csv",
            "nvda": "https://raw.githubusercontent.com/TCYTseven/penapps24data/refs/heads/main/nvda_data.csv",
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

            script_path = Path(original_dir) / "dataoutput.py"
            if not script_path.exists():
                raise FileNotFoundError(f"dataoutput.py not found at {script_path}")
            shutil.copy2(script_path, temp_dir)

            # Run the subprocess with output redirection
            result = subprocess.run(["python", "dataoutput.py"], capture_output=True, text=True)
            print(f"Subprocess stdout: {result.stdout}")
            print(f"Subprocess stderr: {result.stderr}")

            if result.returncode != 0:
                error_message = f"Script error: {result.stderr}\nOutput: {result.stdout}"
                raise HTTPException(status_code=500, detail=error_message)

            results = {}
            
            # Check for the test file
            test_file_path = Path(temp_dir) / "output_data" / "test_output.txt"
            if test_file_path.exists():
                with open(test_file_path, 'r') as test_file:
                    results['test_output'] = test_file.read()
            else:
                results['test_output'] = "Test file not found"

            output_files = [
                "stock_price_with_crashes.json",
                "stock_candlestick_chart.json",
                "correlation_heatmap.json",
                "trading_volume.json",
                "crash_periods.json",
                "processed_data.csv"
            ]
            
            #data is in CSV now. 

            for output_file in output_files:
                temp_file_path = Path(temp_dir) / "output_data" / output_file
                if temp_file_path.exists():
                    permanent_file_path = Path(original_dir) / "output_data" / output_file
                    permanent_file_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(temp_file_path, permanent_file_path)
                    print(f"Copied {output_file} to permanent location: {permanent_file_path}")
                    
                    try:
                        if output_file.endswith('.json'):
                            with open(permanent_file_path, 'r') as json_file:
                                results[output_file] = json.load(json_file)
                        elif output_file.endswith('.csv'):
                            with open(permanent_file_path, 'r') as csv_file:
                                results[output_file] = csv_file.read()
                    except Exception as e:
                        results[output_file] = f"Error reading file: {str(e)}"
                else:
                    results[output_file] = f"File not found: {output_file}"

            os.chdir(original_dir)

        return JSONResponse(content=results)

    except Exception as e:
        error_detail = {
            "message": str(e),
            "traceback": traceback.format_exc()
        }
        print(f"Error occurred: {error_detail}")  # Console logging
        return JSONResponse(status_code=500, content=error_detail)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")