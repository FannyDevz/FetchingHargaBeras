const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'beras',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function processDaily() {
  try {
    // Ambil semua tanggal unik
    const [dates] = await db.execute('SELECT DISTINCT tanggal FROM harga_kota ORDER BY tanggal ASC');

    for (const row of dates) {
      const tanggal = row.tanggal;

      console.log(`Processing tanggal ${tanggal}...`);

      // Fetch semua data pada tanggal tersebut
      const [data] = await db.execute('SELECT * FROM harga_kota WHERE tanggal = ?', [tanggal]);

      if (data.length === 0) continue;

      let hargaTertinggi = null;
      let hargaTerrendah = null;
      let totalHarga = 0;
      let countValid = 0; // Untuk menghitung jumlah harga yang valid (lebih dari 0)

      for (const kota of data) {
        if (kota.harga > 0) {  // Hanya harga > 0 yang dihitung
          // Update harga tertinggi dan terendah
          if (hargaTertinggi === null || kota.harga > hargaTertinggi.harga) hargaTertinggi = kota;
          if (hargaTerrendah === null || kota.harga < hargaTerrendah.harga) hargaTerrendah = kota;
          
          // Menambahkan harga untuk rata-rata
          totalHarga += kota.harga;
          countValid++;  // Menambah count untuk harga yang valid
        }
      }

      if (countValid > 0) {
        // Jika ada harga valid
        const rataRata = Math.round(totalHarga / countValid);

        // Cek apakah sudah ada data untuk tanggal ini
        const [exists] = await db.execute('SELECT id FROM harga_harian WHERE tanggal = ?', [tanggal]);

        if (exists.length > 0) {
          // Update
          await db.execute(
            `UPDATE harga_harian 
             SET kode_kota_tertinggi = ?, nama_kota_tertinggi = ?, harga_tertingi = ?,
                 kode_kota_terrendah = ?, nama_kota_terrendah = ?, harga_terrendah = ?, harga_ratarata = ?
             WHERE tanggal = ?`,
            [
              hargaTertinggi.kode_kota, hargaTertinggi.nama_kota, hargaTertinggi.harga,
              hargaTerrendah.kode_kota, hargaTerrendah.nama_kota, hargaTerrendah.harga,
              rataRata,
              tanggal
            ]
          );
          console.log(`Updated harga_harian untuk ${tanggal}`);
        } else {
          // Insert
          await db.execute(
            `INSERT INTO harga_harian
            (kode_kota_tertinggi, nama_kota_tertinggi, harga_tertingi,
             kode_kota_terrendah, nama_kota_terrendah, harga_terrendah, harga_ratarata, tanggal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              hargaTertinggi.kode_kota, hargaTertinggi.nama_kota, hargaTertinggi.harga,
              hargaTerrendah.kode_kota, hargaTerrendah.nama_kota, hargaTerrendah.harga,
              rataRata,
              tanggal
            ]
          );
          console.log(`Inserted harga_harian untuk ${tanggal}`);
        }
      } else {
        console.log(`Tidak ada data valid untuk tanggal ${tanggal}, melewati proses untuk hari ini.`);
      }
    }

    console.log('Selesai proses semua data harian.');
  } catch (error) {
    console.error('Error di processDaily:', error.message);
  } finally {
    await db.end();
  }
}

processDaily();
