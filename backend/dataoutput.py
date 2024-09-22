import pandas as pd
import plotly.graph_objects as go
from datetime import timedelta
import json
import os
import sys
import csv
import plotly.io as pio

# Print current working directory and Python version for debugging
print(f"Current working directory: {os.getcwd()}")
print(f"Python version: {sys.version}")

# Create a directory to store outputs
output_dir = os.path.abspath('C:\\Users\\zheng\\OneDrive\\Desktop\\Hackathon\\penapps2024\\backend\\output_data')
os.makedirs(output_dir, exist_ok=True)
print(f"Output directory: {output_dir}")

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
    full_path = os.path.join(output_dir, filename)
    try:
        with open(full_path, 'w') as json_file:
            json.dump(data, json_file, indent=4, default=str)
        print(f"File saved successfully: {full_path}")
    except Exception as e:
        print(f"Error saving {full_path}: {e}")

# Stock price with crashes
fig = go.Figure()

# Plot the entire price line in blue
fig.add_trace(go.Scatter(x=df.index, y=df['Price'], mode='lines', name='Stock Price', line=dict(color='blue')))

# Overlay crash periods in red
for crash_start, crash_end in crashes:
    mask_crash = (df.index >= crash_start) & (df.index <= crash_end)
    fig.add_trace(go.Scatter(x=df.index[mask_crash], y=df['Price'][mask_crash], mode='lines', name='Crash Period', line=dict(color='red', width=2)))

fig.update_layout(
    title='Stock Closing Price Over Time (with Crash Periods)',
    xaxis_title='Date',
    yaxis_title='Price',
    showlegend=True
)

# Create output directory if it doesn't exist
output_dir = os.path.abspath('C:\\Users\\zheng\\OneDrive\\Desktop\\Hackathon\\penapps2024\\backend\\output_data')
os.makedirs(output_dir, exist_ok=True)

# Save the figure as HTML
html_path = os.path.join(output_dir, 'stock_price_with_crashes.html')
fig.write_html(html_path)
print(f"Stock price with crashes graph saved to {html_path}")

# Save crash periods to CSV with full row data for start and end dates
crash_periods_csv = os.path.join(output_dir, 'crash_periods.csv')

try:
    with open(crash_periods_csv, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Date', 'Price', 'Open', 'High', 'Low', 'Vol.', 'Change %'])  # Update with your desired columns
        
        for crash_start, crash_end in crashes:
            # Get all rows that are part of the crash period
            mask_crash = (df.index >= crash_start) & (df.index <= crash_end)
            crash_rows = df[mask_crash]

            # Write each row in the crash period to the CSV
            for index, row in crash_rows.iterrows():
                writer.writerow([index, row['Price'], row['Open'], row['High'], row['Low'], row['Vol.'], row['Change %']])

    print(f"Crash periods with full data successfully written to {crash_periods_csv}")
except Exception as e:
    print(f"Error writing crash periods CSV: {e}")

# Verify the crash_periods.csv file was created
if os.path.exists(crash_periods_csv):
    print(f"Verified: {crash_periods_csv} exists")
    print(f"File size: {os.path.getsize(crash_periods_csv)} bytes")
else:
    print(f"Error: {crash_periods_csv} was not created")

# Output processed data to CSV
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