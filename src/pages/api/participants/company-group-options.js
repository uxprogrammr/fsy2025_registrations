import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        // Get all companies sorted by company_number
        const companiesResult = await query(`
            SELECT company_name, company_id
            FROM companies
            WHERE company_name IS NOT NULL AND company_name != ''
            ORDER BY company_number
        `);
        const companies = companiesResult.map(row => row.company_name);

        // Get groups for the selected company, if provided
        let groups = [];
        const { company_name } = req.query;
        if (company_name) {
            // Get company_id for the selected company_name
            const companyIdResult = await query('SELECT company_id FROM companies WHERE company_name = ?', [company_name]);
            if (companyIdResult.length > 0) {
                const company_id = companyIdResult[0].company_id;
                const groupsResult = await query(`
                    SELECT group_name
                    FROM companies_groups
                    WHERE company_id = ?
                    ORDER BY group_number
                `, [company_id]);
                groups = groupsResult.map(row => row.group_name);
            }
        }
        res.status(200).json({ success: true, companies, groups });
    } catch (error) {
        console.error('Error fetching company/group options:', error);
        res.status(500).json({ success: false, message: 'Error fetching company/group options' });
    }
} 