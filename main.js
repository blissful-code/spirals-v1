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
    const removeBtnDefaultTitle = removeColorBtn ? removeColorBtn.title : 'Remove last color';
    const removeBtnDefaultText = removeColorBtn ? removeColorBtn.textContent : '−';
    let removeBtnResetTimeoutId = null;

    // State
    let rings = [];
    let animationId;
    let isAnimating = true;
    let lastTime = 0;
    let generationTimeoutId = null;
    let isControlsHidden = false;

    // Timings
    let spawnIntervalMin = 200;
    let spawnIntervalMax = 1000;
    let ringLifetime = 9000;
    let expansionSpeed = 5.5;

    // Circular viewport
    let viewportEnabled = false;
    let viewportRadius = 250;
    let viewportCenterX = 0.5; // percentage of width
    let viewportCenterY = 0.5; // percentage of height
    let viewportOpacity = 0.95; // 0..1

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
            viewportSizeValue.style.display = viewportEnabled ? '' : 'none';
        }
        updateSingleRangeFill(viewportSizeSlider, viewportRangeFill);
        updateViewportOverlay();
    }

    function toggleViewport() {
        viewportEnabled = !!(viewportEnabledEl && viewportEnabledEl.checked);
        if (viewportSizeControls) viewportSizeControls.style.display = viewportEnabled ? '' : 'none';
        if (viewportSizeValue) viewportSizeValue.style.display = viewportEnabled ? '' : 'none';
        if (viewportOpacityControls) viewportOpacityControls.style.display = viewportEnabled ? '' : 'none';
        if (viewportOpacityValue) viewportOpacityValue.style.display = viewportEnabled ? '' : 'none';
        if (viewportOpacityLabel) viewportOpacityLabel.style.display = viewportEnabled ? '' : 'none';
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
            viewportOpacityValue.style.display = viewportEnabled ? '' : 'none';
        }
        updateSingleRangeFill(viewportOpacitySlider, viewportOpacityRangeFill);
        updateViewportOverlay();
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
    let separatorIntervalMin = 50;
    let separatorIntervalMax = 250;
    let waitingForSeparator = false;

    class Ring {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.radius = 0;
            this.color = color;
            this.maxRadius = Math.max(canvas.width, canvas.height);
            this.speed = expansionSpeed;
            this.createdTime = Date.now();
        }

        update() {
            this.radius += this.speed;
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
        const ringColor = color || getNextColor();
        rings.push(new Ring(x, y, ringColor));
    }

    function animate(currentTime) {
        if (currentTime - lastTime >= 16) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = rings.length - 1; i >= 0; i--) {
                const ring = rings[i];
                ring.update();
                if (ring.isExpired()) {
                    rings.splice(i, 1);
                }
            }

            const sortedRings = [...rings].sort((a, b) => b.radius - a.radius);
            for (const ring of sortedRings) {
                ring.draw();
            }

            lastTime = currentTime;
        }

        if (isAnimating) {
            animationId = requestAnimationFrame(animate);
        }
    }

    function scheduleNext(fn, minMs, maxMs) {
        clearGenerationTimeout();
        const delay = Math.random() * (maxMs - minMs) + minMs;
        generationTimeoutId = setTimeout(fn, delay);
    }

    function clearGenerationTimeout() {
        if (generationTimeoutId !== null) {
            clearTimeout(generationTimeoutId);
            generationTimeoutId = null;
        }
    }

    function autoGenerateRings() {
        if (!isAnimating) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (waitingForSeparator && separatorEnabled) {
            createRing(centerX, centerY, separatorColor);
            waitingForSeparator = false;
            scheduleNext(autoGenerateRings, separatorIntervalMin, separatorIntervalMax);
        } else {
            createRing(centerX, centerY);
            if (separatorEnabled) {
                waitingForSeparator = true;
                scheduleNext(autoGenerateRings, spawnIntervalMin, spawnIntervalMax);
            } else {
                scheduleNext(autoGenerateRings, spawnIntervalMin, spawnIntervalMax);
            }
        }
    }

    function setToggleLabel() {
        toggleBtn.textContent = isAnimating ? 'Pause' : 'Resume';
    }

    function toggleAnimation() {
        isAnimating = !isAnimating;
        setToggleLabel();
        if (isAnimating) {
            animate(0);
            autoGenerateRings();
        } else {
            clearGenerationTimeout();
        }
    }

    function clearRings() {
        rings = [];
    }

    function clampDualRange(minSlider, maxSlider, outMin, outMax, displayMin, displayMax, fillEl) {
        const minVal = parseInt(minSlider.value);
        const maxVal = parseInt(maxSlider.value);

        if (minVal > maxVal) {
            minSlider.value = maxVal;
            outMin.value = maxVal;
        } else {
            outMin.value = minVal;
        }

        if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
            maxSlider.value = minSlider.value;
            outMax.value = parseInt(minSlider.value);
        } else {
            outMax.value = maxVal;
        }

        displayMin.textContent = outMin.value + 'ms';
        displayMax.textContent = outMax.value + 'ms';

        const min = parseInt(minSlider.min);
        const max = parseInt(minSlider.max);
        const minPercent = ((parseInt(minSlider.value) - min) / (max - min)) * 100;
        const maxPercent = ((parseInt(maxSlider.value) - min) / (max - min)) * 100;
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
        const outMin = { value: spawnIntervalMin };
        const outMax = { value: spawnIntervalMax };
        clampDualRange(spawnMinSlider, spawnMaxSlider, outMin, outMax, spawnMinValue, spawnMaxValue, spawnRangeFill);
        spawnIntervalMin = outMin.value;
        spawnIntervalMax = outMax.value;
    }

    function updateSeparatorRange() {
        const outMin = { value: separatorIntervalMin };
        const outMax = { value: separatorIntervalMax };
        clampDualRange(separatorMinSlider, separatorMaxSlider, outMin, outMax, separatorMinValueEl, separatorMaxValueEl, separatorRangeFill);
        separatorIntervalMin = outMin.value;
        separatorIntervalMax = outMax.value;
    }

    function updateTTL() {
        ringLifetime = parseInt(ttlSlider.value);
        ttlValue.textContent = ttlSlider.value + 'ms';
        updateSingleRangeFill(ttlSlider, ttlRangeFill);
    }

    function updateSpeed() {
        expansionSpeed = parseFloat(speedSlider.value);
        speedValue.textContent = speedSlider.value + ' px/frame';
        rings.forEach(r => r.speed = expansionSpeed);
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
        waitingForSeparator = false;
        if (isAnimating) {
            autoGenerateRings();
        }
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
        // Keep overlay hole centered and clamp size to viewport
        updateViewportOverlay();
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

    // Init UI from state
    setToggleLabel();
    updateTTL();
    updateSpeed();
    updateSpawnRange();
    updateSeparatorRange();
    renderColorPalette();
    // Initialize slider fills
    updateSingleRangeFill(ttlSlider, ttlRangeFill);
    updateSingleRangeFill(speedSlider, speedRangeFill);
    // Ensure size slider max matches diagonal before computing its fill
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
    toggleViewport();

    // Initialize randomize order from UI
    toggleRandomizeOrder();

    // Start
    animate(0);
    autoGenerateRings();
})();