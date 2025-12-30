from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # We expect a redirect to auth page since we are not logged in,
            # but getting there means the route exists and App.tsx didn't crash.
            response = page.goto("http://localhost:8080/admin/inks-vault/new", timeout=30000)
            print(f"Status: {response.status}")
            print(f"URL: {page.url}")

            # Wait a bit for any redirects or renders
            time.sleep(2)

            page.screenshot(path="verification/editor_route.png")
            print("Screenshot taken")
        except Exception as e:
            print(f"Error: {e}")

        browser.close()

if __name__ == "__main__":
    run()
