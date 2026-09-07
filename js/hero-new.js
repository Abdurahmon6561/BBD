/* =====================================================================
   BBD — Hero "Precision in Motion"
   Generative constellation + reveals + counters
   ===================================================================== */

(function () {
    'use strict';

    var hero = document.getElementById('hero');
    if (!hero) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =================================================================
       1. GENERATIVE CONSTELLATION CANVAS
       ================================================================= */
    (function constellation() {
        var canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        if (reduced) return; // Static fallback via CSS

        var ctx = canvas.getContext('2d');
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var width = 0, height = 0;

        // Configuration
        var NODE_COUNT = 140;
        var CONNECT_DIST = 160;
        var NODE_MIN_R = 1.2, NODE_MAX_R = 3.2;
        var SPEED_FACTOR = 0.18;

        // Color palette
        var COLORS = {
            node: ['rgba(0,212,255,', 'rgba(255,184,0,'],
            line: 'rgba(0,212,255,',
            glow: 'rgba(0,212,255,'
        };

        var nodes = [];
        var mouse = { x: -9999, y: -9999, active: false };
        var rafId = null;
        var lastTime = 0;

        // Initialize nodes
        function initNodes() {
            nodes = [];
            for (var i = 0; i < NODE_COUNT; i++) {
                nodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * SPEED_FACTOR,
                    vy: (Math.random() - 0.5) * SPEED_FACTOR,
                    r: NODE_MIN_R + Math.random() * (NODE_MAX_R - NODE_MIN_R),
                    hue: Math.random() > 0.7 ? 1 : 0, // 0 = cyan, 1 = gold
                    alpha: 0.15 + Math.random() * 0.35,
                    pulsePhase: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.002 + Math.random() * 0.004
                });
            }
        }

        function resize() {
            var rect = hero.getBoundingClientRect();
            width = Math.max(rect.width, 1);
            height = Math.max(rect.height, 1);
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initNodes();
        }

        function drawNode(node) {
            var px = node.x;
            var py = node.y;
            var pr = node.r + Math.sin(node.pulsePhase) * 0.6;

            ctx.beginPath();
            ctx.arc(px, py, Math.max(0.5, pr), 0, Math.PI * 2);

            var colorIdx = node.hue;
            var grad = ctx.createRadialGradient(px, py, 0, px, py, pr * 2.5);
            grad.addColorStop(0, COLORS.node[colorIdx] + (node.alpha * 0.9).toFixed(2) + ')');
            grad.addColorStop(0.5, COLORS.node[colorIdx] + (node.alpha * 0.3).toFixed(2) + ')');
            grad.addColorStop(1, COLORS.node[colorIdx] + '0)');
            ctx.fillStyle = grad;
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(px, py, Math.max(0.5, pr * 0.35), 0, Math.PI * 2);
            ctx.fillStyle = COLORS.node[colorIdx] + (node.alpha + 0.15).toFixed(2) + ')';
            ctx.fill();
        }

        function drawConnections() {
            var i, j, n1, n2, dx, dy, dist, opacity;

            for (i = 0; i < nodes.length; i++) {
                n1 = nodes[i];
                for (j = i + 1; j < nodes.length; j++) {
                    n2 = nodes[j];
                    dx = n2.x - n1.x;
                    dy = n2.y - n1.y;
                    dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECT_DIST) {
                        opacity = (1 - dist / CONNECT_DIST) * 0.12 * Math.min(n1.alpha, n2.alpha);
                        if (opacity < 0.008) continue;

                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.strokeStyle = COLORS.line + opacity.toFixed(3) + ')';
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }

                // Mouse connection
                if (mouse.active) {
                    dx = mouse.x - n1.x;
                    dy = mouse.y - n1.y;
                    dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 220) {
                        opacity = (1 - dist / 220) * 0.18 * n1.alpha;
                        if (opacity > 0.012) {
                            ctx.beginPath();
                            ctx.moveTo(n1.x, n1.y);
                            ctx.lineTo(mouse.x, mouse.y);
                            ctx.strokeStyle = 'rgba(255,184,0,' + opacity.toFixed(3) + ')';
                            ctx.lineWidth = 0.7;
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        function step(time) {
            var dt = Math.min(50, time - lastTime);
            lastTime = time;

            // Clear
            ctx.clearRect(0, 0, width, height);

            // Update & draw nodes
            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];

                // Drift
                n.x += n.vx * dt;
                n.y += n.vy * dt;

                // Boundary wrap with margin
                var margin = 60;
                if (n.x < -margin) n.x = width + margin;
                if (n.x > width + margin) n.x = -margin;
                if (n.y < -margin) n.y = height + margin;
                if (n.y > height + margin) n.y = -margin;

                // Mouse repulsion
                if (mouse.active) {
                    var dx = n.x - mouse.x;
                    var dy = n.y - mouse.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140 && dist > 0.5) {
                        var force = (140 - dist) / 140 * 0.6;
                        n.vx += (dx / dist) * force * dt * 0.02;
                        n.vy += (dy / dist) * force * dt * 0.02;
                    }
                }

                // Velocity damping
                n.vx *= 0.9992;
                n.vy *= 0.9992;

                // Pulse
                n.pulsePhase += n.pulseSpeed * dt;

                drawNode(n);
            }

            drawConnections();

            rafId = requestAnimationFrame(step);
        }

        // Mouse tracking
        function onMouseMove(e) {
            var rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        }

        function onMouseLeave() {
            mouse.active = false;
            mouse.x = -9999;
            mouse.y = -9999;
        }

        // Touch support
        function onTouchMove(e) {
            if (e.touches.length) {
                var rect = canvas.getBoundingClientRect();
                mouse.x = e.touches[0].clientX - rect.left;
                mouse.y = e.touches[0].clientY - rect.top;
                mouse.active = true;
            }
        }

        function onTouchEnd() {
            mouse.active = false;
        }

        // Visibility optimization
        function onVisibilityChange() {
            if (document.hidden) {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
            } else if (!rafId) {
                lastTime = performance.now();
                rafId = requestAnimationFrame(step);
            }
        }

        // Init
        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.addEventListener('touchmove', onTouchMove, { passive: true });
        canvas.addEventListener('touchend', onTouchEnd);
        document.addEventListener('visibilitychange', onVisibilityChange);

        resize();
        lastTime = performance.now();
        rafId = requestAnimationFrame(step);

        // Cleanup on unload (if needed)
        window.addEventListener('beforeunload', function () {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            if (rafId) cancelAnimationFrame(rafId);
        });
    })();

    /* =================================================================
       2. REVEAL ANIMATIONS (IntersectionObserver)
       ================================================================= */
    (function reveals() {
        if (reduced) {
            document.querySelectorAll('[data-reveal]').forEach(function (el) {
                el.classList.add('is-visible');
            });
            document.querySelectorAll('.hero__metric').forEach(function (el) {
                el.classList.add('is-visible');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        });

        document.querySelectorAll('[data-reveal]').forEach(function (el) {
            observer.observe(el);
        });

        // Metrics have their own stagger via CSS, but we still need to trigger
        document.querySelectorAll('.hero__metric').forEach(function (el) {
            observer.observe(el);
        });
    })();

    /* =================================================================
       3. COUNTER ANIMATIONS
       ================================================================= */
    (function counters() {
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
            var target = parseFloat(el.getAttribute('data-count-to'));
            var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            if (isNaN(target)) return;

            if (reduced) {
                el.textContent = format(target, decimals);
                return;
            }

            var duration = 1600;
            var start = null;

            function step(now) {
                if (start === null) start = now;
                var t = Math.min(1, (now - start) / duration);
                // Ease-out cubic
                var eased = 1 - Math.pow(1 - t, 3);
                el.textContent = format(target * eased, decimals);
                if (t < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        }

        function startCounters() {
            var nodes = hero.querySelectorAll('[data-count-to]');
            nodes.forEach(countUp);
        }

        // Start when hero is visible
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    startCounters();
                    counterObserver.disconnect();
                }
            });
        }, { threshold: 0.3 });

        counterObserver.observe(hero);
    })();

    /* =================================================================
       4. METRIC HOVER TOOLTIP (optional enhancement)
       ================================================================= */
    (function metricInteraction() {
        var metrics = hero.querySelectorAll('.hero__metric');
        if (!metrics.length) return;

        metrics.forEach(function (metric) {
            metric.addEventListener('mouseenter', function () {
                // Could add tooltip here if needed
            });
        });
    })();

})();