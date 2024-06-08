const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const { connectDB, sequelize } = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir); // Direktori tujuan penyimpanan file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Menambahkan timestamp pada nama file
    }
});

const upload = multer({ storage });

const init = async () => {
    await connectDB(); // Connect to MySQL

    // Sync all models that aren't already in the database
    await sequelize.sync({ alter: true });

    const server = Hapi.server({
        port: process.env.PORT || 8000,
        host: '0.0.0.0',
    });

    server.route(routes);

    // Route untuk pengunggahan foto profil
    server.route({
        method: 'POST',
        path: '/upload',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                multipart: true
            }
        },
        handler: async (request, h) => {
            const file = request.payload.profilePhoto;
            const filePath = `uploads/${Date.now()}_${file.hapi.filename}`;
            const fileStream = fs.createWriteStream(filePath);

            return new Promise((resolve, reject) => {
                file.pipe(fileStream);
                file.on('end', (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(h.response({
                        status: 'success',
                        message: 'File uploaded successfully',
                        data: {
                            filePath
                        }
                    }).code(201));
                });
            });
        }
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();