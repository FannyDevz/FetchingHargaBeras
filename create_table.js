const mysql = require('mysql2/promise');

(async () => {
  // Buat koneksi ke database
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'beras',
    port: 8889 
  });

  try {
    // Buat tabel harga_kota
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS harga_kota (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kode_kota VARCHAR(50) NOT NULL,
        nama_kota VARCHAR(100) NOT NULL,
        harga INT NOT NULL,
        tanggal DATE NOT NULL
      );
    `);

    // Buat tabel harga_harian
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS harga_harian (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kode_kota_tertinggi VARCHAR(50) NULL, 
        nama_kota_tertinggi VARCHAR(100) NULL, 
        harga_tertingi INT NOT NULL,
        kode_kota_terrendah VARCHAR(50) NULL, 
        nama_kota_terrendah VARCHAR(100) NULL,  
        harga_terrendah INT NOT NULL,  
        harga_ratarata INT NOT NULL,
        tanggal DATE NOT NULL
      );
    `);

    // Buat tabel harga_bulanan (hapus koma setelah tahun)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS harga_bulanan ( 
        id INT AUTO_INCREMENT PRIMARY KEY,
        harga_tertingi INT NOT NULL,
        harga_terrendah INT NOT NULL,  
        harga_ratarata INT NOT NULL,
        bulan INT, 
        tahun INT
      );
    `);

    // Buat tabel harga_kota_bulanan
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS harga_kota_bulanan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kode_kota VARCHAR(50) NOT NULL,
        nama_kota VARCHAR(100) NOT NULL,
        harga_ratarata INT NOT NULL,
        bulan INT NOT NULL,
        tahun INT NOT NULL
      );
    `);

    console.log('Semua tabel berhasil dibuat.');
  } catch (err) {
    console.error('Gagal membuat tabel:', err.message);
  } finally {
    await connection.end();
  }
})();
