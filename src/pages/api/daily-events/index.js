import { query } from '@/lib/db';

export default async function handler(req, res) {
    switch (req.method) {
        case 'GET':
            return getEvents(req, res);
        case 'POST':
            return createEvent(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

async function getEvents(req, res) {
    try {
        const result = await query(`
            SELECT *
            FROM daily_events
            ORDER BY day_number ASC, start_time ASC
        `);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching events'
        });
    }
}

async function createEvent(req, res) {
    try {
        const { day_number, event_name, start_time, end_time, description } = req.body;

        // Validate required fields
        if (!day_number || !event_name || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'Day number, event name, start time, and end time are required'
            });
        }

        // Validate day range
        if (day_number < 1 || day_number > 7) {
            return res.status(400).json({
                success: false,
                message: 'Day number must be between 1 and 7'
            });
        }

        // Validate time format and range
        if (end_time <= start_time) {
            return res.status(400).json({
                success: false,
                message: 'End time must be later than start time'
            });
        }

        const result = await query(`
            INSERT INTO daily_events (
                event_name, 
                day_number, 
                start_time, 
                end_time, 
                description
            )
            VALUES (?, ?, ?, ?, ?)
        `, [event_name, day_number, start_time, end_time, description || null]);

        return res.status(201).json({
            success: true,
            data: {
                event_id: result.insertId,
                event_name,
                day_number,
                start_time,
                end_time,
                description
            }
        });
    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating event'
        });
    }
} 