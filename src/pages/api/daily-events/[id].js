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
        const { event_name, day_number, start_time, end_time, description, attendance_required } = req.body;

        // Validate required fields
        if (!event_name || !day_number || !start_time || !end_time) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Validate day number
        if (day_number < 1 || day_number > 7) {
            return res.status(400).json({ success: false, message: 'Invalid day number' });
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
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Update event
        await query(`
            UPDATE daily_events 
            SET event_name = ?, 
                day_number = ?, 
                start_time = ?, 
                end_time = ?, 
                description = ?,
                attendance_required = ?
            WHERE event_id = ?
        `, [event_name, day_number, start_time, end_time, description || null, attendance_required || 'N', id]);

        return res.status(200).json({
            success: true,
            data: {
                event_id: id,
                event_name,
                day_number,
                start_time,
                end_time,
                description,
                attendance_required
            }
        });
    } catch (error) {
        console.error('Error updating event:', error);
        return res.status(500).json({ success: false, message: 'Failed to update event' });
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