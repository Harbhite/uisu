from playwright.sync_api import sync_playwright

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Check 404
        print("Navigating to /random-path...")
        page.goto("http://localhost:8080/random-path")
        try:
            page.wait_for_selector("text=404", timeout=3000)
            print("404 Page confirmed (or at least not Governance).")
        except:
            print("404 check failed. Content:")
            print(page.inner_text("body")[:500])

        browser.close()

if __name__ == "__main__":
    verify_fixes()
