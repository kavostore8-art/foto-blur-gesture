// ==================== Global Variables ====================
let video = null;
let canvas = null;
let ctx = null;
let model = null;
let isRunning = false;
let isBlurActive = false;
let photos = [];

// Blur filter strength
const BLUR_STRENGTH = 15;
const FINGER_THRESHOLD = 0.7;

// ==================== Initialize ====================
async function initialize() {
    try {
        // Get elements
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Load model
        console.log('Loading HandPose model...');
        model = await handpose.load();
        console.log('Model loaded successfully!');

        // Start camera
        await startCamera();

        // Load photos from localStorage
        loadPhotos();

        // Setup event listeners
        setupEventListeners();

        // Hide status
        document.getElementById('status').classList.add('hidden');

        // Start detection
        detectGestures();
    } catch (error) {
        console.error('Error initializing:', error);
        alert('Error: ' + error.message);
    }
}

// ==================== Start Camera ====================
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        isRunning = true;

        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                // Resize canvas to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve();
            };
        });
    } catch (error) {
        console.error('Error accessing camera:', error);
        throw new Error('Tidak bisa akses kamera. Pastikan Anda sudah memberikan permission.');
    }
}

// ==================== Detect Gestures ====================
async function detectGestures() {
    if (!isRunning) {
        requestAnimationFrame(detectGestures);
        return;
    }

    try {
        // Get predictions
        const predictions = await model.estimateHands(video);

        // Draw video to canvas
        drawVideoToCanvas();

        // Check gesture
        if (predictions.length > 0) {
            const hand = predictions[0];
            const isGestureActive = checkTwoFingerGesture(hand);

            if (isGestureActive !== isBlurActive) {
                isBlurActive = isGestureActive;
                updateGestureIndicator();
            }

            // Apply blur if gesture is active
            if (isBlurActive) {
                applyBlur();
            }
        } else {
            // No hand detected
            if (isBlurActive) {
                isBlurActive = false;
                updateGestureIndicator();
            }
        }

    } catch (error) {
        console.error('Error in gesture detection:', error);
    }

    requestAnimationFrame(detectGestures);
}

// ==================== Check Two Finger Gesture ====================
function checkTwoFingerGesture(hand) {
    const landmarks = hand.landmarks;
    const score = hand.handInVertices;

    // Jika score rendah, tidak valid
    if (!score || score[0] < FINGER_THRESHOLD) {
        return false;
    }

    // Hitung jarak antar jari
    // Index finger: landmark 8
    // Middle finger: landmark 12
    // Ring finger: landmark 16
    // Pinky: landmark 20
    // Thumb: landmark 4

    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Hitung distance
    const distIndexMiddle = calculateDistance(indexTip, middleTip);
    const distMiddleRing = calculateDistance(middleTip, ringTip);
    const distRingPinky = calculateDistance(ringTip, pinkyTip);

    // Gesture 2 jari: index dan middle terbuka lebar, jari lain tertutup
    const indexOpen = distIndexMiddle > 30;
    const middleOpen = distMiddleRing < 25;
    const ringClosed = distRingPinky < 25;

    return indexOpen && middleOpen && ringClosed;
}

// ==================== Calculate Distance ====================
function calculateDistance(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    return Math.sqrt(dx * dx + dy * dy);
}

// ==================== Draw Video To Canvas ====================
function drawVideoToCanvas() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

// ==================== Apply Blur ====================
function applyBlur() {
    // Blur menggunakan canvas filter
    // Ini adalah cara sederhana untuk blur
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = canvas.width;
    blurCanvas.height = canvas.height;
    const blurCtx = blurCanvas.getContext('2d');

    // Draw dengan blur filter
    blurCtx.filter = `blur(${BLUR_STRENGTH}px)`;
    blurCtx.drawImage(canvas, 0, 0);

    // Copy back to main canvas
    ctx.drawImage(blurCanvas, 0, 0);
}

// ==================== Update Gesture Indicator ====================
function updateGestureIndicator() {
    const indicator = document.getElementById('gesture-indicator');
    const gestureText = document.getElementById('gesture-text');

    if (isBlurActive) {
        indicator.classList.add('blur-active');
        indicator.classList.remove('normal-mode');
        gestureText.textContent = '🔴 BLUR ON';
    } else {
        indicator.classList.add('normal-mode');
        indicator.classList.remove('blur-active');
        gestureText.textContent = '🟢 NORMAL';
    }
}

// ==================== Capture Photo ====================
function capturePhoto() {
    try {
        // Create new canvas for photo
        const photoCanvas = document.createElement('canvas');
        photoCanvas.width = canvas.width;
        photoCanvas.height = canvas.height;
        const photoCtx = photoCanvas.getContext('2d');

        // Draw current canvas state
        photoCtx.drawImage(canvas, 0, 0);

        // Convert to image data
        const imageData = photoCanvas.toDataURL('image/jpeg', 0.95);

        // Save to photos array
        photos.unshift({
            id: Date.now(),
            data: imageData,
            timestamp: new Date().toLocaleString('id-ID')
        });

        // Save to localStorage
        savePhotos();

        // Update gallery
        renderGallery();

        // Show notification
        showNotification('✅ Foto berhasil diambil!');
    } catch (error) {
        console.error('Error capturing photo:', error);
        alert('Error mengambil foto: ' + error.message);
    }
}

// ==================== Show Notification ====================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 25px;
        font-weight: bold;
        z-index: 1000;
        animation: slideDown 0.5s ease-out;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideDown 0.5s ease-out reverse';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// ==================== Setup Event Listeners ====================
function setupEventListeners() {
    // Capture button
    document.getElementById('captureBtn').addEventListener('click', capturePhoto);

    // Toggle camera button
    document.getElementById('toggleBtn').addEventListener('click', toggleCamera);
}

// ==================== Toggle Camera ====================
function toggleCamera() {
    isRunning = !isRunning;
    const btn = document.getElementById('toggleBtn');
    if (isRunning) {
        btn.textContent = '⏸️ Pause Camera';
        video.style.display = 'block';
    } else {
        btn.textContent = '▶️ Resume Camera';
        video.style.display = 'none';
    }
}

// ==================== Render Gallery ====================
function renderGallery() {
    const photoGrid = document.getElementById('photoGrid');

    if (photos.length === 0) {
        photoGrid.innerHTML = '<div class="empty-state"><p>Belum ada foto. Ambil foto sekarang! 📸</p></div>';
        return;
    }

    photoGrid.innerHTML = photos.map(photo => `
        <div class="photo-item">
            <img src="${photo.data}" alt="Photo ${photo.id}">
            <button class="delete-btn" onclick="deletePhoto(${photo.id})">×</button>
            <div style="padding: 8px; font-size: 0.8em; color: #666; text-align: center;">
                ${photo.timestamp}
            </div>
        </div>
    `).join('');
}

// ==================== Delete Photo ====================
function deletePhoto(id) {
    if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
        photos = photos.filter(photo => photo.id !== id);
        savePhotos();
        renderGallery();
        showNotification('🗑️ Foto dihapus');
    }
}

// ==================== Save Photos to LocalStorage ====================
function savePhotos() {
    try {
        localStorage.setItem('photos', JSON.stringify(photos));
    } catch (error) {
        console.error('Error saving photos:', error);
    }
}

// ==================== Load Photos from LocalStorage ====================
function loadPhotos() {
    try {
        const saved = localStorage.getItem('photos');
        if (saved) {
            photos = JSON.parse(saved);
            renderGallery();
        }
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

// ==================== Start on Page Load ====================
document.addEventListener('DOMContentLoaded', initialize);

// ==================== Handle Page Visibility ====================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        isRunning = false;
    } else {
        isRunning = true;
    }
});