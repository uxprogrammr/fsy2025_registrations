import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Missing username or password' });
        }

        try {
            // Admin login: Verify email and password
            const result = await query('SELECT * FROM users WHERE user_type = "Coordinator" and (email = ? or phone_number =?)', [username, username]);

            if (result.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            const user = result[0];

            const hashPassword = (password) => {
                return crypto.createHash('sha256').update(password).digest('hex');
            };

            const hashedInputPassword = hashPassword(password);

            if (user.password_hash !== hashedInputPassword) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }


            // Generate JWT token for Admin
            const token = jwt.sign({ userId: user.user_id, userType: user.user_type, fullName: user.full_name }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            return res.status(200).json({ success: true, token, fullName: user.full_name });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
