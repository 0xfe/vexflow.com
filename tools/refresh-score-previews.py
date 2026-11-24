# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.56.0", "pymupdf==1.26.7", "scour==0.38.2"]
# ///
"""Refresh the font-independent Ballade previews from a running local site."""

import argparse
from pathlib import Path

import pymupdf
from playwright.sync_api import sync_playwright
from scour import scour


def optimize(svg):
    options = scour.parse_args([
        "--set-precision=5", "--strip-xml-prolog", "--enable-id-stripping",
        "--shorten-ids", "--remove-metadata", "--indent=none",
    ])
    return scour.scourString(svg, options=options)


def capture(browser, url, width):
    page = browser.new_page(viewport={"width": width, "height": 900})
    try:
        page.goto(url, wait_until="domcontentloaded")
        score = page.locator('#score-0 svg[role="img"]')
        score.wait_for()
        # Print the exact live engraving, with its loaded fonts, in its own coordinate space.
        size = score.evaluate("""svg => {
          const {width, height} = svg.viewBox.baseVal;
          document.body.replaceChildren(svg);
          const style = document.createElement('style');
          style.textContent = `@page {size: ${width}px ${height}px; margin: 0}
            html,body {margin: 0; padding: 0} svg {display: block; width: ${width}px; height: ${height}px}`;
          document.head.append(style);
          return {width, height};
        }""")
        with pymupdf.open(stream=page.pdf(prefer_css_page_size=True), filetype="pdf") as document:
            if len(document) != 1:
                raise ValueError(f"Expected a single sheet at {size}")
            svg = document[0].get_svg_image(text_as_path=True)
            return optimize(svg)
    finally:
        page.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", nargs="?", default="http://localhost:8091/")
    args = parser.parse_args()
    destination = Path(__file__).resolve().parents[1] / "src/examples/previews"
    destination.mkdir(exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        for layout, width in [("wide", 1200), ("compact", 390)]:
            (destination / f"ballade-{layout}.svg").write_text(capture(browser, args.url, width))
        browser.close()
