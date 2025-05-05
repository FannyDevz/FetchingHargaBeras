const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'beras', // Ganti nama database kalau beda
  port : 8889,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function processMonthly() {
  try {
    // Ambil semua tahun-bulan unik dari tabel harga_kota
    const [months] = await db.execute(`
      SELECT DISTINCT YEAR(tanggal) AS tahun, MONTH(tanggal) AS bulan
      FROM harga_kota
      ORDER BY tahun, bulan
    `);

    for (const { tahun, bulan } of months) {
      console.log(`Processing bulan ${bulan}-${tahun}...`);

      // Ambil semua data harga_kota pada bulan dan tahun tersebut
      const [data] = await db.execute(
        `SELECT * FROM harga_kota WHERE YEAR(tanggal) = ? AND MONTH(tanggal) = ?`,
        [tahun, bulan]
      );

      if (data.length === 0) continue;

      let hargaTertinggi = null;
      let hargaTerrendah = null;
      let totalHarga = 0;
      let countValid = 0; // Untuk menghitung jumlah harga yang valid (lebih dari 0)

      for (const kota of data) {
        if (kota.harga > 0) {  // Hanya harga > 0 yang dihitung
          // Update harga tertinggi dan terendah
          if (hargaTertinggi === null || kota.harga > hargaTertinggi) hargaTertinggi = kota.harga;
          if (hargaTerrendah === null || kota.harga < hargaTerrendah) hargaTerrendah = kota.harga;
          
          // Menambahkan harga untuk rata-rata
          totalHarga += kota.harga;
          countValid++;  // Menambah count untuk harga yang valid
        }
      }

      if (countValid > 0) {
        // Jika ada harga valid
        const rataRata = Math.round(totalHarga / countValid);

        // Cek apakah sudah ada data untuk bulan ini
        const [exists] = await db.execute(
          `SELECT id FROM harga_bulanan WHERE bulan = ? AND tahun = ?`,
          [bulan, tahun]
        );

        if (exists.length > 0) {
          // Update
          await db.execute(
            `UPDATE harga_bulanan 
             SET harga_tertingi = ?, harga_terrendah = ?, harga_ratarata = ?
             WHERE bulan = ? AND tahun = ?`,
            [hargaTertinggi, hargaTerrendah, rataRata, bulan, tahun]
          );
          console.log(`Updated harga_bulanan untuk ${bulan}-${tahun}`);
        } else {
          // Insert
          await db.execute(
            `INSERT INTO harga_bulanan (harga_tertingi, harga_terrendah, harga_ratarata, bulan, tahun)
             VALUES (?, ?, ?, ?, ?)`,
            [hargaTertinggi, hargaTerrendah, rataRata, bulan, tahun]
          );
          console.log(`Inserted harga_bulanan untuk ${bulan}-${tahun}`);
        }
      } else {
        console.log(`Tidak ada data valid untuk bulan ${bulan}-${tahun}, melewati proses untuk bulan ini.`);
      }
    }

    console.log('Selesai proses semua data bulanan.');
  } catch (error) {
    console.error('Error di processMonthly:', error.message);
  } finally {
    await db.end();
  }
}

processMonthly();
