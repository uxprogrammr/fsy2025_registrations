import { query } from '@/lib/db';

export default async function handler(req, res) {
    const { stake_name } = req.query;

    try {
        const result = await query('SELECT unit_name FROM units WHERE stake_name = ?', [stake_name]);
        res.status(200).json({ data: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch units" });
    }
}
