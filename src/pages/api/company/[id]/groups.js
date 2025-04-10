import { query } from '@/lib/db';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'DELETE') {
        try {
            const result = await query(`
                DELETE FROM companies
                WHERE company_id = ?
            `, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Company deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error deleting company'
            });
        }
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const result = await query(`
            SELECT 
                group_id,
                group_number,
                group_name,
                created_at
            FROM companies_groups
            WHERE company_id = ?
            ORDER BY group_number, group_name ASC
        `, [id]);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching company groups'
        });
    }
}

async function createCompanyGroup(req, res, companyId) {
    const { group_name } = req.body;

    if (!group_name) {
        return res.status(400).json({
            success: false,
            message: 'Group name is required'
        });
    }

    try {
        const result = await query(`
            INSERT INTO companies_groups (company_id, group_name)
            VALUES (?, ?)
        `, [companyId, group_name]);

        return res.status(201).json({
            success: true,
            data: {
                group_id: result.insertId,
                company_id: companyId,
                group_name
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating company group'
        });
    }
} 