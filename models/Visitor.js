const db = require('../config/db');

class Visitor {
    static async getAll() {
        return await db.query('SELECT * FROM visitors ORDER BY date DESC, entry_time DESC');
    }

    static async getTodayVisitors() {
        return await db.query('SELECT * FROM visitors WHERE date = CURDATE() ORDER BY entry_time DESC');
    }

    static async getCurrentlyInside() {
        return await db.query('SELECT * FROM visitors WHERE status = "Inside" ORDER BY entry_time DESC');
    }

    static async create(data, securityId = null) {
        const sql = `
            INSERT INTO visitors 
            (visitor_name, mobile_number, flat_number, resident_name, purpose, date, entry_time, status, recorded_by_security_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Inside', ?)
        `;
        const dateStr = data.date || new Date().toISOString().split('T')[0];
        const timeStr = data.entry_time || new Date().toTimeString().split(' ')[0];

        const params = [
            data.visitor_name,
            data.mobile_number,
            data.flat_number,
            data.resident_name,
            data.purpose,
            dateStr,
            timeStr,
            securityId
        ];
        return await db.query(sql, params);
    }

    static async markExit(id, exitTime = null) {
        const timeStr = exitTime || new Date().toTimeString().split(' ')[0];
        const sql = `
            UPDATE visitors 
            SET exit_time = ?, status = 'Left' 
            WHERE id = ?
        `;
        return await db.query(sql, [timeStr, id]);
    }

    static async countToday() {
        const rows = await db.query('SELECT COUNT(*) as total FROM visitors WHERE date = CURDATE()');
        return rows[0].total;
    }

    static async countInsideNow() {
        const rows = await db.query('SELECT COUNT(*) as total FROM visitors WHERE status = "Inside"');
        return rows[0].total;
    }
}

module.exports = Visitor;
