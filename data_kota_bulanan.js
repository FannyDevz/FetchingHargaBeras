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

async function processCityMonthly() {
  try {
    // Ambil semua kombinasi tahun, bulan, dan kota
    const [rows] = await db.execute(`
      SELECT kode_kota, nama_kota, YEAR(tanggal) AS tahun, MONTH(tanggal) AS bulan
      FROM harga_kota
      GROUP BY kode_kota, nama_kota, tahun, bulan
      ORDER BY tahun, bulan, kode_kota
    `);

    for (const row of rows) {
      const { kode_kota, nama_kota, tahun, bulan } = row;
      console.log(`Processing ${nama_kota} bulan ${bulan}-${tahun}...`);

      // Ambil semua harga kota pada bulan dan tahun itu
      const [data] = await db.execute(
        `SELECT harga FROM harga_kota WHERE kode_kota = ? AND YEAR(tanggal) = ? AND MONTH(tanggal) = ?`,
        [kode_kota, tahun, bulan]
      );

      if (data.length === 0) continue;

      let totalHarga = 0;
      let countValid = 0;

      for (const { harga } of data) {
        if (harga > 0) {
          totalHarga += harga;
          countValid++;
        }
      }

      if (countValid > 0) {
        const rataRata = Math.round(totalHarga / countValid);

        // Cek apakah sudah ada data
        const [exists] = await db.execute(
          `SELECT id FROM harga_kota_bulanan WHERE kode_kota = ? AND bulan = ? AND tahun = ?`,
          [kode_kota, bulan, tahun]
        );

        if (exists.length > 0) {
          // Update
          await db.execute(
            `UPDATE harga_kota_bulanan 
             SET harga_ratarata = ?, nama_kota = ?
             WHERE kode_kota = ? AND bulan = ? AND tahun = ?`,
            [rataRata, nama_kota, kode_kota, bulan, tahun]
          );
          console.log(`Updated harga_kota_bulanan untuk ${nama_kota} bulan ${bulan}-${tahun}`);
        } else {
          // Insert
          await db.execute(
            `INSERT INTO harga_kota_bulanan (kode_kota, nama_kota, harga_ratarata, bulan, tahun)
             VALUES (?, ?, ?, ?, ?)`,
            [kode_kota, nama_kota, rataRata, bulan, tahun]
          );
          console.log(`Inserted harga_kota_bulanan untuk ${nama_kota} bulan ${bulan}-${tahun}`);
        }
      } else {
        console.log(`Tidak ada data valid untuk ${nama_kota} bulan ${bulan}-${tahun}`);
      }
    }

    console.log('Selesai proses semua harga_kota_bulanan.');
  } catch (error) {
    console.error('Error di processCityMonthly:', error.message);
  } finally {
    await db.end();
  }
}

processCityMonthly();
