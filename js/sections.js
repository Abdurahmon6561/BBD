/* =====================================================================
   BBD — section behaviour
   ---------------------------------------------------------------------
   1. REVEAL      one restrained rise for every band, replacing the
                  fadeInUp / slideInLeft / flipInX / flipInY mix
   2. COUNTERS    the company figures count up when they scroll into view
   3. READBAR     reading progress across a long page
   4. TOTOP       back to top past the first screen

   Vanilla, no dependency on jQuery, and every part is a no-op when the
   viewer asks for reduced motion.
   ===================================================================== */
(function () {
    'use strict';

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var supported = 'IntersectionObserver' in window;


    /* =================================================================
       1. REVEAL

       WOW.js is still on the page for the markup that predates this, but
       everything it drives now runs through one animation (see the
       `.animated` override in the stylesheet). This observer covers the
       elements added since, which carry no `wow` class.
       ================================================================= */
    (function reveal() {
        var nodes = document.querySelectorAll('[data-reveal]');
        if (!nodes.length) return;

        if (reduced || !supported) {
            for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('is-in');
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

        for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);
    })();


    /* =================================================================
       2. COUNTERS

       Same easing and ru-RU grouping as the hero, so a figure repeated
       further down the page animates identically. The markup ships the
       final value as its text, so this only ever replaces a number that
       is already correct — with JS off, nothing is lost.
       ================================================================= */
    (function counters() {
        var nodes = document.querySelectorAll('.main-about [data-count-to]');
        if (!nodes.length) return;

        function format(value, decimals) {
            try {
                return value.toLocaleString('ru-RU', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                });
            } catch (e) {
                return decimals ? value.toFixed(decimals) : String(Math.round(value));
            }
        }

        function countUp(el) {
            var target   = parseFloat(el.getAttribute('data-count-to'));
            var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            if (isNaN(target)) return;

            var duration = 1500;
            var started  = null;

            function step(now) {
                if (started === null) started = now;
                var t     = Math.min(1, (now - started) / duration);
                var eased = 1 - Math.pow(1 - t, 3);
                el.textContent = format(target * eased, decimals);
                if (t < 1) requestAnimationFrame(step);
                else el.textContent = format(target, decimals);
            }
            requestAnimationFrame(step);
        }

        /* reduced motion, or no observer: leave the served numbers alone */
        if (reduced || !supported) return;

        var panel = document.querySelector('.main-about__icons');
        if (!panel) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                for (var i = 0; i < nodes.length; i++) {
                    /* stagger, so the four figures do not tick in lockstep */
                    (function (el, delay) {
                        setTimeout(function () { countUp(el); }, delay);
                    })(nodes[i], i * 110);
                }
            });
        }, { threshold: 0.35 });

        io.observe(panel);
    })();


    /* =================================================================
       3. NEWS — measure each standfirst

       The news tiles keep their standfirst folded away until hover.
       CSS can only animate max-height between two lengths, and these
       three run from two lines to five, so a single constant either
       clips the longest or leaves the shortest easing against a stop
       it never reaches. Each card gets its own --desc-h instead.

       Re-measured on resize, since the same text wraps to a different
       number of lines as the column narrows.
       ================================================================= */
    (function newsFold() {
        var cards = document.querySelectorAll('.news-card');
        if (!cards.length) return;

        function measure() {
            for (var i = 0; i < cards.length; i++) {
                var text = cards[i].querySelector('.news-card__short-text');
                if (!text) continue;

                /* read the natural height with the fold forced open, then
                   put it back — scrollHeight alone reports the clipped
                   box once max-height is 0 */
                var prevMax = text.style.maxHeight;
                text.style.transition = 'none';
                text.style.maxHeight  = 'none';

                var h = text.scrollHeight;

                text.style.maxHeight = prevMax;
                /* force the reflow before transitions come back, or the
                   card animates from none to 0 on the first paint */
                void text.offsetHeight;
                text.style.transition = '';

                cards[i].style.setProperty('--desc-h', h + 'px');
            }
        }

        var queued;
        window.addEventListener('resize', function () {
            clearTimeout(queued);
            queued = setTimeout(measure, 160);
        });

        if (document.readyState === 'complete') measure();
        else window.addEventListener('load', measure);
    })();


    /* =================================================================
       4. TOTOP

       Used to pair with a fixed reading-progress bar (readbar__fill)
       that filled in across the top of the viewport as the page
       scrolled, sharing this one scroll listener. The bar is gone - it
       read as a stray line rather than a legible progress cue - so this
       now only toggles the back-to-top button.
       ================================================================= */
    (function chrome() {
        var toTop = document.getElementById('toTop');
        if (!toTop) return;

        var queued = false;

        function paint() {
            queued = false;

            var scroll = window.pageYOffset || document.documentElement.scrollTop || 0;

            /* one full screen down is the point where going back by
               hand starts to cost something */
            toTop.classList.toggle('is-on', scroll > window.innerHeight);
        }

        function onScroll() {
            if (queued) return;
            queued = true;
            requestAnimationFrame(paint);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        paint();

        toTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: reduced ? 'auto' : 'smooth'
            });
        });
    })();

})();
