# Marlowe - Product Landing Page

A single-product landing page for **The Mayfair Belted Faux Fur Coat**, built with
plain HTML, CSS and JavaScript (no build step, no dependencies).

## Files

```
index.html      All page markup and copy
css/styles.css  All styling (design tokens at the top of the file)
js/main.js      Interactions: gallery, swatches, sizes, accordions, reviews, newsletter
```

## Running it locally

Just open `index.html` in a browser - or, for the smoothest experience
(so relative asset paths always resolve), serve the folder locally:

```
npx serve .
```

## What to edit first

1. **Photography** - the product gallery uses real photos, one front/back
   set per colourway, defined in the `GALLERY` object near the top of
   `js/main.js` (files live in `images/coat-<colour>-*.jpg`). Add, reorder
   or replace entries there to change what shows up; clicking a colour
   swatch re-renders the gallery from that data automatically. Suggested
   sizes: product shots 1200×1500px (4:5), thumbnails same ratio.
2. **Price, colours, sizes** - in the `.buybox` block near the top of
   `index.html`. Toggle the `disabled` attribute on a `.size-btn` to mark a
   size out of stock.
3. **Copy** - At a Glance, Description, Product Details & Care, Delivery/Returns
   accordions are all plain text in `index.html`, grouped under clearly
   labelled `<section>`s.
4. **Reviews** - the summary stats (average, count, per-star bars) and each
   `.review-card` are static markup for now. The five kept here are written
   to answer specific buying objections (warmth, price, fit, fur quality,
   whether it matches the photos) - keep that pattern if you add more.
   Swap them for a live feed from your reviews provider (Yotpo, Judge.me,
   Trustpilot, etc.) when ready, or keep hand-curating them. Cards with the
   `hidden` attribute are revealed by "Load more reviews". "Write a Review"
   only adds the submission to this page (see `writeReview()` in
   `js/main.js`) - point it at your reviews provider when you have one.
5. **Colour palette / type** - all design tokens (colours, fonts, spacing)
   live at the top of `css/styles.css` under `:root`, so a re-theme starts
   there.

## Things that are stubbed on purpose

- **Add to Bag** only updates the header bag counter and shows a confirmation
  toast - wire it to your real cart/checkout in `js/main.js`.
- **Newsletter form** shows a success message but doesn't send anywhere -
  point it at your email service provider (Klaviyo, Mailchimp, …).
- **Header search / account** icons and most footer links are placeholder
  `href="#"` anchors - point them at real pages/routes.
- **Payment badges** in the footer are text labels, not brand logos - swap
  for official SVG/PNG badges from each provider before launch.

Every one of these is marked with an `<!-- EDIT: … -->` comment (or `/* EDIT: … */`
in the CSS/JS) at the spot where you'd make the change.
