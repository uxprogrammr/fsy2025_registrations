import bcrypt from 'bcrypt';
import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { fullName, email, mobileNumber, birthDate, pin } = req.body;

        // Format the birth date to YYYY-MM-DD
        const formattedBirthDate = new Date(birthDate).toISOString().split('T')[0];

        if (!fullName || !email || !mobileNumber || !birthDate || !pin) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        try {
            // Verify the counselor details with the registration records
            const result = await query(
                'SELECT * FROM registrations WHERE participant_type = "Participant" AND (email = ? OR phone_number = ?) AND birth_date = ?',
                [email, mobileNumber, formattedBirthDate]
            );

            if (result.length === 0) {
                return res.status(401).json({ success: false, message: 'Participant not found or details do not match' });
            }

            // Check if the counselor already exists in the users table
            const existingUser = await query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (existingUser.length > 0) {
                return res.status(409).json({ success: false, message: 'Participant already registered' });
            }

            // Hash the pin code
            const hashedPin = await bcrypt.hash(pin, 10);

            // Prepare the SQL query and print it
            const sqlQuery = 'INSERT INTO users (full_name, email, phone_number, birth_date, password_hash, user_type) VALUES (?, ?, ?, ?, ?, ?)';
            const sqlValues = [fullName, email, mobileNumber, formattedBirthDate, hashedPin, 'Counselor'];

            // Insert the counselor data into the users table
            const insertResult = await query(sqlQuery, [fullName, email, mobileNumber, formattedBirthDate, hashedPin, 'Participant']);

            if (insertResult.affectedRows === 1) {
                res.status(201).json({ success: true, message: 'Participant registered successfully' });
            } else {
                res.status(500).json({ success: false, message: 'Failed to register Participant' });
            }
        } catch (error) {
            console.error('Sign up error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
