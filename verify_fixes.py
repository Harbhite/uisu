from playwright.sync_api import sync_playwright

def verify_fixes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # 1. Check Governance Page Accordions
        print("Navigating to Governance...")
        page.goto("http://localhost:8080/governance")

        print("Clicking Committees tab...")
        page.click("button:has-text('Committees')")

        # Open Executive
        print("Opening Executive Committees...")
        page.click("button:has-text('Executive Committees')")

        print("Waiting for Student Welfare Board visibility...")
        page.wait_for_selector("text=Student Welfare Board", state="visible")
        page.screenshot(path="/home/jules/verification/governance_fixed.png")

        # 2. Check Committee Detail Page
        print("Clicking Student Welfare Board...")
        page.click("text=Student Welfare Board")

        print("Verifying Committee Detail...")
        print(f"URL: {page.url}")

        try:
            page.wait_for_selector("h1:has-text('Student Welfare Board')", timeout=5000)
            print("Found H1.")
        except Exception as e:
            print(f"Error checking H1: {e}")
            raise

        # Check for Chairperson and Secretary
        print("Checking for Chairperson section...")
        page.wait_for_selector("text=Chairperson")

        print("Checking for Secretary section...")
        page.wait_for_selector("text=Secretary")

        page.screenshot(path="/home/jules/verification/committee_detail_leadership.png")
        print("Verification successful.")
        browser.close()

if __name__ == "__main__":
    verify_fixes()
