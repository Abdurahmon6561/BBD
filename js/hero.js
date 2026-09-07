/* =====================================================================
   BBD — hero

   Slides, the fade-in, and standing the background video down when the
   hero is off screen. The generated guilloche plate that used to live
   here has been removed along with its markup — the video is the hero's
   ground now.
   ===================================================================== */

/* =====================================================================
   HERO SLIDES

   Four slides share one grid cell; this only moves the is-active class
   and the tick state. Self-contained, so a failure anywhere else on the
   page cannot stop the copy from rotating.
   ===================================================================== */
(function heroSlides() {
    'use strict';

    var stage = document.querySelector('.hero__stage');
    var ticksWrap = document.querySelector('.hero__ticks');
    if (!stage || !ticksWrap) return;

    var slides = stage.querySelectorAll('.hero__slide');
    var ticks  = ticksWrap.querySelectorAll('.hero__tick');
    if (slides.length < 2 || ticks.length !== slides.length) return;

    var reduced = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var DWELL = 6200;
    var index = 0;
    var timer = null;
    var held  = false;   /* pointer or focus is inside the hero */

    function show(next) {
        if (next === index) return;

        slides[index].classList.remove('is-active');
        ticks[index].classList.remove('is-on');
        ticks[index].setAttribute('aria-selected', 'false');

        index = (next + slides.length) % slides.length;

        slides[index].classList.add('is-active');
        ticks[index].classList.add('is-on');
        ticks[index].setAttribute('aria-selected', 'true');
    }

    function stop() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    function start() {
        /* auto-rotation is motion the reader did not ask for, so it does
           not run at all when reduced motion is requested - the ticks are
           still there to move through the slides by hand */
        if (reduced || held || timer) return;
        timer = setInterval(function () { show(index + 1); }, DWELL);
    }

    for (var i = 0; i < ticks.length; i++) {
        (function (n) {
            ticks[n].addEventListener('click', function () {
                show(n);
                /* restart the dwell so the slide just chosen gets a full
                   turn rather than the remainder of the last one */
                stop();
                start();
            });
        })(i);
    }

    function hold()    { held = true;  stop(); }
    function release() { held = false; start(); }

    /* The pause target is the copy column, not the whole .hero. The hero
       is 100vh of full-width section, so hovering it means "the pointer
       is somewhere on the screen" - hooking the pause there stopped the
       rotation permanently on any desktop with a mouse.

       Hovering the column you are reading is the real signal, and it
       doubles as the pause mechanism WCAG 2.2.2 wants alongside the
       ticks. Focus is still watched across the whole hero, so tabbing in
       from the header holds it too. */
    var copy = document.querySelector('.hero__copy');
    var hero = document.querySelector('.hero');

    copy.addEventListener('mouseenter', hold);
    copy.addEventListener('mouseleave', release);
    hero.addEventListener('focusin', hold);
    hero.addEventListener('focusout', release);

    /* nothing should tick over in a tab nobody is looking at */
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else start();
    });

    start();
})();

/* =====================================================================
   IDLE THE PLATE WHEN THE HERO IS OFF SCREEN

   Profiling a scroll down the page: 52fps with 25 janky frames in 170,
   against a clean 60fps / 0 janky with the plate removed entirely.
   Nothing else came close - killing every backdrop-filter and the sticky
   about panel changed neither number.

   The plate is a large composited layer, and it went on drifting and
   turning the whole way down the page even though the hero was long gone.
   This stops both animations as soon as the hero leaves the viewport and
   starts them again when it comes back, so the cost only exists while
   there is something to look at.
   ===================================================================== */
(function idlePlate() {
    'use strict';

    var hero = document.querySelector('.hero');
    if (!hero || !('IntersectionObserver' in window)) return;

    var video = hero.querySelector('.hero__video');
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Under reduced motion the video never plays, so what stays on screen
       is its poster — the same frame, holding still. The download is
       dropped with it: a still frame does not need 9.6MB of video behind
       it, and preload='none' is what stops the buffering that the markup's
       preload='auto' would otherwise have started. */
    if (video && still) {
        video.removeAttribute('autoplay');
        video.preload = 'none';
        video.pause();
        video = null;
    }

    var inView = true;
    var scrolling = false;
    var settle = null;

    /* Two different states, because they want different treatment.

       Off screen, the plate can go entirely: hidden, and its compositor
       layer released.

       On screen but mid-scroll, it must stay visible - hiding it would
       make the pattern blink out from under the reader every time they
       touched the wheel. It only stops moving. */
    function apply() {
        hero.classList.toggle('is-gone', !inView);
        hero.classList.toggle('is-still', inView && scrolling);

        /* Video decoding costs the same off screen as on, so it stops
           with the plate. Unlike the plate it keeps running through a
           scroll: pausing and resuming it on every wheel event would
           stutter the footage for no gain. play() returns a promise that
           rejects if autoplay was refused - caught, since there is nothing
           to do about it and an unhandled rejection is noise. */
        if (!video) return;
        if (inView) {
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
        } else {
            video.pause();
        }
    }

    new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) inView = entries[i].isIntersecting;
        apply();
    }, { rootMargin: '120px' }).observe(hero);

    /* Off-screen alone only recovered 52fps -> 53: the jank that was left
       all happened over the stretch where the hero is still on screen, the
       plate animating and the page scrolling at the same time. Nobody is
       watching a background pattern while they scroll past it, so it also
       stands down for as long as the wheel is moving and picks up 140ms
       after it stops. Paused, not reset, so resuming is seamless. */
    window.addEventListener('scroll', function () {
        if (!scrolling) { scrolling = true; apply(); }
        clearTimeout(settle);
        settle = setTimeout(function () {
            scrolling = false;
            apply();
        }, 140);
    }, { passive: true });
})();
