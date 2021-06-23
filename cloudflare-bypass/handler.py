from email import header
import cloudscraper

def proxy(event, context):
    url = event["url"]
    scraper = cloudscraper.create_scraper() 
    response = None
    headers = event.get("headers")

    print(url)
    print(headers)

    if event.get("method") == "post":
        response = scraper.post(url, json = event["json"], headers = headers)
    else:
        response = scraper.get(url, headers = headers)

    return {
        "statusCode": response.status_code,
        "body": response.text
    }
