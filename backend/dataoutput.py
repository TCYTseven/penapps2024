import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import timedelta
import json

# Read the CSV file
df = pd.read_csv('input_data.csv', parse_dates=['Date'])
df.set_index('Date', inplace=True)

# Convert 'Change %' to numeric, removing the '%' sign
df['Change %'] = df['Change %'].str.rstrip('%').astype('float') / 100.0

# Convert 'Vol.' to numeric, handling both 'K' and 'M' suffixes
def convert_volume(vol_str):
    if isinstance(vol_str, str):
        if vol_str.endswith('K'):
            return float(vol_str[:-1]) * 1000
        elif vol_str.endswith('M'):
            return float(vol_str[:-1]) * 1_000_000
    return float(vol_str)

df['Vol.'] = df['Vol.'].apply(convert_volume)

# Calculate daily returns
df['Daily Return'] = df['Price'].pct_change()

# Function to detect market crashes
def detect_crashes(df):
    crashes = []
    for i in range(len(df)):
        # Check for daily crash (-5% drop in a day)
        if i > 0 and (df['Price'].iloc[i] / df['Price'].iloc[i-1] - 1) <= -0.05:
            crashes.append((df.index[i-1], df.index[i]))
        
        # Check for monthly crash (-11% drop in any 1 month time frame)
        month_ago = df.index[i] - timedelta(days=30)
        past_month_data = df[(df.index > month_ago) & (df.index <= df.index[i])]
        if len(past_month_data) > 0:
            max_price = past_month_data['Price'].max()
            current_price = df['Price'].iloc[i]
            if (current_price / max_price - 1) <= -0.11:
                crashes.append((past_month_data['Price'].idxmax(), df.index[i]))
    
    # Merge overlapping periods
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

# Create a line plot of closing prices with crash periods marked in red
fig_line = go.Figure()

# Plot the entire price line in blue
fig_line.add_trace(go.Scatter(x=df.index, y=df['Price'], mode='lines', name='Stock Price', line=dict(color='blue')))

# Overlay crash periods in red
for crash_start, crash_end in crashes:
    mask_crash = (df.index >= crash_start) & (df.index <= crash_end)
    fig_line.add_trace(go.Scatter(x=df.index[mask_crash], y=df['Price'][mask_crash], mode='lines', name='Crash Period', line=dict(color='red', width=2)))

fig_line.update_layout(
    title='Stock Closing Price Over Time (with Crash Periods)',
    xaxis_title='Date',
    yaxis_title='Price',
    showlegend=True
)

fig_line.write_html("stock_price_with_crashes.html")
print("Line plot with crashes saved to stock_price_with_crashes.html")

# Output to CSV
csv_filename = 'processed_data.csv'
df.to_csv(csv_filename)
print(f"Processed data saved to {csv_filename}")

# Create a candlestick chart
fig_candle = go.Figure(data=[go.Candlestick(x=df.index,
                open=df['Open'],
                high=df['High'],
                low=df['Low'],
                close=df['Price'])])
fig_candle.update_layout(title='Stock Candlestick Chart', xaxis_title='Date', yaxis_title='Price')
fig_candle.write_html("stock_candlestick_chart.html")
print("Candlestick chart saved to stock_candlestick_chart.html")

# Create a heatmap of correlations
corr_matrix = df[['Price', 'Open', 'High', 'Low', 'Vol.', 'Change %']].corr()
fig_heatmap = px.imshow(corr_matrix, 
                        labels=dict(color="Correlation"),
                        x=corr_matrix.columns,
                        y=corr_matrix.columns,
                        color_continuous_scale='RdBu_r',
                        aspect="auto")
fig_heatmap.update_layout(title='Correlation Heatmap')
fig_heatmap.write_html("correlation_heatmap.html")
print("Heatmap saved to correlation_heatmap.html")

# Create a volume bar chart
fig_volume = px.bar(df, x=df.index, y='Vol.', title='Trading Volume Over Time')
fig_volume.update_xaxes(title='Date')
fig_volume.update_yaxes(title='Volume')
fig_volume.write_html("trading_volume.html")
print("Volume chart saved to trading_volume.html")

# Display summary statistics
print("\nSummary Statistics:\n")
print(df.describe())

# Show all plots (this will open them in the default web browser)
fig_line.show()
fig_candle.show()
fig_heatmap.show()
fig_volume.show()

# Print detected crash periods
print("\nDetected Crash Periods:")
for start, end in crashes:
    print(f"From {start} to {end}")
    
    crash_periods = [{"start": str(start), "end": str(end)} for start, end in crashes]

json_filename = 'crash_periods.json';
with open (json_filename, 'w') as json_file:
    json.dump(crash_periods, json_file, indent=4);
    