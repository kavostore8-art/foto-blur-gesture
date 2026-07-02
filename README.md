# 📸 Website Foto Blur dengan Gesture

Website interaktif untuk mengambil foto dengan fitur blur otomatis menggunakan gesture tangan (2 jari).

## ✨ Fitur Utama

- 🎥 **Live Camera Feed** - Tampilan kamera real-time
- 🖐️ **Gesture Detection** - Deteksi gesture tangan menggunakan TensorFlow HandPose
- 🔴 **Auto Blur** - Blur otomatis saat menunjukkan gesture 2 jari (peace sign)
- 📸 **Photo Capture** - Ambil foto dengan blur atau normal sesuai gesture
- 🖼️ **Photo Gallery** - Galeri foto dengan fitur hapus
- 💾 **Local Storage** - Foto disimpan di browser
- 📱 **Responsive Design** - Bekerja di desktop dan mobile

## 🚀 Cara Menggunakan

1. **Buka website** di browser modern (Chrome, Firefox, Safari, Edge)
2. **Izinkan akses kamera** saat diminta
3. **Gesture untuk Blur:**
   - Tunjukkan **2 jari** (peace sign) → Kamera blur 🔴
   - **Tutup jari** → Kamera normal 🟢
4. **Ambil foto** dengan klik tombol "📸 Ambil Foto"
5. **Lihat galeri** - Foto tersimpan otomatis di bawah
6. **Hapus foto** - Klik × di sudut foto untuk menghapus

## 🛠️ Teknologi

- **HTML5** - Struktur halaman
- **CSS3** - Styling dan animasi
- **JavaScript** - Logic aplikasi
- **TensorFlow.js** - Machine learning
- **MediaDevices API** - Akses kamera
- **Canvas API** - Pemrosesan gambar
- **LocalStorage API** - Penyimpanan foto

## 📋 Requirement

- Browser modern dengan support:
  - WebRTC (getUserMedia)
  - Canvas API
  - WebGL (untuk TensorFlow.js)
- Kamera/webcam
- JavaScript enabled
- HTTPS atau localhost (untuk akses kamera)

## 📁 Struktur File

```
foto-blur-gesture/
├── index.html      # Halaman utama
├── styles.css      # Styling dan responsif
├── app.js          # Logic aplikasi
└── README.md       # Dokumentasi
```

## 🎯 Cara Kerja

### Gesture Detection
```
HandPose Model → Analyze Landmarks → Check Distance Between Fingers
   ↓
Peace Sign Detected (Index + Middle Open, Others Closed)
   ↓
isBlurActive = true
   ↓
Apply Canvas Blur Filter
```

### Photo Capture Flow
```
Canvas Current State → Draw to Photo Canvas
   ↓
Convert to JPEG → Save to Array
   ↓
Store in LocalStorage
   ↓
Render in Gallery
```

## ⚙️ Konfigurasi

Edit di `app.js`:

```javascript
// Blur filter strength (pixel)
const BLUR_STRENGTH = 15;

// Confidence threshold untuk gesture
const FINGER_THRESHOLD = 0.7;
```

## 🐛 Troubleshooting

### Kamera tidak terbuka
- Pastikan browser mendapat permission akses kamera
- Gunakan HTTPS atau localhost
- Coba browser lain (Chrome paling support)

### Gesture tidak terdeteksi
- Pastikan tangan berada di frame kamera
- Pencahayaan yang baik
- Ubah `FINGER_THRESHOLD` menjadi lebih rendah

### Blur tidak jelas
- Naikkan `BLUR_STRENGTH` di app.js
- Kontras pencahayaan yang lebih baik

## 📱 Browser Support

| Browser | Support |
|---------|----------|
| Chrome  | ✅ Full Support |
| Firefox | ✅ Full Support |
| Safari  | ✅ Full Support (iOS 14.5+) |
| Edge    | ✅ Full Support |
| Opera   | ✅ Full Support |

## 🔒 Privacy

- Semua pemrosesan gambar dilakukan di browser (client-side)
- Tidak ada data yang dikirim ke server
- Foto hanya tersimpan di LocalStorage browser Anda
- Hapus data browser untuk menghapus semua foto

## 📄 Lisensi

Free to use

## 👨‍💻 Developer

Dibuat dengan ❤️ menggunakan TensorFlow.js

---

**Selamat menggunakan! Ambil foto bagus Anda! 📸**