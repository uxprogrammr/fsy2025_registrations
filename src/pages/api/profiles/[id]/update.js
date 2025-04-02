import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query;
    const updateData = req.body;

    try {
        // Format the birth_date if it exists
        if (updateData.birth_date) {
            const date = new Date(updateData.birth_date);
            updateData.birth_date = date.toISOString().split('T')[0]; // Converts to YYYY-MM-DD format
        }

        // Filter out undefined or null values
        const validUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(([_, value]) => value !== null && value !== undefined)
        );

        // Create dynamic update query
        const updateFields = Object.keys(validUpdateData)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(validUpdateData), id];

        const sql = `
            UPDATE registrations 
            SET ${updateFields}
            WHERE fsy_id = ?
        `;

        console.log('SQL Query:', sql); // Debug log
        console.log('Values:', values); // Debug log

        const result = await query(sql, values);

        console.log('Update result:', result); // Debug log

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Profile not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating profile data',
            error: error.message
        });
    }
} 