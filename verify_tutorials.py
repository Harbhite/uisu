from playwright.sync_api import sync_playwright

def verify_tutorials():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # 1. Landing Page
            print("Navigating to Landing Page...")
            page.goto("http://localhost:8080/tutorials")
            page.wait_for_selector("text=Master Your Studies")
            print("Landing page loaded.")
            page.screenshot(path="tutorials_landing.png")

            # 2. Catalog Page
            print("Navigating to Catalog Page...")
            page.click("text=Browse Catalog")
            page.wait_for_selector("text=Browse Catalog")
            print("Catalog page loaded.")
            page.screenshot(path="tutorials_catalog.png")

            # 3. Detail Page
            print("Navigating to a Tutorial...")
            page.click("text=GST 101: Use of English Masterclass") # Assuming this title exists in catalog
            page.wait_for_selector("text=Introduction to Parts of Speech")
            print("Detail page loaded.")
            page.screenshot(path="tutorials_detail.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_tutorials()
