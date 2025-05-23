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
    const { company_id, group_id } = req.query;

    if (!company_id) {
        return res.status(400).json({
            success: false,
            message: 'Company ID is required'
        });
    }

    try {
        let sql = `
            SELECT 
                r.fsy_id,
                CONCAT(r.first_name, ' ', r.last_name) as full_name,
                r.gender,
                r.status,
                r.participant_type,
                r.stake_name,
                r.unit_name,
                c.company_name,
                cg.group_name,
                COALESCE(a.attendance_status, 'Not Set') as attendance_status
            FROM company_members cm
            JOIN registrations r ON cm.fsy_id = r.fsy_id
            JOIN companies c ON cm.company_id = c.company_id
            JOIN companies_groups cg ON cm.group_id = cg.group_id
            LEFT JOIN attendances a ON r.fsy_id = a.fsy_id AND a.event_id = ?
            WHERE cm.company_id = ? AND (r.status = 'Approved' OR r.status = 'Awaiting Approval')
        `;

        const params = [req.query.event_id || 0, company_id];

        if (group_id) {
            sql += ` AND cm.group_id = ?`;
            params.push(group_id);
        }

        sql += ` ORDER BY 
            CASE 
                WHEN r.participant_type = 'Counselor' THEN 1
                WHEN r.participant_type = 'Participant' THEN 2
                ELSE 3
            END,
            r.first_name,
            r.last_name
        `;

        const results = await query(sql, params);

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
    const { fsy_id, company_id, group_id, transfer = false } = req.body;

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

        // Check if member is already in a company
        const [existingMember] = await query(
            'SELECT company_id FROM company_members WHERE fsy_id = ?',
            [fsy_id]
        );

        if (existingMember && !transfer) {
            return res.status(409).json({
                success: false,
                message: 'Member is already assigned to a company',
                existingCompanyId: existingMember.company_id
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

        // Get company and group names
        const [companyInfo] = await query(
            'SELECT company_name FROM companies WHERE company_id = ?',
            [company_id]
        );

        const [groupInfo] = await query(
            'SELECT group_name FROM companies_groups WHERE group_id = ?',
            [group_id]
        );

        // Start a transaction
        await query('START TRANSACTION');

        try {
            if (existingMember) {
                // Update existing member's company and group
                await query(
                    'UPDATE company_members SET company_id = ?, group_id = ? WHERE fsy_id = ?',
                    [company_id, group_id, fsy_id]
                );
            } else {
                // Add new member to company with group
                await query(
                    'INSERT INTO company_members (company_id, fsy_id, group_id) VALUES (?, ?, ?)',
                    [company_id, fsy_id, group_id]
                );
            }

            // Update registrations table with company and group names
            await query(
                'UPDATE registrations SET company_name = ?, group_name = ? WHERE fsy_id = ?',
                [companyInfo.company_name, groupInfo.group_name, fsy_id]
            );

            // Commit the transaction
            await query('COMMIT');

            return res.status(201).json({
                success: true,
                message: existingMember ? 'Member transferred successfully' : 'Member added successfully'
            });
        } catch (error) {
            // Rollback in case of error
            await query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error adding company member:', error);
        return res.status(500).json({
            success: false,
            message: 'Error adding member to company'
        });
    }
} 