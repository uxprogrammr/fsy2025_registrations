import { query } from '@/lib/db';

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getCompanyMembers(req, res);
        case 'POST':
            return addCompanyMember(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

async function getCompanyMembers(req, res) {
    const { company_id, group_id, search_term } = req.query;

    try {
        let params = [];
        
        // Build the UNION query to ensure search results come first
        let sql = `
            (
                -- Search Results (will be first due to sort_priority = 1)
                SELECT 
                    r.fsy_id,
                    CONCAT(r.first_name, ' ', r.last_name) as full_name,
                    r.gender,
                    TIMESTAMPDIFF(YEAR, r.birth_date, CURDATE()) as age,
                    r.status,
                    r.participant_type,
                    r.stake_name,
                    r.unit_name,
                    NULL as company_name,
                    NULL as group_name,
                    1 as sort_priority,
                    0 as is_company_member,
                    NULL as company_number,  -- Added to match second SELECT
                    NULL as group_number     -- Added to match second SELECT
                FROM registrations r
                LEFT JOIN company_members cm ON r.fsy_id = cm.fsy_id
                WHERE 
                    r.status = 'Approved'
                    AND cm.fsy_id IS NULL
                    AND ? IS NOT NULL  -- Only include this part if search_term exists
                    AND (
                        r.fsy_id LIKE ? OR
                        CONCAT(r.first_name, ' ', r.last_name) LIKE ? OR
                        r.stake_name LIKE ?
                    )
            )
            UNION ALL
            (
                -- Company Members (will be second due to sort_priority = 2)
                SELECT 
                    r.fsy_id,
                    CONCAT(r.first_name, ' ', r.last_name) as full_name,
                    r.gender,
                    TIMESTAMPDIFF(YEAR, r.birth_date, CURDATE()) as age,
                    r.status,
                    r.participant_type,
                    r.stake_name,
                    r.unit_name,
                    c.company_name,
                    cg.group_name,
                    2 as sort_priority,
                    1 as is_company_member,
                    c.company_number,
                    cg.group_number
                FROM company_members cm
                JOIN registrations r ON cm.fsy_id = r.fsy_id
                JOIN companies c ON cm.company_id = c.company_id
                JOIN companies_groups cg ON cm.group_id = cg.group_id
                WHERE 1=1
        `;

        // Add search parameters
        if (search_term) {
            const searchTerm = `%${search_term}%`;
            params = [search_term, searchTerm, searchTerm, searchTerm];
        } else {
            params = [null, '', '', '']; // Ensure search part returns no results when no search_term
        }

        // Add company/group filters
        if (company_id) {
            sql += ` AND cm.company_id = ?`;
            params.push(company_id);
        }

        if (group_id) {
            sql += ` AND cm.group_id = ?`;
            params.push(group_id);
        }

        sql += `)
            ORDER BY 
                sort_priority,
                CASE 
                    WHEN participant_type = 'Counselor' THEN 1
                    WHEN participant_type = 'Participant' THEN 2
                    ELSE 3
                END,
                company_number,
                group_number,
                full_name
        `;

        console.log('Executing query:', sql);
        console.log('With parameters:', params);

        const results = await query(sql, params);

        console.log(`Found ${results.filter(r => !r.is_company_member).length} search results and ${results.filter(r => r.is_company_member).length} company members`);

        return res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching company members:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching company members'
        });
    }
}

async function addCompanyMember(req, res) {
    const { fsy_id, company_id, group_id } = req.body;

    // Validate required fields
    if (!fsy_id || !company_id || !group_id) {
        return res.status(400).json({
            success: false,
            message: 'FSY ID, Company ID, and Group ID are required'
        });
    }

    try {
        // Check if member exists and is approved
        const [member] = await query(
            'SELECT status FROM registrations WHERE fsy_id = ?',
            [fsy_id]
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        if (member.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Only approved members can be added to a company'
            });
        }

        // Check if member is already in a company
        const [existingMember] = await query(
            'SELECT company_id FROM company_members WHERE fsy_id = ?',
            [fsy_id]
        );

        if (existingMember) {
            return res.status(409).json({
                success: false,
                message: 'Member is already assigned to a company'
            });
        }

        // Verify that the group belongs to the company
        const [groupCheck] = await query(
            'SELECT group_id FROM companies_groups WHERE company_id = ? AND group_id = ?',
            [company_id, group_id]
        );

        if (!groupCheck) {
            return res.status(400).json({
                success: false,
                message: 'Invalid group for the selected company'
            });
        }

        // Add member to company with group
        await query(
            'INSERT INTO company_members (company_id, fsy_id, group_id) VALUES (?, ?, ?)',
            [company_id, fsy_id, group_id]
        );

        return res.status(201).json({
            success: true,
            message: 'Member added successfully'
        });
    } catch (error) {
        console.error('Error adding company member:', error);
        return res.status(500).json({
            success: false,
            message: 'Error adding member to company'
        });
    }
} 