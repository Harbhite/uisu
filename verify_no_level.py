import re
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        print("Navigating to Current Leaders page...")
        page.goto("http://localhost:8080/current-leaders")

        try:
            page.wait_for_selector("h2:has-text('Honourable Members')", timeout=10000)
            print("Page loaded.")
        except:
            print("Timeout waiting for page load.")
            browser.close()
            return

        page.locator("h2:has-text('Honourable Members')").scroll_into_view_if_needed()
        time.sleep(2)

        # Verify Headers - target the sticky header specifically
        header_locator = page.locator("div.hidden.md\\:grid.grid-cols-12.bg-ui-blue.sticky")
        if header_locator.count() > 0:
            desktop_headers = header_locator.inner_text()
            print(f"Desktop Headers found: {desktop_headers}")

            if "Level" in desktop_headers:
                print("FAILED: 'Level' found in desktop headers.")
            else:
                print("SUCCESS: 'Level' NOT found in desktop headers.")
        else:
             print("FAILED: Header locator not found.")

        # Verify Search Placeholder
        search_input = page.locator("input[placeholder*='Search']")
        if search_input.count() > 0:
            placeholder = search_input.get_attribute("placeholder")
            print(f"Search placeholder: {placeholder}")
            if "Level" in placeholder or "level" in placeholder:
                 print("FAILED: 'Level' found in search placeholder.")
            else:
                 print("SUCCESS: 'Level' NOT found in search placeholder.")

        browser.close()

if __name__ == "__main__":
    run()
