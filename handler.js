const User = require('./models/User');
const bcrypt = require('bcryptjs');

const addUserLoginList = async (request, h) => {
    const { fullName, email, password, confirmPassword, profilePhoto } = request.payload;

    if (password !== confirmPassword) {
        console.log('Passwords do not match');
        return h.response({
            status: 'fail',
            message: 'Passwords do not match',
        }).code(400);
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('Email already exists');
            return h.response({
                status: 'fail',
                message: 'Email already exists',
            }).code(400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            profilePhoto // Menyimpan URL foto profil
        });

        console.log('User created successfully:', newUser);
        return h.response({
            status: 'success',
            message: 'User registered successfully',
            data: {
                email: newUser.email,
                createdAt: newUser.createdAt,
                profilePhoto: newUser.profilePhoto,
            },
        }).code(201);
    } catch (err) {
        console.error('Error creating user:', err);
        return h.response({
            status: 'fail',
            message: 'Internal Server Error',
        }).code(500);
    }
};

module.exports = { addUserLoginList };