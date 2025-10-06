📊 Data Fetch & Save Script (Node.js)

Script ini digunakan untuk membuat tabel dan mengambil data harian, bulanan, serta data kota bulanan secara otomatis menggunakan Node.js.

⚙️ Persyaratan
Pastikan kamu sudah menginstal:
- Node.js versi 16 atau lebih baru
- npm (biasanya sudah termasuk dalam instalasi Node.js)

🚀 Instalasi
1. Clone repository ini
2. Jalankan perintah berikut untuk menginstal dependensi:
   npm install

📁 Struktur Folder
- .gitignore
- create_table.js
- data_harian.js
- data_bulanan.js
- data_kota_bulanan.js
- fetch_save.js
- package.json
- package-lock.json

🔄 Urutan Eksekusi Script

1️⃣ Membuat tabel di database
   node create_table.js
   -> Script ini akan membuat tabel yang dibutuhkan di database.

2️⃣ Mengambil dan menyimpan data harian
   node data_harian.js
   -> Mengambil data harian dan menyimpannya ke tabel.

3️⃣ Mengambil dan menyimpan data bulanan
   node data_bulanan.js
   -> Mengambil data bulanan dan memperbarui tabel.

4️⃣ Mengambil dan menyimpan data kota bulanan
   node data_kota_bulanan.js
   -> Mengambil data berdasarkan kota per bulan dan menyimpannya ke database.

5️⃣ Menjalankan pengambilan dan penyimpanan data otomatis
   node fetch_save.js
   -> Menjalankan proses pengambilan dan penyimpanan data secara otomatis.

🧩 Catatan Tambahan
- Pastikan konfigurasi database atau API key sudah benar.
- Jika terjadi error koneksi, pastikan environment variable sudah diatur dengan benar.

🧠 Tips Penggunaan
Untuk menjalankan semua script berurutan:
   node create_table.js && node data_harian.js && node data_bulanan.js && node data_kota_bulanan.js && node fetch_save.js

📄 Lisensi
Script ini dibuat oleh FannyDevz dan dilisensikan bebas untuk penggunaan pribadi dan pembelajaran.

