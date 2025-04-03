import { query } from '@/lib/db';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const result = await query(`
            SELECT 
                r.fsy_id,
                r.first_name,
                r.last_name,
                r.stake_name,
                r.participant_type,
                r.phone_number,
                r.email,
                cg.group_name,
                c.company_name,
                cm.joined_at
            FROM company_members cm
            JOIN registrations r ON cm.fsy_id = r.fsy_id
            JOIN companies_groups cg ON cm.group_id = cg.group_id
            JOIN companies c ON cm.company_id = c.company_id
            ORDER BY c.company_name, cg.group_name, r.first_name, r.last_name
        `);

        // Convert to CSV
        const headers = [
            'FSY ID',
            'First Name',
            'Last Name',
            'Stake Name',
            'Participant Type',
            'Phone Number',
            'Email',
            'Group Name',
            'Company Name',
            'Joined Date'
        ];

        const csvRows = [
            headers.join(','),
            ...result.map(row => [
                row.fsy_id,
                `"${row.first_name}"`,
                `"${row.last_name}"`,
                `"${row.stake_name}"`,
                `"${row.participant_type}"`,
                `"${row.phone_number}"`,
                `"${row.email}"`,
                `"${row.group_name}"`,
                `"${row.company_name}"`,
                `"${new Date(row.joined_at).toLocaleDateString()}"`
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=company-members-${new Date().toISOString().split('T')[0]}.csv`);

        return res.status(200).send(csvContent);
    } catch (error) {
        console.error('Error exporting company members:', error);
        return res.status(500).json({
            success: false,
            message: 'Error exporting company members'
        });
    }
} 