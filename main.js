(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to fill the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // UI elements
    const controls = document.getElementById('controls');
    const toggleBtn = document.getElementById('toggleBtn');
    const clearBtn = document.getElementById('clearBtn');
    const hideBtn = document.getElementById('hideBtn');
    const ttlSlider = document.getElementById('ttlSlider');
    const ttlValue = document.getElementById('ttlValue');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const spawnMinSlider = document.getElementById('spawnMinSlider');
    const spawnMaxSlider = document.getElementById('spawnMaxSlider');
    const spawnMinValue = document.getElementById('spawnMinValue');
    const spawnMaxValue = document.getElementById('spawnMaxValue');
    const spawnRangeFill = document.getElementById('spawnRangeFill');
    const ttlRangeFill = document.getElementById('ttlRangeFill');
    const speedRangeFill = document.getElementById('speedRangeFill');
    const separatorEnabledEl = document.getElementById('separatorEnabled');
    const separatorColorEl = document.getElementById('separatorColor');
    const separatorMinSlider = document.getElementById('separatorMinSlider');
    const separatorMaxSlider = document.getElementById('separatorMaxSlider');
    const separatorMinValueEl = document.getElementById('separatorMinValue');
    const separatorMaxValueEl = document.getElementById('separatorMaxValue');
    const separatorRangeFill = document.getElementById('separatorRangeFill');
    const addColorBtn = document.getElementById('addColorBtn');
    const removeColorBtn = document.getElementById('removeColorBtn');
    const randomizeOrderEl = document.getElementById('randomizeOrder');
    const viewportEnabledEl = document.getElementById('viewportEnabled');
    const viewportSizeSlider = document.getElementById('viewportSizeSlider');
    const viewportSizeValue = document.getElementById('viewportSizeValue');
    const viewportSizeControls = document.getElementById('viewportSizeControls');
    const viewportOverlay = document.getElementById('viewportOverlay');
    const viewportRangeFill = document.getElementById('viewportRangeFill');
    const viewportOpacitySlider = document.getElementById('viewportOpacitySlider');
    const viewportOpacityValue = document.getElementById('viewportOpacityValue');
    const viewportOpacityControls = document.getElementById('viewportOpacityControls');
    const viewportOpacityRangeFill = document.getElementById('viewportOpacityRangeFill');
    const viewportOpacityLabel = document.getElementById('viewportOpacityLabel');
    const extremeBiasEnabledEl = document.getElementById('extremeBiasEnabled');
    const extremeBiasSlider = document.getElementById('extremeBiasSlider');
    const extremeBiasValue = document.getElementById('extremeBiasValue');
    const extremeBiasControls = document.getElementById('extremeBiasControls');
    const extremeBiasRangeFill = document.getElementById('extremeBiasRangeFill');
    const colorShiftEnabledEl = document.getElementById('colorShiftEnabled');
    const colorShiftSlider = document.getElementById('colorShiftSlider');
    const colorShiftValue = document.getElementById('colorShiftValue');
    const colorShiftControls = document.getElementById('colorShiftControls');
    const colorShiftRangeFill = document.getElementById('colorShiftRangeFill');
    const subliminalsEnabledEl = document.getElementById('subliminalsEnabled');
    const subliminalsTextEl = document.getElementById('subliminalsText');
    const subliminalDurationSlider = document.getElementById('subliminalDurationSlider');
    const subliminalDurationValue = document.getElementById('subliminalDurationValue');
    const subliminalDurationRangeFill = document.getElementById('subliminalDurationRangeFill');
    const subliminalFontSlider = document.getElementById('subliminalFontSlider');
    const subliminalFontValue = document.getElementById('subliminalFontValue');
    const subliminalFontRangeFill = document.getElementById('subliminalFontRangeFill');
    const subliminalIntervalSlider = document.getElementById('subliminalIntervalSlider');
    const subliminalIntervalValue = document.getElementById('subliminalIntervalValue');
    const subliminalIntervalRangeFill = document.getElementById('subliminalIntervalRangeFill');
    
    // Slide containers for animations
    const viewportSlideContainer = document.getElementById('viewportSlideContainer');
    const extremeBiasSlideContainer = document.getElementById('extremeBiasSlideContainer');
    const colorShiftSlideContainer = document.getElementById('colorShiftSlideContainer');
    const subliminalsSlideContainer = document.getElementById('subliminalsSlideContainer');
    const removeBtnDefaultTitle = removeColorBtn ? removeColorBtn.title : 'Remove last color';
    const removeBtnDefaultText = removeColorBtn ? removeColorBtn.textContent : '−';
    let removeBtnResetTimeoutId = null;

    // Animation helper function
    function animateSlideContainer(container, show) {
        if (!container) return;
        
        if (show) {
            container.classList.remove('collapsed');
            container.classList.add('expanded');
        } else {
            container.classList.remove('expanded');
            container.classList.add('collapsed');
        }
    }

    // State
    let rings = [];
    let animationId;
    let isAnimating = true;
    let lastTime = 0;
    let isControlsHidden = false;

    // Timings
    let spacingPercentMin = 5;   // % of screen diagonal
    let spacingPercentMax = 15;  // % of screen diagonal
    let ringLifetime = 9000;
    let expansionSpeedPercent = 0.15; // percentage of screen diagonal per second (15%)

    // Circular viewport
    let viewportEnabled = false;
    let viewportRadius = 250;
    let viewportCenterX = 0.5; // percentage of width
    let viewportCenterY = 0.5; // percentage of height
    let viewportOpacity = 0.95;

    // Extreme Value Bias
    let extremeBiasEnabled = false;
    let extremeBiasIntensity = 0.75; // 0 to 1 (0% to 100%)

    // Color Shift
    let colorShiftEnabled = false;
    let colorShiftIntensity = 0.15; // 0 to 1 (0% to 100%)

    // Subliminals
    let subliminalsEnabled = false;
    let subliminalsPhrases = ['Ssssleep', 'Sssleep', 'Relax', 'Stare'];
    let activeSubliminals = [];
    let nextSubliminalAtMs = null;
    let subliminalMinIntervalMs = 1500;
    let subliminalMaxIntervalMs = 5000;
    let subliminalAvgIntervalMs = 2500; // controlled by slider
    let subliminalDurationMs = 1200; // controlled by slider
    const subliminalFadeInFraction = 0.2;  // 20% of duration
    const subliminalFadeOutFraction = 0.2; // 20% of duration
    let subliminalIndex = 0; // for sequential playback

    function biasedRandom(intensity = extremeBiasIntensity) {
        if (!extremeBiasEnabled || intensity === 0) {
            return Math.random();
        }
        
        // Convert intensity to Beta distribution parameters
        // Lower values create more extreme bias (U-shaped curve)
        // intensity 0.5 -> alpha=beta=0.5 (moderate U-shape)
        // intensity 1.0 -> alpha=beta=0.1 (extreme U-shape)
        const alpha = Math.max(0.1, 1 - intensity * 0.9);
        const beta = alpha; // Symmetric distribution for simplicity
        
        // Simple Beta distribution approximation using rejection sampling
        // It's probably not the most efficient way to do this, but it's simple and works well enough
        let u, v, x;
        do {
            u = Math.random();
            v = Math.random();
            x = Math.pow(u, 1/alpha) / (Math.pow(u, 1/alpha) + Math.pow(v, 1/beta));
        } while (isNaN(x));
        
        return x;
    }

    function computeMaxViewportRadius() {
        // Ensure the hole can reach the farthest corner from center
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        return Math.ceil(Math.sqrt(halfW * halfW + halfH * halfH));
    }

    function updateViewportOverlay() {
        if (!viewportOverlay) return;
        if (!viewportEnabled) {
            viewportOverlay.style.display = 'none';
            return;
        }
        const maxRadius = computeMaxViewportRadius();
        const radiusPx = Math.min(viewportRadius, maxRadius);
        viewportOverlay.style.setProperty('--vr', radiusPx + 'px');
        viewportOverlay.style.setProperty('--vx', (viewportCenterX * 100) + '%');
        viewportOverlay.style.setProperty('--vy', (viewportCenterY * 100) + '%');
        viewportOverlay.style.setProperty('--vo', String(viewportOpacity));
        viewportOverlay.style.display = 'block';
    }

    function updateViewportSize() {
        if (!viewportSizeSlider) return;
        viewportRadius = parseInt(viewportSizeSlider.value);
        if (viewportSizeValue) {
            viewportSizeValue.textContent = viewportSizeSlider.value + ' px radius';
        }
        updateSingleRangeFill(viewportSizeSlider, viewportRangeFill);
        updateViewportOverlay();
    }

    function toggleViewport() {
        viewportEnabled = !!(viewportEnabledEl && viewportEnabledEl.checked);
        
        animateSlideContainer(viewportSlideContainer, viewportEnabled);
        
        if (viewportEnabled) {
            if (viewportSizeSlider) {
                const maxNow = computeMaxViewportRadius();
                viewportSizeSlider.max = String(maxNow);
                const curr = parseInt(viewportSizeSlider.value);
                if (curr > maxNow) {
                    viewportSizeSlider.value = String(maxNow);
                    viewportRadius = maxNow;
                }
                updateSingleRangeFill(viewportSizeSlider, viewportRangeFill);
            }
            if (viewportOpacitySlider) updateSingleRangeFill(viewportOpacitySlider, viewportOpacityRangeFill);
        }
        updateViewportOverlay();
    }

    function updateViewportOpacity() {
        if (!viewportOpacitySlider) return;
        const percent = parseInt(viewportOpacitySlider.value);
        viewportOpacity = Math.max(0, Math.min(1, percent / 100));
        if (viewportOpacityValue) {
            viewportOpacityValue.textContent = percent + '%';
        }
        updateSingleRangeFill(viewportOpacitySlider, viewportOpacityRangeFill);
        updateViewportOverlay();
    }

    function toggleExtremeBias() {
        extremeBiasEnabled = !!(extremeBiasEnabledEl && extremeBiasEnabledEl.checked);
        
        animateSlideContainer(extremeBiasSlideContainer, extremeBiasEnabled);
        
        if (extremeBiasEnabled && extremeBiasSlider) {
            updateSingleRangeFill(extremeBiasSlider, extremeBiasRangeFill);
        }
    }

    function updateExtremeBias() {
        if (!extremeBiasSlider) return;
        const percent = parseInt(extremeBiasSlider.value);
        extremeBiasIntensity = percent / 100;
        if (extremeBiasValue) {
            extremeBiasValue.textContent = percent + '% bias';
        }
        updateSingleRangeFill(extremeBiasSlider, extremeBiasRangeFill);
    }

    function toggleColorShift() {
        colorShiftEnabled = !!(colorShiftEnabledEl && colorShiftEnabledEl.checked);
        
        animateSlideContainer(colorShiftSlideContainer, colorShiftEnabled);
        
        if (colorShiftEnabled && colorShiftSlider) {
            updateSingleRangeFill(colorShiftSlider, colorShiftRangeFill);
        }
    }

    function updateColorShift() {
        if (!colorShiftSlider) return;
        const percent = parseInt(colorShiftSlider.value);
        colorShiftIntensity = percent / 100;
        if (colorShiftValue) {
            colorShiftValue.textContent = percent + '% variation';
        }
        updateSingleRangeFill(colorShiftSlider, colorShiftRangeFill);
    }

    function shiftColor(hexColor, intensity = colorShiftIntensity) {
        if (!colorShiftEnabled || intensity === 0) {
            return hexColor;
        }

        // Parse hex color
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate shift amount (+/-intensity * 255)
        const maxShift = Math.floor(intensity * 128); // Use 128 instead of 255 for subtler shifts
        
        // Apply random shifts to each channel
        const rShift = (Math.random() - 0.5) * 2 * maxShift;
        const gShift = (Math.random() - 0.5) * 2 * maxShift;
        const bShift = (Math.random() - 0.5) * 2 * maxShift;
        
        // Clamp values to 0-255 range
        const newR = Math.max(0, Math.min(255, Math.round(r + rShift)));
        const newG = Math.max(0, Math.min(255, Math.round(g + gShift)));
        const newB = Math.max(0, Math.min(255, Math.round(b + bShift)));
        
        // Convert back to hex
        const newHex = '#' + 
            newR.toString(16).padStart(2, '0') +
            newG.toString(16).padStart(2, '0') +
            newB.toString(16).padStart(2, '0');
            
        return newHex;
    }

    function parseSubliminalsInput(value) {
        if (!value) return [];
        return value
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    function toggleSubliminals() {
        subliminalsEnabled = !!(subliminalsEnabledEl && subliminalsEnabledEl.checked);
        animateSlideContainer(subliminalsSlideContainer, subliminalsEnabled);
        if (subliminalsEnabled) {
            if (nextSubliminalAtMs === null) {
                scheduleNextSubliminal(performance.now());
            }
        } else {
            nextSubliminalAtMs = null;
            activeSubliminals = [];
        }
    }

    function updateSubliminalsText() {
        if (!subliminalsTextEl) return;
        subliminalsPhrases = parseSubliminalsInput(subliminalsTextEl.value);
    }

    function scheduleNextSubliminal(nowMs) {
        nextSubliminalAtMs = nowMs + subliminalAvgIntervalMs;
        // Sample around avg: +/- 40% variability, clamped to min/max safety bounds
        // const jitter = (Math.random() * 0.8 - 0.4) * subliminalAvgIntervalMs;
        // const interval = Math.max(subliminalMinIntervalMs, Math.min(subliminalMaxIntervalMs, subliminalAvgIntervalMs + jitter));
        // nextSubliminalAtMs = nowMs + interval;
    }

    function spawnSubliminal(nowMs) {
        if (subliminalsPhrases.length === 0) return;
        const text = subliminalsPhrases[subliminalIndex];
        subliminalIndex = (subliminalIndex + 1) % subliminalsPhrases.length;
        // const text = subliminalsPhrases[Math.floor(Math.random() * subliminalsPhrases.length)];
        const marginX = canvas.width * 0.10;
        const marginY = canvas.height * 0.10;
        const x = marginX + Math.random() * (canvas.width - 2 * marginX);
        const y = marginY + Math.random() * (canvas.height - 2 * marginY);
        const durationMs = subliminalDurationMs;
        
        // Pick a random color from the palette WITHOUT advancing the ring color index
        const palette = colorPalette.length ? colorPalette : DEFAULT_COLORS;
        const fillColor = palette[Math.floor(Math.random() * palette.length)];
        
        activeSubliminals.push({ text, x, y, startMs: nowMs, durationMs, fillColor });
    }

    function updateSubliminalDuration() {
        if (!subliminalDurationSlider) return;
        subliminalDurationMs = parseInt(subliminalDurationSlider.value);
        if (subliminalDurationValue) {
            subliminalDurationValue.textContent = subliminalDurationSlider.value + 'ms';
        }
        updateSingleRangeFill(subliminalDurationSlider, subliminalDurationRangeFill);
    }

    function updateSubliminalFont() {
        if (!subliminalFontSlider) return;
        const v = parseInt(subliminalFontSlider.value);
        // 0 means Auto (responsive); otherwise fixed px
        if (v === 0) {
            if (subliminalFontValue) subliminalFontValue.textContent = 'Auto';
        } else {
            if (subliminalFontValue) subliminalFontValue.textContent = v + 'px';
        }
        updateSingleRangeFill(subliminalFontSlider, subliminalFontRangeFill);
    }

    function updateSubliminalInterval() {
        if (!subliminalIntervalSlider) return;
        subliminalAvgIntervalMs = parseInt(subliminalIntervalSlider.value);
        if (subliminalIntervalValue) {
            subliminalIntervalValue.textContent = subliminalAvgIntervalMs + 'ms';
        }
        updateSingleRangeFill(subliminalIntervalSlider, subliminalIntervalRangeFill);
    }

    // Colors
    let colorIndex = 0;
    const DEFAULT_COLORS = ['#5EBCBB', '#D2C02D', '#7E9AFB'];
    let colorPalette = DEFAULT_COLORS.slice();
    let randomizeOrder = false;
    let randomizedOrder = [];
    let randomizedIndex = 0;

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    function rebuildRandomOrder() {
        randomizedOrder = shuffleArray([...Array(colorPalette.length).keys()]);
        randomizedIndex = 0;
    }

    // Separator
    let separatorEnabled = true;
    let separatorColor = '#000000';
    let separatorSpacingPercentMin = 1;   // % of screen diagonal
    let separatorSpacingPercentMax = 5;   // % of screen diagonal
    let waitingForSeparator = false;
    let lastSpawnWasSeparator = false;

    // Distance-accumulator spawning state
    let distanceAccumulatedPx = 0;
    let currentThresholdPx = 0; // distance to accumulate before spawning next ring

    // Helper function to calculate screen diagonal
    function getScreenDiagonal() {
        return Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    }

    // Helper function to get current expansion speed in pixels per second
    function getCurrentExpansionSpeed() {
        return expansionSpeedPercent * getScreenDiagonal();
    }

    class Ring {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.radius = 0;
            this.color = color;
            this.maxRadius = Math.max(canvas.width, canvas.height);
            this.speed = getCurrentExpansionSpeed();
            this.createdTime = Date.now();
        }

        update(deltaTime) {
            this.speed = getCurrentExpansionSpeed();
            this.radius += this.speed * deltaTime;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        isExpired() {
            const age = Date.now() - this.createdTime;
            return age > ringLifetime || this.radius > this.maxRadius;
        }
    }

    function getNextColor() {
        if (randomizeOrder) {
            if (randomizedOrder.length !== colorPalette.length) {
                rebuildRandomOrder();
            }
            if (randomizedIndex >= randomizedOrder.length) {
                rebuildRandomOrder();
            }
            const paletteIndex = randomizedOrder[randomizedIndex++];
            return colorPalette[paletteIndex];
        } else {
            const color = colorPalette[colorIndex];
            colorIndex = (colorIndex + 1) % colorPalette.length;
            return color;
        }
    }

    function createRing(x, y, color = null) {
        const baseColor = color || getNextColor();
        // Only apply color shift to non-separator colors
        const ringColor = (color === separatorColor) ? baseColor : shiftColor(baseColor);
        rings.push(new Ring(x, y, ringColor));
    }

    function animate(currentTime) {
        if (currentTime - lastTime >= 16) {
            const deltaTime = (currentTime - lastTime) / 1000;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = rings.length - 1; i >= 0; i--) {
                const ring = rings[i];
                ring.update(deltaTime);
                if (ring.isExpired()) {
                    rings.splice(i, 1);
                }
            }

            const sortedRings = [...rings].sort((a, b) => b.radius - a.radius);
            for (const ring of sortedRings) {
                ring.draw();
            }

            // Subliminals timing and drawing
            const nowMs = performance.now();
            if (subliminalsEnabled) {
                if (nextSubliminalAtMs === null) {
                    scheduleNextSubliminal(nowMs);
                } else if (nowMs >= nextSubliminalAtMs) {
                    spawnSubliminal(nowMs);
                    scheduleNextSubliminal(nowMs);
                }

                // Draw and prune active subliminals
                ctx.save();
                // Font size: fixed if slider set, else responsive large size
                const isMobile = window.innerWidth <= 768;
                const baseFontSize = isMobile ? 42 : 36;
                const scaleFactor = Math.min(window.innerWidth, window.innerHeight) / 700;
                const autoFontSize = Math.max(28, baseFontSize * scaleFactor);
                const fontSize = (subliminalFontSlider && parseInt(subliminalFontSlider.value) > 0)
                    ? parseInt(subliminalFontSlider.value)
                    : autoFontSize;
                
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                for (let i = activeSubliminals.length - 1; i >= 0; i--) {
                    const s = activeSubliminals[i];
                    if (nowMs - s.startMs >= s.durationMs) {
                        activeSubliminals.splice(i, 1);
                        continue;
                    }
                    
                    // Alpha for fade in/out based on duration
                    const elapsed = nowMs - s.startMs;
                    const t = Math.min(1, Math.max(0, elapsed / s.durationMs));
                    const fadeInEnd = subliminalFadeInFraction;
                    const fadeOutStart = 1 - subliminalFadeOutFraction;
                    let alpha = 1;
                    if (t < fadeInEnd) {
                        alpha = t / fadeInEnd;
                    } else if (t > fadeOutStart) {
                        alpha = Math.max(0, (1 - t) / subliminalFadeOutFraction);
                    }

                    // Draw glowing border using separator color
                    const glowSize = Math.max(2, fontSize / 10);
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = separatorColor;
                    ctx.lineWidth = glowSize;
                    ctx.shadowColor = separatorColor;
                    ctx.shadowBlur = glowSize * 2.5;
                    ctx.strokeText(s.text, s.x, s.y);
                    
                    // Draw main text with palette color
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = s.fillColor;
                    ctx.fillText(s.text, s.x, s.y);
                }
                ctx.restore();
            } else {
                activeSubliminals = [];
            }

            // Accumulate expansion distance and spawn when threshold crossed
            const currentSpeedPxPerSec = getCurrentExpansionSpeed();
            distanceAccumulatedPx += currentSpeedPxPerSec * deltaTime;

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            while (distanceAccumulatedPx >= currentThresholdPx && isAnimating) {
                if (separatorEnabled && waitingForSeparator) {
                    createRing(centerX, centerY, separatorColor);
                    lastSpawnWasSeparator = true;
                    waitingForSeparator = false;
                } else {
                    createRing(centerX, centerY);
                    lastSpawnWasSeparator = false;
                    if (separatorEnabled) {
                        waitingForSeparator = true;
                    }
                }
                distanceAccumulatedPx -= currentThresholdPx;
                // Next threshold is based on what we just spawned, so recompute now
                recomputeCurrentThresholdPx();
            }

            lastTime = currentTime;
        }

        if (isAnimating) {
            animationId = requestAnimationFrame(animate);
        }
    }

    function pickRandomInRange(minVal, maxVal) {
        return biasedRandom() * (maxVal - minVal) + minVal;
    }

    function computePxFromPercentOfDiagonal(percent) {
        return (percent / 100) * getScreenDiagonal();
    }

    function nextMainSpacingPx() {
        const percent = pickRandomInRange(spacingPercentMin, spacingPercentMax);
        return computePxFromPercentOfDiagonal(percent);
    }

    function nextSeparatorSpacingPx() {
        const percent = pickRandomInRange(separatorSpacingPercentMin, separatorSpacingPercentMax);
        return computePxFromPercentOfDiagonal(percent);
    }

    function recomputeCurrentThresholdPx() {
        if (!separatorEnabled) {
            currentThresholdPx = nextMainSpacingPx();
            return;
        }
        currentThresholdPx = lastSpawnWasSeparator ? nextSeparatorSpacingPx() : nextMainSpacingPx();
    }

    function setToggleLabel() {
        toggleBtn.textContent = isAnimating ? 'Pause' : 'Resume';
    }

    function toggleAnimation() {
        isAnimating = !isAnimating;
        setToggleLabel();
        if (isAnimating) {
            animate(0);
        } else {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
    }

    function clearRings() {
        rings = [];
    }

    function clampDualRange(minSlider, maxSlider, outMin, outMax, displayMin, displayMax, fillEl, unitSuffix = 'ms', fractionDigits = 0) {
        const parse = (el) => parseFloat(el.value);
        let minVal = parse(minSlider);
        let maxVal = parse(maxSlider);

        if (minVal > maxVal) {
            minSlider.value = String(maxVal);
            outMin.value = maxVal;
            minVal = maxVal;
        } else {
            outMin.value = minVal;
        }

        if (parse(maxSlider) < parse(minSlider)) {
            maxSlider.value = String(parse(minSlider));
            outMax.value = parse(minSlider);
            maxVal = outMax.value;
        } else {
            outMax.value = maxVal;
        }

        const formatVal = (v) => Number(v).toFixed(fractionDigits) + unitSuffix;
        displayMin.textContent = formatVal(outMin.value);
        displayMax.textContent = formatVal(outMax.value);

        const min = parseFloat(minSlider.min);
        const max = parseFloat(minSlider.max);
        const minPercent = ((parseFloat(minSlider.value) - min) / (max - min)) * 100;
        const maxPercent = ((parseFloat(maxSlider.value) - min) / (max - min)) * 100;
        fillEl.style.left = minPercent + '%';
        fillEl.style.width = (maxPercent - minPercent) + '%';
    }

    function updateSingleRangeFill(sliderEl, fillEl) {
        if (!sliderEl || !fillEl) return;
        const min = parseFloat(sliderEl.min);
        const max = parseFloat(sliderEl.max);
        const value = parseFloat(sliderEl.value);
        const percent = ((value - min) / (max - min)) * 100;
        fillEl.style.left = '0%';
        fillEl.style.width = percent + '%';
    }

    function updateSpawnRange() {
        const outMin = { value: spacingPercentMin };
        const outMax = { value: spacingPercentMax };
        clampDualRange(spawnMinSlider, spawnMaxSlider, outMin, outMax, spawnMinValue, spawnMaxValue, spawnRangeFill, '% diag', 1);
        spacingPercentMin = outMin.value;
        spacingPercentMax = outMax.value;
        if (!waitingForSeparator || !separatorEnabled) {
            recomputeCurrentThresholdPx();
        }
    }

    function updateSeparatorRange() {
        const outMin = { value: separatorSpacingPercentMin };
        const outMax = { value: separatorSpacingPercentMax };
        clampDualRange(separatorMinSlider, separatorMaxSlider, outMin, outMax, separatorMinValueEl, separatorMaxValueEl, separatorRangeFill, '% diag', 2);
        separatorSpacingPercentMin = outMin.value;
        separatorSpacingPercentMax = outMax.value;
        if (separatorEnabled && waitingForSeparator) {
            recomputeCurrentThresholdPx();
        }
    }

    function updateTTL() {
        ringLifetime = parseInt(ttlSlider.value);
        ttlValue.textContent = ttlSlider.value + 'ms';
        updateSingleRangeFill(ttlSlider, ttlRangeFill);
    }

    function updateSpeed() {
        expansionSpeedPercent = parseFloat(speedSlider.value) / 100;
        const currentSpeedPx = getCurrentExpansionSpeed();
        speedValue.textContent = speedSlider.value + '% of screen diagonal/sec (' + Math.round(currentSpeedPx) + ' px/sec)';
        // Update existing rings with new speed
        rings.forEach(r => r.speed = getCurrentExpansionSpeed());
        updateSingleRangeFill(speedSlider, speedRangeFill);
    }

    function renderColorPalette() {
        const paletteContainer = document.getElementById('colorPalette');
        const colorCountElement = document.getElementById('colorCount');
        paletteContainer.innerHTML = '';

        colorPalette.forEach((color, index) => {
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = color;
            colorBox.title = `Color ${index + 1}: ${color}\nClick to edit`;

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.className = 'color-input';
            colorInput.value = color;
            colorInput.addEventListener('change', (e) => {
                updateColor(index, e.target.value);
            });

            colorBox.appendChild(colorInput);
            paletteContainer.appendChild(colorBox);
        });

        colorCountElement.textContent = `${colorPalette.length} color${colorPalette.length !== 1 ? 's' : ''}`;
    }

    function updateColor(index, newColor) {
        colorPalette[index] = newColor;
        renderColorPalette();
    }

    function removeLastColor() {
        if (colorPalette.length > 1) {
            colorPalette.pop();
            if (colorIndex >= colorPalette.length) {
                colorIndex = 0;
            }
            renderColorPalette();
            if (randomizeOrder) {
                rebuildRandomOrder();
            }
        } else {
            const minusBtn = removeColorBtn;
            if (minusBtn) {
                if (removeBtnResetTimeoutId !== null) {
                    clearTimeout(removeBtnResetTimeoutId);
                    removeBtnResetTimeoutId = null;
                }
                minusBtn.title = 'At least 1 color is required!';
                minusBtn.textContent = '!';
                minusBtn.style.animation = 'none';
                minusBtn.offsetHeight;
                minusBtn.style.animation = 'shake 0.5s ease-in-out';
                removeBtnResetTimeoutId = setTimeout(() => {
                    minusBtn.title = removeBtnDefaultTitle;
                    minusBtn.textContent = removeBtnDefaultText;
                    minusBtn.style.animation = '';
                    removeBtnResetTimeoutId = null;
                }, 500);
            }
        }
    }

    function addColor() {
        const newColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        colorPalette.push(newColor);
        renderColorPalette();
        if (randomizeOrder) {
            rebuildRandomOrder();
        }
    }

    function toggleRandomizeOrder() {
        randomizeOrder = !!(randomizeOrderEl && randomizeOrderEl.checked);
        colorIndex = 0;
        randomizedIndex = 0;
        if (randomizeOrder) {
            rebuildRandomOrder();
        }
    }

    function toggleSeparator() {
        separatorEnabled = separatorEnabledEl.checked;
        // Reset alternation state and ensure next threshold matches upcoming ring
        waitingForSeparator = false;
        lastSpawnWasSeparator = false;
        recomputeCurrentThresholdPx();
    }

    function updateSeparatorColor() {
        separatorColor = separatorColorEl.value;
    }

    function hideControls() {
        isControlsHidden = true;
        controls.classList.add('hidden');
    }

    function showControls() {
        isControlsHidden = false;
        controls.classList.remove('hidden');
    }


    function handleCanvasClick(event) {
        if (isControlsHidden) {
            showControls();
        }
    }

    // Resize handling
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        updateSpeed();
        updateViewportOverlay();
        // Diagonal changed so update spacing thresholds
        recomputeCurrentThresholdPx();
        if (viewportSizeSlider) {
            const newMax = computeMaxViewportRadius();
            viewportSizeSlider.max = String(newMax);
            const currentVal = parseInt(viewportSizeSlider.value);
            if (currentVal > newMax) {
                viewportSizeSlider.value = String(newMax);
                viewportRadius = newMax;
            }
            updateSingleRangeFill(viewportSizeSlider, viewportRangeFill);
        }
    });

    // Wire events
    toggleBtn.addEventListener('click', toggleAnimation);
    clearBtn.addEventListener('click', clearRings);
    hideBtn.addEventListener('click', hideControls);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasClick);
    ttlSlider.addEventListener('input', updateTTL);
    speedSlider.addEventListener('input', updateSpeed);
    spawnMinSlider.addEventListener('input', updateSpawnRange);
    spawnMaxSlider.addEventListener('input', updateSpawnRange);
    separatorMinSlider.addEventListener('input', updateSeparatorRange);
    separatorMaxSlider.addEventListener('input', updateSeparatorRange);
    separatorEnabledEl.addEventListener('change', toggleSeparator);
    separatorColorEl.addEventListener('change', updateSeparatorColor);
    addColorBtn.addEventListener('click', addColor);
    removeColorBtn.addEventListener('click', removeLastColor);
    if (randomizeOrderEl) {
        randomizeOrderEl.addEventListener('change', toggleRandomizeOrder);
    }
    if (viewportEnabledEl) {
        viewportEnabledEl.addEventListener('change', toggleViewport);
    }
    if (viewportSizeSlider) {
        viewportSizeSlider.addEventListener('input', updateViewportSize);
    }
    if (viewportOpacitySlider) {
        viewportOpacitySlider.addEventListener('input', updateViewportOpacity);
    }
    if (extremeBiasEnabledEl) {
        extremeBiasEnabledEl.addEventListener('change', toggleExtremeBias);
    }
    if (extremeBiasSlider) {
        extremeBiasSlider.addEventListener('input', updateExtremeBias);
    }
    if (colorShiftEnabledEl) {
        colorShiftEnabledEl.addEventListener('change', toggleColorShift);
    }
    if (colorShiftSlider) {
        colorShiftSlider.addEventListener('input', updateColorShift);
    }
    if (subliminalsEnabledEl) {
        subliminalsEnabledEl.addEventListener('change', toggleSubliminals);
    }
    if (subliminalsTextEl) {
        subliminalsTextEl.addEventListener('input', updateSubliminalsText);
    }
    if (subliminalDurationSlider) {
        subliminalDurationSlider.addEventListener('input', updateSubliminalDuration);
    }
    if (subliminalFontSlider) {
        subliminalFontSlider.addEventListener('input', updateSubliminalFont);
    }
    if (subliminalIntervalSlider) {
        subliminalIntervalSlider.addEventListener('input', updateSubliminalInterval);
    }

    // Init UI from state
    setToggleLabel();
    updateTTL();
    speedSlider.value = Math.round(expansionSpeedPercent * 100);
    updateSpeed();
    updateSpawnRange();
    updateSeparatorRange();
    renderColorPalette();
    // Initialize slider fills
    updateSingleRangeFill(ttlSlider, ttlRangeFill);
    updateSingleRangeFill(speedSlider, speedRangeFill);

    if (viewportSizeSlider) {
        const initMax = computeMaxViewportRadius();
        viewportSizeSlider.max = String(initMax);
        const initVal = parseInt(viewportSizeSlider.value);
        if (initVal > initMax) {
            viewportSizeSlider.value = String(initMax);
            viewportRadius = initMax;
        }
        updateSingleRangeFill(viewportSizeSlider, viewportRangeFill);
    }
    if (viewportOpacitySlider) {
        updateSingleRangeFill(viewportOpacitySlider, viewportOpacityRangeFill);
    }
    if (extremeBiasSlider) {
        updateSingleRangeFill(extremeBiasSlider, extremeBiasRangeFill);
    }
    if (colorShiftSlider) {
        updateSingleRangeFill(colorShiftSlider, colorShiftRangeFill);
    }
    if (subliminalDurationSlider) {
        updateSingleRangeFill(subliminalDurationSlider, subliminalDurationRangeFill);
        updateSubliminalDuration();
    }
    if (subliminalFontSlider) {
        updateSingleRangeFill(subliminalFontSlider, subliminalFontRangeFill);
        updateSubliminalFont();
    }
    if (subliminalIntervalSlider) {
        updateSingleRangeFill(subliminalIntervalSlider, subliminalIntervalRangeFill);
        updateSubliminalInterval();
    }
    toggleViewport();
    toggleExtremeBias();
    toggleColorShift();
    toggleSubliminals();

    // Initialize randomize order from UI
    toggleRandomizeOrder();

    // Initialize spawning: create first main ring and set threshold
    const initCenterX = canvas.width / 2;
    const initCenterY = canvas.height / 2;
    createRing(initCenterX, initCenterY);
    lastSpawnWasSeparator = false;
    waitingForSeparator = separatorEnabled; // next could be separator if enabled
    distanceAccumulatedPx = 0;
    recomputeCurrentThresholdPx();

    // Start
    animate(0);
})();