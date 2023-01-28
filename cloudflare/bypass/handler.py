from email import header
import cloudscraper

def proxy(event, context):
    url = event["url"]
    scraper = cloudscraper.create_scraper() 
    response = None
    headers = event.get("headers")

    # print(event)

    if event.get("method") == "post":
        response = scraper.post(url, data=event["body"], headers = headers)
    else:
        response = scraper.get(url, headers = headers)

    return {
        "statusCode": response.status_code,
        "text": response.text
    }
