import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()
api_key = os.getenv("CEREBRAS_API_KEY")

client = Cerebras(
    api_key=api_key,
)

company_name = "Capital One"
vector_dates = ["1/25/2001", "5/12/2008"]

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": f"Find the top 3 financial metric indicators of {company_name}’s stock crashing on {vector_dates} based on reputable financial articles at the time. Don't use bold font. ONLY OUTPUT 3 TOTAL of the most relevant indicators for all given dates; say NOTHING ELSE (no numbers and no abbreviations like (ROE)). List the three financial indicators then the three publishers of the financial articles by comma.",
        }
    ],
    temperature=.2,
    model="llama3.1-70b",
)

output_string = chat_completion.choices[0].message.content

output_list = output_string.split(", ")

top_indicators = output_list[:3]

financial_sources = output_list[3:]

print(top_indicators)

print(financial_sources)