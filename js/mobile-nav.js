/* =====================================================================
   BBD — mobile navigation

   The page had no mobile nav at all: no hamburger, no drawer, and a
   leftover jQuery handler bound to a `.hamburger__content` that is not
   in the markup. This drives the drawer added to index.html.

   Vanilla, and independent of jQuery/slick so a failure in either
   cannot take the only navigation on a phone with it.
   ===================================================================== */
(function () {
    'use strict';

    var nav    = document.getElementById('mobileNav');
    var toggle = document.getElementById('navToggle');
    if (!nav || !toggle) return;

    var panel   = nav.querySelector('.mobnav__panel');
    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var lastFocus = null;

    /* the drawer is `hidden` at rest, so it has to be revealed for a
       frame before the transform can animate from it */
    function open() {
        lastFocus = document.activeElement;

        nav.hidden = false;
        /* force a reflow so the browser has a start value to animate from */
        void nav.offsetWidth;
        nav.classList.add('is-open');

        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('nav-open');

        var first = panel.querySelector('.mobnav__close');
        if (first) first.focus();
    }

    function close() {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');

        function done() {
            nav.hidden = true;
            panel.removeEventListener('transitionend', done);
        }

        if (reduced) done();
        else {
            panel.addEventListener('transitionend', done);
            /* transitionend does not fire if the panel is display:none'd
               by a resize mid-animation */
            setTimeout(function () { if (!nav.classList.contains('is-open')) done(); }, 500);
        }

        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function isOpen() {
        return nav.classList.contains('is-open');
    }

    toggle.addEventListener('click', function () {
        if (isOpen()) close(); else open();
    });

    /* scrim, the close button, and any link marked to dismiss */
    nav.addEventListener('click', function (e) {
        if (e.target.closest('[data-nav-close]')) close();
    });

    /* every link leaves the drawer, whether it navigates away or jumps
       to an anchor on this page - an anchor alone would leave the drawer
       sitting over the section it just scrolled to */
    nav.querySelectorAll('a[href]').forEach(function (a) {
        a.addEventListener('click', function () {
            if (a.getAttribute('href').charAt(0) === '#') close();
        });
    });

    document.addEventListener('keydown', function (e) {
        if (!isOpen()) return;

        if (e.key === 'Escape' || e.keyCode === 27) {
            close();
            return;
        }

        /* keep Tab inside the drawer while it is over the page */
        if (e.key !== 'Tab') return;

        var items = panel.querySelectorAll(
            'a[href], button:not([disabled])'
        );
        var focusable = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i].offsetParent !== null) focusable.push(items[i]);
        }
        if (!focusable.length) return;

        var first = focusable[0];
        var last  = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    /* back on a desktop width the inline nav is the nav again */
    window.addEventListener('resize', function () {
        if (isOpen() && window.innerWidth > 900) close();
    });

    /* ---------- accordions ----------

       max-height is driven from scrollHeight rather than a guessed
       constant: at 360px several of these titles wrap to two lines, so
       a fixed value either clips the list or leaves a gap under it.
    */
    function collapse(group) {
        var list = group.querySelector('.mobgroup__list');
        group.classList.remove('is-open');
        group.querySelector('.mobgroup__head')
             .setAttribute('aria-expanded', 'false');
        list.style.maxHeight = '';
    }

    function expand(group) {
        var list = group.querySelector('.mobgroup__list');
        group.classList.add('is-open');
        group.querySelector('.mobgroup__head')
             .setAttribute('aria-expanded', 'true');
        list.style.maxHeight = list.scrollHeight + 'px';
    }

    nav.querySelectorAll('.mobgroup__head').forEach(function (head) {
        head.addEventListener('click', function () {
            var group   = head.parentNode;
            var wasOpen = group.classList.contains('is-open');

            /* one group at a time: 25 links open at once is a wall */
            nav.querySelectorAll('.mobgroup.is-open').forEach(collapse);

            if (!wasOpen) expand(group);
        });
    });

    /* an open group has a pixel max-height that no longer matches its
       content once the panel changes width */
    window.addEventListener('resize', function () {
        nav.querySelectorAll('.mobgroup.is-open').forEach(function (g) {
            var list = g.querySelector('.mobgroup__list');
            list.style.maxHeight = 'none';
            var h = list.scrollHeight;
            list.style.maxHeight = h + 'px';
        });
    });

})();
