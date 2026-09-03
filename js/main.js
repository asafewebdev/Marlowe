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
    mink: [
      { src: 'images/coat-mink-front.jpg', alt: 'Marlowe Faux Fur Coat in Mink, front view' },
      { src: 'images/coat-mink-back.jpg', alt: 'Marlowe Faux Fur Coat in Mink, back view' }
    ],
    ivory: [
      { src: 'images/coat-ivory-front.jpg', alt: 'Marlowe Faux Fur Coat in Ivory, front view' },
      { src: 'images/coat-ivory-back.jpg', alt: 'Marlowe Faux Fur Coat in Ivory, back view' }
    ],
    noir: [
      { src: 'images/coat-noir-front.jpg', alt: 'Marlowe Faux Fur Coat in Noir, front view' },
      { src: 'images/coat-noir-back.jpg', alt: 'Marlowe Faux Fur Coat in Noir, back view' }
    ],
    ocelot: [
      { src: 'images/coat-ocelot-front.jpg', alt: 'Marlowe Faux Fur Coat in Ocelot, front view' },
      { src: 'images/coat-ocelot-alt.jpg', alt: 'Marlowe Faux Fur Coat in Ocelot, alternate front view' },
      { src: 'images/coat-ocelot-back.jpg', alt: 'Marlowe Faux Fur Coat in Ocelot, back view' }
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
  ----------------------------------------------------------------------- */
  (function sizeAndBag() {
    var sizeButtons = document.querySelectorAll('.size-btn:not([disabled])');
    var sizeValueLabel = document.getElementById('selected-size');
    var sizeError = document.querySelector('.size-error');
    var addToBagBtn = document.getElementById('add-to-bag');
    var bagCount = document.querySelector('.bag-count');
    var toast = document.getElementById('toast');
    var selectedSize = null;

    sizeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        sizeButtons.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        selectedSize = btn.textContent.trim();
        if (sizeValueLabel) sizeValueLabel.textContent = 'UK ' + selectedSize;
        if (sizeError) sizeError.classList.remove('is-visible');
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
        showToast('Added to your bag, Size UK ' + selectedSize);
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
