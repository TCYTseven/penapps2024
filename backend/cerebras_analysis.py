import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()
api_key = os.getenv("CEREBRAS_API_KEY")

client = Cerebras(
    api_key=api_key,
)

company_name = "Capital One"
vector_dates_list = ["1/25/2001", "5/12/2008"]
vector_dates_string = ",".join(vector_dates_list)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": f"Find the top 3 financial metric indicators of {company_name}’s stock crashing on the dates {vector_dates_string} based on reputable financial articles at the time. Don't use bold font. ONLY OUTPUT 3 TOTAL of the most relevant indicators for all given dates; say NOTHING ELSE (no numbers and no abbreviations like (ROE)). List the three financial indicators then the three publishers of the financial articles by comma.",
        }
    ],
    temperature=.2,
    model="llama3.1-70b",
)

output_string = chat_completion.choices[0].message.content

output_list = output_string.split(", ")

top_indicators = output_list[:3]

financial_sources = output_list[3:]

chat_completion_1 = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": f"Elaborate in a 4 sentences on why these top 3 financial metric indicators—{output_string}—of {company_name}’s stock crashing on the dates, {vector_dates_string}, based on reputable financial articles at the time. DO NOT REFERENCE THAT YOU ARE WRITING A SUMMARY.",
        }
    ],
    temperature=.2,
    model="llama3.1-70b",
)

summary = chat_completion_1.choices[0].message.content

print('Top Indicators: '+(', ').join(top_indicators))

print('Sources: ' + (', ').join(financial_sources))

print('Summary: '+summary)
