import { query } from '@/lib/db';

export default async function handler(req, res) {
    try {
        const result = await query('SELECT stake_name FROM stakes');
        res.status(200).json({ data: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch stakes" });
    }
}
