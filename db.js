const { Sequelize } = require('sequelize');
require('env').config(); // Mengimpor dan mengkonfigurasi dotenv

// Tambahkan log untuk memastikan variabel lingkungan dimuat dengan benar
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);
console.log('DB_HOST:', process.env.DB_HOST);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: `/cloudsql/${process.env.DB_HOST}`,
    dialect: 'mysql',
    dialectOptions: {
        socketPath: `/cloudsql/${process.env.DB_HOST}`
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database Connected...');
    } catch (err) {
        console.error('Unable to connect to the database:', err.message);
        process.exit(1);
    }
};

module.exports = { connectDB, sequelize };
