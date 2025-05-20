import { query } from '@/lib/db';

export default async function handler(req, res) {
    const { id } = req.query;

    switch (req.method) {
        case 'GET':
            return getCompanyMember(req, res, id);
        case 'DELETE':
            return deleteCompanyMember(req, res, id);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

async function getCompanyMember(req, res, id) {
    try {
        const result = await query(`
            SELECT 
                cm.*,
                c.company_name,
                c.company_number,
                cg.group_name,
                cg.group_number
            FROM company_members cm
            JOIN companies c ON cm.company_id = c.company_id
            JOIN companies_groups cg ON cm.group_id = cg.group_id
            WHERE cm.fsy_id = ?
        `, [id]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Company member not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching company member'
        });
    }
}

async function deleteCompanyMember(req, res, id) {
    try {
        // Start a transaction
        await query('START TRANSACTION');

        try {
            // Delete from company_members
            const result = await query(`
                DELETE FROM company_members
                WHERE fsy_id = ?
            `, [id]);

            if (result.affectedRows === 0) {
                await query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Company member not found'
                });
            }

            // Clear company_name and group_name in registrations
            await query(`
                UPDATE registrations 
                SET company_name = NULL, group_name = NULL 
                WHERE fsy_id = ?
            `, [id]);

            // Commit the transaction
            await query('COMMIT');

            return res.status(200).json({
                success: true,
                message: 'Member removed from company successfully'
            });
        } catch (error) {
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error removing member from company'
        });
    }
}