import { query } from '@/lib/db';

export default async function handler(req, res) {
    switch (req.method) {
        case 'PUT':
            return updateEvent(req, res);
        case 'DELETE':
            return deleteEvent(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

async function updateEvent(req, res) {
    try {
        const { id } = req.query;
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

        // Check if event exists
        const existingEvent = await query(
            'SELECT event_id FROM daily_events WHERE event_id = ?',
            [id]
        );

        if (existingEvent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        await query(`
            UPDATE daily_events
            SET 
                event_name = ?, 
                day_number = ?, 
                start_time = ?, 
                end_time = ?, 
                description = ?
            WHERE event_id = ?
        `, [event_name, day_number, start_time, end_time, description || null, id]);

        return res.status(200).json({
            success: true,
            data: {
                event_id: parseInt(id),
                event_name,
                day_number,
                start_time,
                end_time,
                description
            }
        });
    } catch (error) {
        console.error('Error updating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating event'
        });
    }
}

async function deleteEvent(req, res) {
    try {
        const { id } = req.query;

        // Check if event exists
        const existingEvent = await query(
            'SELECT event_id FROM daily_events WHERE event_id = ?',
            [id]
        );

        if (existingEvent.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        await query('DELETE FROM daily_events WHERE event_id = ?', [id]);

        return res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting event'
        });
    }
} 