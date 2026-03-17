from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # Go to planner
        page.goto("http://localhost:3000/planner")
        page.wait_for_timeout(2000)
        page.screenshot(path="planner_correct.png")

        browser.close()

if __name__ == "__main__":
    verify()
