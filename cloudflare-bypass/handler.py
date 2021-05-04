import json
import cloudscraper

def proxy(event, context):
    url = event["url"]
    scraper = cloudscraper.create_scraper() 
    response = None

    if event.get("method") == "post":
        response = scraper.post(url, json = event["json"])
    else:
        response = scraper.get(url)

    return {
        "statusCode": response.status_code,
        "body": response.text
    }
