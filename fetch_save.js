const mysql = require('mysql2/promise');
const axios = require('axios');

// Konfigurasi koneksi database
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

// Fungsi untuk format tanggal (YYYY-MM-DD)
function formatDate(date) {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
}
// Buat array semua tanggal
function generateDates(start, end) {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
  
  // Proses 1 tanggal
  async function processDate(tanggal) {
    const apiUrl = `https://siskaperbapo.jatimprov.go.id/home2/getDataMap/?tanggal=${tanggal}&komoditas=4`;
  
    try {
      console.log(`Fetching data for ${tanggal}...`);
      const response = await axios.get(apiUrl);
      const result = response.data;
  
      if (result && result.data) {
        for (const kode in result.data) {
          const kota = result.data[kode];
          if (kota && kota.nama && kota.hrg !== undefined) {
            // Cek apakah sudah ada
            const [rows] = await db.execute(
              'SELECT id FROM harga_kota WHERE kode_kota = ? AND tanggal = ?',
              [kota.code, tanggal]
            );
  
            if (rows.length > 0) {
              // UPDATE
              await db.execute(
                'UPDATE harga_kota SET harga = ?, nama_kota = ? WHERE id = ?',
                [kota.hrg, kota.nama, rows[0].id]
              );
              console.log(`Updated: ${kota.nama} (${tanggal})`);
            } else {
              // INSERT
              await db.execute(
                'INSERT INTO harga_kota (kode_kota, nama_kota, harga, tanggal) VALUES (?, ?, ?, ?)',
                [kota.code, kota.nama, kota.hrg, tanggal]
              );
              console.log(`Inserted: ${kota.nama} (${tanggal})`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching for ${tanggal}:`, error.message);
    }
  }
  
  // Fungsi utama
  async function fetchAndSaveAll() {
    const startDate = new Date('2020-01-01');
    const endDate = new Date();
    const allDates = generateDates(startDate, endDate);
  
    const batchSize = 10;
  
    for (let i = 0; i < allDates.length; i += batchSize) {
      const batch = allDates.slice(i, i + batchSize);
  
      console.log(`Processing batch ${i / batchSize + 1}...`);
  
      // Fetch 10 tanggal sekaligus
      await Promise.all(batch.map(tanggal => processDate(tanggal)));
  
      console.log(`Batch ${i / batchSize + 1} done.`);
    }
  
    console.log('Semua data selesai di-fetch dan disimpan!');
  }
  
  fetchAndSaveAll();
