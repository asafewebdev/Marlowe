/* =========================================================================
   MARLOWE - Product Landing Page Behaviour
   ---------------------------------------------------------------------
   Small, dependency-free interactions. Each block is independent, so you
   can delete a feature you don't need without breaking the others.
   ========================================================================= */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     Product gallery - thumbnail click swaps the main image placeholder.
     When you wire up real photos, give each thumbnail a data-full-src
     (or data-full-label) and swap the <img>/label on the main image here.
  ----------------------------------------------------------------------- */
  (function gallery() {
    var thumbs = document.querySelectorAll('.thumb');
    var main = document.querySelector('.gallery-main .ph');
    if (!thumbs.length || !main) return;
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('is-active'); t.removeAttribute('aria-current'); });
        thumb.classList.add('is-active');
        thumb.setAttribute('aria-current', 'true');
        var label = thumb.getAttribute('data-full-label');
        if (label) main.setAttribute('data-label', label);
      });
    });
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
