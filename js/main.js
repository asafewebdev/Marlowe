/* =========================================================================
   MARLOWE - Product Landing Page Behaviour
   ---------------------------------------------------------------------
   Small, dependency-free interactions. Each block is independent, so you
   can delete a feature you don't need without breaking the others.
   ========================================================================= */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Set by the gallery block below; called by the colour-swatch handler to
  // swap the gallery's photo set. Left as a no-op until gallery() runs.
  var renderGalleryColour = function () {};

  /* -----------------------------------------------------------------------
     Announcement bar - cycles through the <li> messages.
     EDIT the interval (ms) below, or delete this block for a static bar.
  ----------------------------------------------------------------------- */
  (function announcementCycle() {
    var items = document.querySelectorAll('.announcement-track li');
    if (items.length < 2 || prefersReducedMotion) return;
    var index = 0;
    setInterval(function () {
      items[index].classList.remove('is-active');
      index = (index + 1) % items.length;
      items[index].classList.add('is-active');
    }, 4500);
  })();

  /* -----------------------------------------------------------------------
     Mobile navigation toggle
  ----------------------------------------------------------------------- */
  (function mobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('mobile-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  })();

  /* -----------------------------------------------------------------------
     Product gallery - one photo set per colourway. EDIT: add/replace
     entries here (and the matching files in images/) to change what
     shows up; front image is used as each colour's swatch preview and
     as the first thumbnail/main photo when that colour is selected.
  ----------------------------------------------------------------------- */
  var GALLERY = {
    latte: [
      { src: 'images/coat-latte-front.jpg', alt: 'Marlowe Faux Fur Coat in Latte, front view' },
      { src: 'images/coat-latte-back.jpg', alt: 'Marlowe Faux Fur Coat in Latte, back view' }
    ],
    winterwhite: [
      { src: 'images/coat-winterwhite-front.jpg', alt: 'Marlowe Faux Fur Coat in Winter White, front view' },
      { src: 'images/coat-winterwhite-back.jpg', alt: 'Marlowe Faux Fur Coat in Winter White, back view' }
    ],
    espresso: [
      { src: 'images/coat-espresso-front.jpg', alt: 'Marlowe Faux Fur Coat in Espresso Black, front view' },
      { src: 'images/coat-espresso-back.jpg', alt: 'Marlowe Faux Fur Coat in Espresso Black, back view' }
    ],
    coffee: [
      { src: 'images/coat-coffee-front.jpg', alt: 'Marlowe Faux Fur Coat in Coffee Brown, front view' },
      { src: 'images/coat-coffee-back.jpg', alt: 'Marlowe Faux Fur Coat in Coffee Brown, back view' }
    ]
  };

  (function gallery() {
    var mainImg = document.getElementById('gallery-main-img');
    var thumbsWrap = document.getElementById('gallery-thumbs');
    if (!mainImg || !thumbsWrap) return;

    function showPhoto(src, alt) {
      mainImg.setAttribute('src', src);
      mainImg.setAttribute('alt', alt);
    }

    // Rebuilds the thumbnail rail for a colourway and shows its first photo.
    function renderColour(colourKey) {
      var photos = GALLERY[colourKey];
      if (!photos || !photos.length) return;

      thumbsWrap.innerHTML = '';
      photos.forEach(function (photo, i) {
        var btn = document.createElement('button');
        btn.className = 'thumb' + (i === 0 ? ' is-active' : '');
        btn.setAttribute('aria-label', 'View ' + (i + 1));
        if (i === 0) btn.setAttribute('aria-current', 'true');
        btn.setAttribute('data-src', photo.src);
        btn.setAttribute('data-alt', photo.alt);

        var img = document.createElement('img');
        img.src = photo.src;
        img.alt = '';
        img.width = 600;
        img.height = 800;
        btn.appendChild(img);

        btn.addEventListener('click', function () {
          thumbsWrap.querySelectorAll('.thumb').forEach(function (t) {
            t.classList.remove('is-active');
            t.removeAttribute('aria-current');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-current', 'true');
          showPhoto(photo.src, photo.alt);
        });

        thumbsWrap.appendChild(btn);
      });

      showPhoto(photos[0].src, photos[0].alt);
    }

    renderGalleryColour = renderColour;
  })();

  /* -----------------------------------------------------------------------
     Wishlist heart toggle (gallery)
  ----------------------------------------------------------------------- */
  (function wishlist() {
    var btn = document.querySelector('.gallery-wishlist');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));
    });
  })();

  /* -----------------------------------------------------------------------
     Colour swatches
  ----------------------------------------------------------------------- */
  (function swatches() {
    var swatchButtons = document.querySelectorAll('.swatch');
    var valueLabel = document.getElementById('selected-colour');
    if (!swatchButtons.length) return;
    swatchButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        swatchButtons.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        if (valueLabel) valueLabel.textContent = btn.getAttribute('data-colour-name') || '';
        renderGalleryColour(btn.getAttribute('data-colour'));
      });
    });
  })();

  /* -----------------------------------------------------------------------
     Size selector + Add to Bag validation
     EDIT: figures below feed the "Product Measurements" box that appears
     once a size is picked - update them to match your actual spec sheet.
  ----------------------------------------------------------------------- */
  var SIZE_MEASUREMENTS = {
    S:  { shoulder: '15.75"', bust: '43.31"', length: '35.43"', sleeve: '24.41"' },
    M:  { shoulder: '16.14"', bust: '44.88"', length: '35.43"', sleeve: '24.41"' },
    L:  { shoulder: '16.54"', bust: '46.46"', length: '35.43"', sleeve: '24.80"' },
    XL: { shoulder: '16.93"', bust: '48.03"', length: '35.43"', sleeve: '25.20"' }
  };

  (function sizeAndBag() {
    var sizeButtons = document.querySelectorAll('.size-btn:not([disabled])');
    var sizeValueLabel = document.getElementById('selected-size');
    var sizeError = document.querySelector('.size-error');
    var addToBagBtn = document.getElementById('add-to-bag');
    var bagCount = document.querySelector('.bag-count');
    var toast = document.getElementById('toast');
    var measurementsBox = document.getElementById('measurements');
    var measurementsSize = document.getElementById('measurements-size');
    var selectedSize = null;

    function renderMeasurements(size) {
      var data = SIZE_MEASUREMENTS[size];
      if (!data || !measurementsBox) return;
      if (measurementsSize) measurementsSize.textContent = 'Size ' + size;
      document.getElementById('measurement-shoulder').textContent = data.shoulder;
      document.getElementById('measurement-bust').textContent = data.bust;
      document.getElementById('measurement-length').textContent = data.length;
      document.getElementById('measurement-sleeve').textContent = data.sleeve;
      measurementsBox.hidden = false;
    }

    sizeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizeButtons.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        selectedSize = btn.textContent.trim();
        if (sizeValueLabel) sizeValueLabel.textContent = selectedSize;
        if (sizeError) sizeError.classList.remove('is-visible');
        renderMeasurements(selectedSize);
      });
    });

    if (addToBagBtn) {
      addToBagBtn.addEventListener('click', function () {
        if (!selectedSize) {
          if (sizeError) sizeError.classList.add('is-visible');
          document.querySelector('.sizes').scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          return;
        }
        // EDIT: replace this with your real add-to-cart call (fetch/AJAX to
        // your cart endpoint, or a call into your ecommerce platform's SDK).
        if (bagCount) {
          var current = parseInt(bagCount.textContent, 10) || 0;
          bagCount.textContent = String(current + 1);
        }
        showToast('Added to your bag, Size ' + selectedSize);
      });
    }

    function showToast(message) {
      if (!toast) return;
      toast.querySelector('.toast-message').textContent = message;
      toast.classList.add('is-visible');
      clearTimeout(showToast._t);
      showToast._t = setTimeout(function () {
        toast.classList.remove('is-visible');
      }, 3200);
    }
  })();

  /* -----------------------------------------------------------------------
     Accordions - Product Details is open by default; Delivery/Returns
     start closed. Works for any element matching this markup pattern.
  ----------------------------------------------------------------------- */
  (function accordions() {
    var triggers = document.querySelectorAll('.accordion-trigger');
    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var panel = document.getElementById(trigger.getAttribute('aria-controls'));
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
        if (panel) panel.classList.toggle('is-open', !isOpen);
      });
    });
  })();

  /* -----------------------------------------------------------------------
     Reviews - "Load more" reveals additional hidden review cards.
     EDIT: swap the [hidden] markup in index.html for your real dataset,
     or replace this block with a fetch() call to your reviews API.
  ----------------------------------------------------------------------- */
  (function reviewsLoadMore() {
    var button = document.getElementById('load-more-reviews');
    if (!button) return;
    button.addEventListener('click', function () {
      var hidden = document.querySelectorAll('.review-card[hidden]');
      var batch = Array.prototype.slice.call(hidden, 0, 3);
      batch.forEach(function (card) { card.removeAttribute('hidden'); });
      if (document.querySelectorAll('.review-card[hidden]').length === 0) {
        button.setAttribute('hidden', '');
      }
    });
  })();

  /* -----------------------------------------------------------------------
     Newsletter signup - front-end only. Wire `action`/fetch to your ESP
     (Klaviyo, Mailchimp, etc.) where marked below.
  ----------------------------------------------------------------------- */
  (function newsletter() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;
    var status = form.querySelector('.newsletter-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // EDIT: send `form` data to your email service provider here.
      if (status) {
        status.textContent = 'Thank you, check your inbox to confirm your subscription.';
        status.classList.add('is-visible');
      }
      form.reset();
    });
  })();

  /* -----------------------------------------------------------------------
     Footer - current year
  ----------------------------------------------------------------------- */
  (function footerYear() {
    var el = document.getElementById('current-year');
    if (el) el.textContent = String(new Date().getFullYear());
  })();

})();
