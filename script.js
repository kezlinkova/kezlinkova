/* veronika. — shared behaviour. Each feature guards on its own elements,
   so this one file runs safely on the home page and the subpages. */
(function () {
  'use strict';

  // Sticky nav background on scroll
  var nav = document.getElementById('siteNav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.scrollY > 14);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle (home only)
  var burger = document.getElementById('burger');
  var panel = document.getElementById('mobilePanel');
  if (burger && panel) {
    var setOpen = function (open) {
      panel.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () {
      setOpen(!panel.classList.contains('is-open'));
    });
    panel.querySelectorAll('[data-close]').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  // Hero headline — type out the searched word, letter by letter (home only)
  (function () {
    var el = document.getElementById('heroHeadline');
    if (!el) return;
    var targets = el.querySelectorAll('[data-tw]');
    if (!targets.length) return;
    var order = [];
    targets.forEach(function (t) {
      var walker = document.createTreeWalker(t, NodeFilter.SHOW_TEXT, null);
      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(function (tn) {
        var frag = document.createDocumentFragment();
        tn.textContent.split(/(\s+)/).forEach(function (token) {
          if (token === '') return;
          if (/^\s+$/.test(token)) { frag.appendChild(document.createTextNode(token)); return; }
          var word = document.createElement('span');
          word.className = 'word';
          token.split('').forEach(function (c) {
            var s = document.createElement('span');
            s.className = 'ch';
            s.textContent = c;
            word.appendChild(s);
            order.push(s);
          });
          frag.appendChild(word);
        });
        tn.parentNode.replaceChild(frag, tn);
      });
    });
    var caret = document.createElement('span');
    caret.className = 'tw-caret';
    el.appendChild(caret);
    el.classList.add('go');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      order.forEach(function (s) { s.classList.add('on'); });
      return;
    }
    var i = 0;
    setTimeout(function step() {
      if (i < order.length) { order[i].classList.add('on'); i++; setTimeout(step, 60); }
    }, 350);
  })();

  // Scroll reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  requestAnimationFrame(function () {
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  });

  // Contact form → Formspree (AJAX, keeps the page in place) (home only)
  var form = document.getElementById('contactForm');
  var sentMsg = document.getElementById('formSent');
  var errMsg = document.getElementById('formError');
  var btn = document.getElementById('submitBtn');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      btn.disabled = true;
      btn.textContent = 'Odesílám…';
      errMsg.style.display = 'none';
      fetch('https://formspree.io/f/xpqgpkdn', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          sentMsg.style.display = 'block';
        } else {
          errMsg.style.display = 'block';
          btn.disabled = false;
          btn.textContent = 'Napsat mi';
        }
      }).catch(function () {
        errMsg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Napsat mi';
      });
    });
  }
})();
