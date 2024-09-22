import functions_framework
import requests
from bs4 import BeautifulSoup
from cerebras.cloud.sdk import Cerebras
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import jsonify

CEREBRAS_API_KEY = "csk-f3fw68rhp2epcddv4cc4958y2mem4ethxe8wrxenrem99x8x"
EMAIL_PASSWORD = "QFBaeifnSiosgfn#&83"
RECEIVER_EMAIL = "venturesbytejas@gmail.com"

urls = [
    "https://news.bloomberglaw.com/banking-law/capital-one-discover-deal-hits-roadblock-in-bank-merger-overhaul",
    "https://accountable.us/watchdog-updated-doj-and-fdic-bank-merger-guidance-should-be-immediately-applied-to-capital-one-discover-merger/",
    "https://www.investors.com/ibd-data-stories/stocks-with-rising-relative-price-strength-capital-one-financial-3/",
    "https://www.benzinga.com/insights/analyst-ratings/24/09/40963707/the-analyst-landscape-5-takes-on-capital-one-finl",
    "https://www.bankrate.com/credit-cards/news/get-mlb-perks-with-your-capital-one-card/",
    "https://thriftytraveler.com/news/credit-card/capital-one-extends-hertz-elite-benefits/",
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def scrape_article(url):
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        content = soup.get_text()
        return content.strip()
    else:
        return f"Failed to fetch content from {url} with status code {response.status_code}"

def send_email(receiver_email, article_title_list, article_summary_output_list, article_sentiment_output_list, urls):
    sender_email = "knowtionreport@outlook.com"
    sender_display_name = "Knowtions <knowtionreport@outlook.com>"
    password = EMAIL_PASSWORD

    message = MIMEMultipart("alternative")
    message["Subject"] = "Knowtions' Sentiment Report — Capital One"
    message["From"] = sender_display_name
    message["To"] = receiver_email

    plain_text_content = ""
    for i in range(len(article_title_list)):
        plain_text_content += f"{article_title_list[i]}\n"
        plain_text_content += f"{urls[i]}\n"
        plain_text_content += f"{article_summary_output_list[i]}\n\n"

    html_content = """
    <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 20px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
        
            <h2 style="font-size: 2em; color: #9b6df5; text-align: center;">
                <a href="http://localhost:3000" style="text-decoration: none; color: #9b6df5;">Knowtions' Sentiment Report</a>
            </h2>
            <h2 style="font-size: 1.8em; color: #9b6df5; text-align: center; margin-bottom: 15px;">
                <a href="http://localhost:3000" style="text-decoration: none; color: #9b6df5;">Capital One</a>
            </h2>
    """
    for i in range(len(article_title_list)):
        html_content += f"""
        <div style="margin-bottom: 30px; padding: 20px; background-color: #fafafa; border-radius: 20px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="font-size: 1.8em; margin-bottom: 10px; color: #9b6df5;">
                <a href="{urls[i]}" style="text-decoration: none; color: #9b6df5;">{article_title_list[i]}</a>
            </h2>
            <p style="font-style: italic; font-size: 1em; margin-bottom: 10px; color: #666666;">
                Article Positivity: {article_sentiment_output_list[i]}
            </p>
            <p style="font-size: 1em; line-height: 1.6; margin-bottom: 15px; color: #666666;">
                {article_summary_output_list[i]}
            </p>
            <a href="{urls[i]}" style="display: inline-block; padding: 10px 20px; background-color: #9b6df5; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 1em;">Read More</a>
        </div>
        """
    html_content += """
        <a href="http://localhost:3000">
            <img src="https://drive.google.com/uc?export=view&id=11lS2HuXsP2Uq_ZCG4Glr0QRua3Crdp8c" alt="Logo" style="width: auto; height: 40;">
        </a>
        <footer style="margin-top: 20px; text-align: center; font-size: 0.8em; color: #999999;">
            <p>&copy; 2024 Knowtions. All Rights Reserved.</p>
        </footer>
                </div>
        </body>
    </html>
    """

    part1 = MIMEText(plain_text_content, "plain")
    part2 = MIMEText(html_content, "html")
    message.attach(part1)
    message.attach(part2)

    try:
        server = smtplib.SMTP("smtp.office365.com", 587)
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")

@functions_framework.http
def main(request):
    """
    Cloud Function to handle both GET and POST requests without requiring any body data.
    This function executes even if no data is passed.
    """
    if request.method == 'POST' or request.method == 'GET':
        articles = [scrape_article(url) for url in urls]

        client = Cerebras(api_key="csk-f3fw68rhp2epcddv4cc4958y2mem4ethxe8wrxenrem99x8x")
        
        article_summary_output_list = []
        article_sentiment_output_list = []
        
        for article in articles:
            chat_completion = client.chat.completions.create(
                messages=[{
                    "role": "user",
                    "content": f"Give a brief 4 sentence explanation of the article in terms of how it relates to their company's financial success to Capital One as if they are reading what you are writing and they want a brief understanding of the sentiment via the summarized details of the article. Explain it almost as how a stock trader and consumer might see this. DO NOT REFERENCE/SAY THAT YOU ARE WRITING A SUMMARY OR EXPLANATION OR 4 SENTENCES UNDER ANY CIRCUMSTANCES—SIMPLY OUTPUT THE EXPLANATION BY ITSELF. Article: {article}",                }],
                temperature=.2,
                model="llama3.1-70b",
            )
            article_summary_output_list.append(chat_completion.choices[0].message.content)
        
        for article in articles:
            chat_completion = client.chat.completions.create(
                messages=[{
                    "role": "user",
                    "content": f"Estimate the public stock sentiment from a scale of 1% to 100% with 1% being the worst for Capital One's stock and 100% being the best for Capital One's stock. ONLY OUTPUT THE NUMBER FOLLOWED BY %. Article: {article}",
                }],
                temperature=.2,
                model="llama3.1-70b",
            )
            article_sentiment_output_list.append(chat_completion.choices[0].message.content)

        article_title_list = [
            "Capital One-Discover Deal Hits Roadblock in Bank Merger Overhaul",
            "Watchdog: DOJ & FDIC Guidance Should Apply to Capital One-Discover Merger",
            "Stocks With Rising Relative Price Strength: Capital One",
            "Analyst Landscape: 5 Takes On Capital One",
            "Capital One MLB Perks",
            "Capital One Extends Hertz Elite Benefits"
        ]
        
        send_email(RECEIVER_EMAIL, article_title_list, article_summary_output_list, article_sentiment_output_list, urls)
        
        return jsonify({"message": "Cloud function executed successfully!"}), 200

    else:
        return jsonify({"error": "Method not allowed"}), 405
