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

  // Set by the bag drawer block below; called by Add to Bag with the
  // selected variant. Left as a no-op until that block runs.
  var addToCart = function () {};

  // Small pill notification, used for secondary confirmations (removing a
  // bag item) - adding an item opens the bag drawer instead, which is
  // confirmation enough on its own.
  var toastEl = document.getElementById('toast');
  function showToast(message) {
    if (!toastEl) return;
    toastEl.querySelector('.toast-message').textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 3200);
  }

  /* -----------------------------------------------------------------------
     Pre-Fall Sale countdown - EDIT this date/time to run a new promotion.
     No timezone suffix, so it's read in the visitor's local time, same as
     the rest of the checkout experience.
  ----------------------------------------------------------------------- */
  var SALE_END_DATE = "2026-09-23T23:59:00";

  (function saleCountdown() {
    var daysEl = document.getElementById('cd-days');
    var hoursEl = document.getElementById('cd-hours');
    var minsEl = document.getElementById('cd-mins');
    var secsEl = document.getElementById('cd-secs');
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    var endTime = new Date(SALE_END_DATE).getTime();
    var timerId;

    function pad(n) { return n < 10 ? '0' + n : String(n); }

    function tick() {
      var remaining = endTime - Date.now();

      // At zero, freeze on 00:00:00:00 - this is visual only. It never
      // touches the price and never loops back to a fresh countdown.
      if (remaining <= 0) {
        daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = '00';
        clearInterval(timerId);
        return;
      }

      var totalSeconds = Math.floor(remaining / 1000);
      daysEl.textContent = pad(Math.floor(totalSeconds / 86400));
      hoursEl.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
      minsEl.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
      secsEl.textContent = pad(totalSeconds % 60);
    }

    tick();
    timerId = setInterval(tick, 1000);
  })();

  /* -----------------------------------------------------------------------
     Site nav (strip 3) - "Menu" toggle below 700px; closes itself again
     once a link is picked, since the click is about to scroll the page
     anyway. Also opens the Delivery accordion when its nav link is used,
     so landing there shows the actual delivery info, not a collapsed row.
  ----------------------------------------------------------------------- */
  (function siteNav() {
    var toggle = document.getElementById('site-nav-toggle');
    var links = document.getElementById('site-nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var isOpen = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
      links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          links.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    var deliveryLink = document.getElementById('nav-delivery-link');
    var deliveryTrigger = document.querySelector('#delivery .accordion-trigger');
    if (deliveryLink && deliveryTrigger) {
      deliveryLink.addEventListener('click', function () {
        if (deliveryTrigger.getAttribute('aria-expanded') !== 'true') {
          deliveryTrigger.click();
        }
      });
    }
  })();

  /* -----------------------------------------------------------------------
     Product gallery - one photo set per colourway. EDIT: add/replace
     entries here (and the matching files in images/) to change what
     shows up; front image is used as each colour's swatch preview and
     as the first thumbnail/main photo when that colour is selected.
  ----------------------------------------------------------------------- */
  var GALLERY = {
    coffee: [
      { src: 'images/coat-coffee-front.jpg', alt: 'Marlowe Faux Fur Coat in Coffee Brown, front view' },
      { src: 'images/coat-coffee-back.jpg', alt: 'Marlowe Faux Fur Coat in Coffee Brown, back view' }
    ],
    winterwhite: [
      { src: 'images/coat-winterwhite-front.jpg', alt: 'Marlowe Faux Fur Coat in Winter White, front view' },
      { src: 'images/coat-winterwhite-back.jpg', alt: 'Marlowe Faux Fur Coat in Winter White, back view' }
    ],
    espresso: [
      { src: 'images/coat-espresso-front.jpg', alt: 'Marlowe Faux Fur Coat in Espresso Black, front view' },
      { src: 'images/coat-espresso-back.jpg', alt: 'Marlowe Faux Fur Coat in Espresso Black, back view' }
    ],
    latte: [
      { src: 'images/coat-latte-front.jpg', alt: 'Marlowe Faux Fur Coat in Latte, front view' },
      { src: 'images/coat-latte-back.jpg', alt: 'Marlowe Faux Fur Coat in Latte, back view' }
    ]
  };

  (function gallery() {
    var mainImg = document.getElementById('gallery-main-img');
    var thumbsWrap = document.getElementById('gallery-thumbs');
    var prevBtn = document.getElementById('gallery-prev');
    var nextBtn = document.getElementById('gallery-next');
    if (!mainImg || !thumbsWrap) return;

    var currentPhotos = [];
    var currentIndex = 0;

    // Shows photo `i` of the active colourway and syncs the thumbnail
    // rail's active state. Used by both thumbnail clicks and the arrows.
    function showIndex(i) {
      if (!currentPhotos.length) return;
      currentIndex = (i + currentPhotos.length) % currentPhotos.length;
      var photo = currentPhotos[currentIndex];
      mainImg.setAttribute('src', photo.src);
      mainImg.setAttribute('alt', photo.alt);
      thumbsWrap.querySelectorAll('.thumb').forEach(function (t, idx) {
        var isActive = idx === currentIndex;
        t.classList.toggle('is-active', isActive);
        if (isActive) t.setAttribute('aria-current', 'true');
        else t.removeAttribute('aria-current');
      });
    }

    // Rebuilds the thumbnail rail for a colourway and shows its first photo.
    function renderColour(colourKey) {
      var photos = GALLERY[colourKey];
      if (!photos || !photos.length) return;
      currentPhotos = photos;

      thumbsWrap.innerHTML = '';
      photos.forEach(function (photo, i) {
        var btn = document.createElement('button');
        btn.className = 'thumb';
        btn.setAttribute('aria-label', 'View ' + (i + 1));
        btn.setAttribute('data-src', photo.src);
        btn.setAttribute('data-alt', photo.alt);

        var img = document.createElement('img');
        img.src = photo.src;
        img.alt = '';
        img.width = 600;
        img.height = 800;
        btn.appendChild(img);

        btn.addEventListener('click', function () { showIndex(i); });

        thumbsWrap.appendChild(btn);
      });

      showIndex(0);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { showIndex(currentIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { showIndex(currentIndex + 1); });

    // Render the default colourway on load so the arrows have photos to
    // cycle through immediately (the static HTML thumbs are a no-JS
    // fallback and get rebuilt here to match).
    var activeSwatch = document.querySelector('.swatch.is-active');
    renderColour(activeSwatch ? activeSwatch.getAttribute('data-colour') : 'latte');

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
        syncStickyBagBar();
      });
    });
  })();

  /* -----------------------------------------------------------------------
     Sticky Add to Bag bar (mobile) - mirrors the buybox's selected colour
     and price, and its button just clicks the real Add to Bag button so
     it reuses the exact same size validation / add-to-cart flow.
  ----------------------------------------------------------------------- */
  var syncStickyBagBar = function () {};
  (function stickyBagBar() {
    var swatchDot = document.getElementById('sticky-bag-swatch');
    var colourLabel = document.getElementById('sticky-bag-colour');
    var priceLabel = document.getElementById('sticky-bag-price');
    var stickyBtn = document.getElementById('sticky-add-to-bag');
    var mainBtn = document.getElementById('add-to-bag');
    if (!swatchDot || !stickyBtn || !mainBtn) return;

    syncStickyBagBar = function () {
      var activeSwatch = document.querySelector('.swatch.is-active');
      var priceNowEl = document.querySelector('.price-now');
      if (activeSwatch) {
        swatchDot.setAttribute('data-colour', activeSwatch.getAttribute('data-colour') || '');
        if (colourLabel) colourLabel.textContent = activeSwatch.getAttribute('data-colour-name') || '';
      }
      if (priceLabel && priceNowEl) priceLabel.textContent = priceNowEl.textContent;
    };
    syncStickyBagBar();

    stickyBtn.addEventListener('click', function () { mainBtn.click(); });
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
    var measurementsBox = document.getElementById('measurements');
    var measurementsSize = document.getElementById('measurements-size');
    var measurementsPlaceholder = document.getElementById('measurements-placeholder');
    var measurementsGrid = document.getElementById('measurements-grid');
    var selectedSize = null;

    function renderMeasurements(size) {
      var data = SIZE_MEASUREMENTS[size];
      if (!data || !measurementsBox) return;
      if (measurementsSize) measurementsSize.textContent = 'Size ' + size;
      document.getElementById('measurement-shoulder').textContent = data.shoulder;
      document.getElementById('measurement-bust').textContent = data.bust;
      document.getElementById('measurement-length').textContent = data.length;
      document.getElementById('measurement-sleeve').textContent = data.sleeve;
      if (measurementsPlaceholder) measurementsPlaceholder.hidden = true;
      if (measurementsGrid) measurementsGrid.hidden = false;
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
        // your cart endpoint, or a call into your ecommerce platform's SDK)
        // - addToCart only keeps state in memory, for the bag drawer.
        var activeSwatch = document.querySelector('.swatch.is-active');
        var mainImg = document.getElementById('gallery-main-img');
        var priceNowEl = document.querySelector('.price-now');
        var priceWasEl = document.querySelector('.price-was');
        addToCart({
          name: 'Marlowe Faux Fur Coat',
          variant: activeSwatch ? activeSwatch.getAttribute('data-colour-name') : '',
          size: selectedSize,
          price: priceNowEl ? parseFloat(priceNowEl.textContent.replace(/[^0-9.]/g, '')) : 0,
          was: priceWasEl ? parseFloat(priceWasEl.textContent.replace(/[^0-9.]/g, '')) : null,
          img: mainImg ? mainImg.getAttribute('src') : ''
        });
      });
    }
  })();

  /* -----------------------------------------------------------------------
     Bag drawer - a small in-memory cart (state resets on page refresh).
     EDIT: swap addItem/removeItem/setQty for calls into your real
     cart/checkout API once you have one; render() is the one place that
     needs to know the current shape of a cart line.
  ----------------------------------------------------------------------- */
  (function cart() {
    var overlay = document.getElementById('cart-overlay');
    var drawer = document.getElementById('cart-drawer');
    var closeBtn = document.getElementById('cart-close');
    var trigger = document.getElementById('cart-trigger');
    var itemsWrap = document.getElementById('cart-items');
    var emptyState = document.getElementById('cart-empty');
    var countLabel = document.getElementById('cart-count-label');
    var summaryItems = document.getElementById('cart-summary-items');
    var summaryStandard = document.getElementById('cart-summary-standard');
    var summaryTotal = document.getElementById('cart-summary-total');
    var summarySavings = document.getElementById('cart-summary-savings');
    if (!overlay || !drawer || !itemsWrap) return;

    var items = []; // { key, colour, size, price, was, img, qty }

    function money(n) { return '£' + n.toFixed(2); }

    function findItem(key) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].key === key) return items[i];
      }
      return null;
    }

    function addItem(data) {
      var key = data.name + '|' + data.variant + '|' + (data.size || '');
      var existing = findItem(key);
      if (existing) {
        existing.qty += 1;
      } else {
        data.key = key;
        data.qty = 1;
        items.push(data);
      }
      render();
      open();
    }

    function removeItem(key) {
      items = items.filter(function (i) { return i.key !== key; });
      render();
    }

    function setQty(key, qty) {
      if (qty < 1) { removeItem(key); return; }
      var item = findItem(key);
      if (!item) return;
      item.qty = qty;
      render();
    }

    function render() {
      var totalQty = items.reduce(function (sum, i) { return sum + i.qty; }, 0);
      var totalNow = items.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
      var totalWas = items.reduce(function (sum, i) { return sum + (i.was || i.price) * i.qty; }, 0);

      if (countLabel) countLabel.textContent = '(' + totalQty + ')';
      document.querySelectorAll('.bag-count').forEach(function (el) { el.textContent = String(totalQty); });
      if (trigger) trigger.setAttribute('aria-label', 'Open shopping bag, ' + totalQty + ' item' + (totalQty === 1 ? '' : 's'));

      if (summaryItems) summaryItems.textContent = String(totalQty);
      if (summaryStandard) summaryStandard.textContent = money(totalWas);
      if (summaryTotal) summaryTotal.textContent = money(totalNow);
      if (summarySavings) {
        var savings = totalWas - totalNow;
        if (savings > 0.004) {
          summarySavings.textContent = "You're saving " + money(savings) + ' with the Autumn Event.';
          summarySavings.hidden = false;
        } else {
          summarySavings.hidden = true;
        }
      }

      itemsWrap.querySelectorAll('.cart-item').forEach(function (el) { el.remove(); });

      if (items.length === 0) {
        if (emptyState) emptyState.hidden = false;
        return;
      }
      if (emptyState) emptyState.hidden = true;

      items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'cart-item';
        var metaLine = item.size ? '<p class="cart-item-meta">Size ' + item.size + '</p>' : '';
        row.innerHTML =
          '<img class="cart-item-img" src="' + item.img + '" alt="" width="72" height="90">' +
          '<div class="cart-item-info">' +
            '<p class="cart-item-name">' + item.name + ' &middot; ' + item.variant + '</p>' +
            metaLine +
            '<div class="cart-item-price-row"><span>' + money(item.price) + ' each</span><strong>' + money(item.price * item.qty) + '</strong></div>' +
            '<div class="cart-qty-row">' +
              '<span class="cart-qty">' +
                '<button type="button" aria-label="Decrease quantity">&minus;</button>' +
                '<span>' + item.qty + '</span>' +
                '<button type="button" aria-label="Increase quantity">+</button>' +
              '</span>' +
              '<button type="button" class="cart-remove">Remove</button>' +
            '</div>' +
          '</div>';

        var qtyButtons = row.querySelectorAll('.cart-qty button');
        qtyButtons[0].addEventListener('click', function () { setQty(item.key, item.qty - 1); });
        qtyButtons[1].addEventListener('click', function () { setQty(item.key, item.qty + 1); });
        row.querySelector('.cart-remove').addEventListener('click', function () {
          removeItem(item.key);
          showToast('Removed from your bag');
        });

        itemsWrap.appendChild(row);
      });
    }

    function open() {
      overlay.hidden = false;
      requestAnimationFrame(function () {
        overlay.classList.add('is-visible');
        drawer.classList.add('is-open');
      });
      drawer.removeAttribute('inert');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('cart-open');
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('is-visible');
      drawer.classList.remove('is-open');
      drawer.setAttribute('inert', ''); // keeps its buttons out of the tab order while closed
      drawer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('cart-open');
      setTimeout(function () { overlay.hidden = true; }, 300);
      if (trigger) trigger.focus();
    }

    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    if (trigger) trigger.addEventListener('click', open);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    addToCart = addItem;
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
     Customer videos - lazy load: nothing but the poster/play button
     exists until clicked, so no video downloads until the visitor asks
     for it. No autoplay, no forced sound - the video only starts because
     of the click that built it.
  ----------------------------------------------------------------------- */
  (function socialVideos() {
    document.querySelectorAll('.social-video').forEach(function (wrap) {
      var playBtn = wrap.querySelector('.social-video-play');
      if (!playBtn) return;
      playBtn.addEventListener('click', function () {
        var src = wrap.getAttribute('data-video');
        var poster = wrap.getAttribute('data-poster');
        if (!src) return;

        var video = document.createElement('video');
        video.setAttribute('controls', '');
        video.setAttribute('preload', 'none');
        video.setAttribute('playsinline', '');
        if (poster) video.setAttribute('poster', poster);
        var source = document.createElement('source');
        source.src = src;
        source.type = 'video/mp4';
        video.appendChild(source);

        wrap.innerHTML = '';
        wrap.appendChild(video);
        video.play();
      });
    });
  })();

  /* -----------------------------------------------------------------------
     Reviews - "Load more" reveals additional hidden review cards, in the
     same fixed order they appear in the markup (never re-sorted).
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
     Write a Review - EDIT: submitting only builds a new .review-card and
     prepends it to the list on this page; nothing is sent anywhere. Point
     this at a real backend/reviews provider when you have one.
  ----------------------------------------------------------------------- */
  (function writeReview() {
    var toggleBtn = document.getElementById('write-review-toggle');
    var form = document.getElementById('review-form');
    var ratingGroup = document.getElementById('review-rating-input');
    var status = document.getElementById('review-form-status');
    var list = document.getElementById('reviews-list');
    if (!toggleBtn || !form || !ratingGroup || !list) return;

    var rating = 0;
    var ratingButtons = ratingGroup.querySelectorAll('button');

    toggleBtn.addEventListener('click', function () {
      var isOpen = form.hidden;
      form.hidden = !isOpen;
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
      toggleBtn.textContent = isOpen ? 'Cancel Review' : 'Write a Review';
      if (isOpen) form.querySelector('#review-name').focus();
    });

    ratingButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        rating = parseInt(btn.getAttribute('data-value'), 10);
        ratingButtons.forEach(function (b) {
          var active = parseInt(b.getAttribute('data-value'), 10) <= rating;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (rating === 0) {
        if (status) {
          status.textContent = 'Please choose a star rating before submitting.';
          status.classList.add('is-visible', 'is-error');
        }
        return;
      }

      var name = form.querySelector('#review-name').value.trim();
      var title = form.querySelector('#review-title-input').value.trim();
      var body = form.querySelector('#review-body-input').value.trim();
      var today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      var card = document.createElement('li');
      card.className = 'review-card';
      card.innerHTML =
        '<div class="review-content">' +
          '<div class="review-top">' +
            '<span class="star-rating star-rating--sm" style="--pct:' + (rating * 20) + '%" aria-hidden="true"><span class="star-rating-track">★★★★★</span><span class="star-rating-fill">★★★★★</span></span>' +
            '<span class="visually-hidden">' + rating + ' out of 5 stars</span>' +
          '</div>' +
          '<p class="review-title"></p>' +
          '<p class="review-meta"></p>' +
          '<p class="review-body"></p>' +
        '</div>';
      card.querySelector('.review-title').textContent = title;
      card.querySelector('.review-meta').textContent = name + ' · ' + today;
      card.querySelector('.review-body').textContent = body;

      list.insertBefore(card, list.firstChild);

      form.reset();
      rating = 0;
      ratingButtons.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      if (status) {
        status.textContent = 'Thank you, your review has been posted below.';
        status.classList.remove('is-error');
        status.classList.add('is-visible');
      }
      card.scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
     "We Think You'll Like" - each card adds straight to the bag (no
     product page to visit). EDIT: reads its data from the data-* attrs
     on each .related-add button in index.html.
  ----------------------------------------------------------------------- */
  (function relatedAddToCart() {
    var buttons = document.querySelectorAll('.related-add');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        addToCart({
          name: btn.getAttribute('data-name'),
          variant: btn.getAttribute('data-variant'),
          size: null,
          price: parseFloat(btn.getAttribute('data-price')),
          was: null,
          img: btn.getAttribute('data-img')
        });
      });
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
