from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto('http://localhost:3000')
    page.wait_for_timeout(2000)
    page.screenshot(path='confirmation.png', full_page=True)
    browser.close()
