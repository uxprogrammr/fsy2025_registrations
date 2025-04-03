import { query } from '@/lib/db';

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getCompanies(req, res);
        case 'POST':
            return createCompany(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

async function getCompanies(req, res) {
    try {
        const result = await query(`
            SELECT 
                c.company_id,
                c.company_number,
                c.company_name,
                c.description,
                c.created_at,
                COUNT(DISTINCT cg.group_id) as group_count,
                COUNT(DISTINCT cm.fsy_id) as member_count
            FROM companies c
            LEFT JOIN companies_groups cg ON c.company_id = cg.company_id
            LEFT JOIN company_members cm ON c.company_id = cm.company_id
            GROUP BY c.company_id, c.company_number, c.company_name, c.description, c.created_at
            ORDER BY c.company_number, c.company_name ASC
        `);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching companies'
        });
    }
}

async function createCompany(req, res) {
    const { company_name, company_number, description, groups = [] } = req.body;

    // Validate required fields
    if (!company_name || company_name.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Company name is required'
        });
    }

    try {
        // First check if company exists
        const [existingCompany] = await query(
            'SELECT company_id FROM companies WHERE company_name = ?',
            [company_name.trim()]
        );

        if (existingCompany) {
            return res.status(409).json({
                success: false,
                message: 'A company with this name already exists'
            });
        }

        // Insert the company
        const companyResult = await query(
            'INSERT INTO companies (company_name, company_number, description) VALUES (?, ?, ?)',
            [company_name.trim(), company_number, description ? description.trim() : null]
        );

        const companyId = companyResult.insertId;

        // Insert groups if any
        if (Array.isArray(groups) && groups.length > 0) {
            for (const group of groups) {
                if (group && group.name && group.name.trim()) {
                    await query(
                        'INSERT INTO companies_groups (company_id, group_number, group_name) VALUES (?, ?, ?)',
                        [companyId, group.number, group.name.trim()]
                    );
                }
            }
        }

        // Fetch the newly created company with its groups
        const [newCompany] = await query(`
            SELECT 
                c.company_id,
                c.company_number,
                c.company_name,
                c.description,
                c.created_at
            FROM companies c
            WHERE c.company_id = ?
        `, [companyId]);

        // Fetch groups separately
        const groups_result = await query(`
            SELECT 
                group_id,
                group_number,
                group_name,
                created_at
            FROM companies_groups
            WHERE company_id = ?
            ORDER BY group_number, group_name
        `, [companyId]);

        // Combine the results
        const response = {
            ...newCompany,
            groups: groups_result
        };

        return res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: response
        });

    } catch (error) {
        console.error('Error creating company:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'A company with this name already exists'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating company'
        });
    }
} 