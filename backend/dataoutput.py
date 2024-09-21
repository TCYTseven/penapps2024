import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import timedelta
import json
import os
import sys

# Print current working directory and Python version for debugging
print(f"Current working directory: {os.getcwd()}")
print(f"Python version: {sys.version}")

# Create a directory to store outputs
output_dir = 'output_data'
os.makedirs(output_dir, exist_ok=True)

# Create a simple text file for testing
test_file_path = os.path.join(output_dir, 'test_output.txt')
try:
    with open(test_file_path, 'w') as test_file:
        test_file.write("This is a test output file.")
    print(f"Test file created successfully at {test_file_path}")
except Exception as e:
    print(f"Error creating test file: {e}")

# Read the CSV file
try:
    df = pd.read_csv('input_data.csv', parse_dates=['Date'])
    df.set_index('Date', inplace=True)
    print(f"CSV file read successfully. Shape: {df.shape}")
except Exception as e:
    print(f"Error reading CSV file: {e}")
    sys.exit(1)

# Convert 'Change %' to numeric, removing the '%' sign and commas
df['Change %'] = df['Change %'].str.replace(',', '').str.rstrip('%').astype('float') / 100.0

# Convert 'Vol.' to numeric, handling both 'K' and 'M' suffixes
def convert_volume(vol_str):
    if isinstance(vol_str, str):
        vol_str = vol_str.replace(',', '')  # Remove commas
        if vol_str.endswith('K'):
            return float(vol_str[:-1]) * 1_000
        elif vol_str.endswith('M'):
            return float(vol_str[:-1]) * 1_000_000
        elif vol_str.endswith('B'):
            return float(vol_str[:-1]) * 1_000_000_000
    return float(vol_str)

df['Vol.'] = df['Vol.'].apply(convert_volume)

# Calculate daily returns
df['Daily Return'] = df['Price'].pct_change()

# Function to detect market crashes
def detect_crashes(df):
    crashes = []
    for i in range(len(df)):
        if i > 0 and (df['Price'].iloc[i] / df['Price'].iloc[i-1] - 1) <= -0.05:
            crashes.append((df.index[i-1], df.index[i]))
        
        month_ago = df.index[i] - timedelta(days=30)
        past_month_data = df[(df.index > month_ago) & (df.index <= df.index[i])]
        if len(past_month_data) > 0:
            max_price = past_month_data['Price'].max()
            current_price = df['Price'].iloc[i]
            if (current_price / max_price - 1) <= -0.11:
                crashes.append((past_month_data['Price'].idxmax(), df.index[i]))
    
    crashes.sort(key=lambda x: x[0])
    merged = []
    for crash in crashes:
        if not merged or merged[-1][1] < crash[0]:
            merged.append(crash)
        else:
            merged[-1] = (merged[-1][0], max(merged[-1][1], crash[1]))
    
    return merged

# Detect crashes
crashes = detect_crashes(df)

# Function to save JSON safely
def save_json(data, filename):
    try:
        with open(os.path.join(output_dir, filename), 'w') as json_file:
            json.dump(data, json_file, indent=4)
        print(f"File saved successfully: {filename}")
    except Exception as e:
        print(f"Error saving {filename}: {e}")

# Create and save plots (implementation details omitted for brevity)
# ... (Keep your existing plot creation code here)

# Save crash periods to JSON
crash_periods = [{"start": str(start), "end": str(end)} for start, end in crashes]
save_json(crash_periods, 'crash_periods.json')

# Output to CSV
csv_filename = os.path.join(output_dir, 'processed_data.csv')
try:
    df.to_csv(csv_filename)
    print(f"Processed data saved to {csv_filename}")
except Exception as e:
    print(f"Error saving CSV file: {e}")

# Print the contents of the output directory
print("\nContents of the output directory:")
try:
    for file in os.listdir(output_dir):
        file_path = os.path.join(output_dir, file)
        print(f"{file}: {os.path.getsize(file_path)} bytes")
except Exception as e:
    print(f"Error listing directory contents: {e}")

print("\nScript execution completed. Please check the output above for any error messages.")