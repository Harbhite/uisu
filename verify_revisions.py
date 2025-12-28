from playwright.sync_api import sync_playwright, expect
import time

def verify_homepage_layout(page):
    print("Navigating to homepage...")
    page.goto("http://localhost:8080")

    # Wait for hydration
    page.wait_for_load_state("networkidle")
    time.sleep(2)  # Extra buffer for animations

    # 1. Verify Quick Links visibility
    # Should be hidden on mobile viewport
    print("Checking Mobile Viewport...")
    page.set_viewport_size({"width": 375, "height": 667})
    time.sleep(1)

    # Use a more specific selector for the "Quick Links" text container or trigger
    # Note: In the code, the DropdownMenuTrigger has "Quick Links" text.
    # The parent div has class "hidden md:block".
    # So "Quick Links" text should NOT be visible.
    quick_links = page.get_by_text("Quick Links", exact=False)

    # We expect it to be hidden. However, get_by_text might find it in the DOM even if hidden.
    # .be_visible() checks if it's painted and not hidden by styles.
    if quick_links.count() > 0:
         # It might find the footer quick links too! Footer has "Quick Links" header.
         # The Navbar one is inside a button/trigger.
         navbar_quick_links = page.locator("button").filter(has_text="Quick Links")
         expect(navbar_quick_links).not_to_be_visible()
         print("SUCCESS: Navbar Quick Links hidden on mobile.")

    # Check Desktop Viewport
    print("Checking Desktop Viewport...")
    page.set_viewport_size({"width": 1280, "height": 800})
    time.sleep(1)

    navbar_quick_links = page.locator("button").filter(has_text="Quick Links")
    expect(navbar_quick_links).to_be_visible()
    print("SUCCESS: Navbar Quick Links visible on desktop.")

    # 2. Verify Executives Section Position
    # It should be at the bottom, after Trivia.
    # We can check order by bounding boxes or by verifying it exists and taking a screenshot of the bottom.

    print("Scrolling to bottom...")
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(2)

    # Verify "Meet The Executives" heading is visible
    execs_heading = page.get_by_role("heading", name="Meet The Executives")
    expect(execs_heading).to_be_visible()
    print("SUCCESS: 'Meet The Executives' section found.")

    # Verify we see more than 4 cards (since we removed slice)
    # The cards likely have some common class or we can count unique names if we know them,
    # or just count the 'LeaderCard' instances if they have a specific test id,
    # but here we can count elements with a known structure.
    # Let's count elements that look like cards in that section.
    # Assuming LeaderCard renders an image or a specific name format.
    # Let's just take a screenshot and manually verify the count/layout.

    print("Taking screenshot of bottom section...")
    page.screenshot(path="/home/jules/verification/homepage_bottom_execs.png")

    # Also verify it is AFTER Trivia
    # Trivia section has "Test Your Knowledge".
    trivia_heading = page.get_by_role("heading", name="Test Your Knowledge")

    trivia_box = trivia_heading.bounding_box()
    execs_box = execs_heading.bounding_box()

    if trivia_box and execs_box:
        if execs_box['y'] > trivia_box['y']:
             print("SUCCESS: Executives section is below Trivia section.")
        else:
             print(f"FAILURE: Executives section (y={execs_box['y']}) is NOT below Trivia section (y={trivia_box['y']}).")
    else:
        print("WARNING: Could not determine bounding boxes for order verification.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_homepage_layout(page)
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
