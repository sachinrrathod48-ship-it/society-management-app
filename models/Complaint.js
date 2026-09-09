const db = require('../config/db');

class Complaint {
    static async getAll() {
        const sql = `
            SELECT c.*, r.name as resident_name 
            FROM complaints c 
            JOIN residents r ON c.resident_id = r.id 
            ORDER BY c.created_at DESC
        `;
        return await db.query(sql);
    }

    static async getByResidentId(residentId) {
        const sql = `
            SELECT * FROM complaints 
            WHERE resident_id = ? 
            ORDER BY created_at DESC
        `;
        return await db.query(sql, [residentId]);
    }

    static async create(data) {
        const sql = `
            INSERT INTO complaints (resident_id, flat_number, title, category, description, priority, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Pending')
        `;
        const params = [
            data.resident_id,
            data.flat_number,
            data.title,
            data.category,
            data.description,
            data.priority || 'Medium'
        ];
        return await db.query(sql, params);
    }

    static async updateStatus(id, status, adminRemarks = '') {
        const sql = `
            UPDATE complaints 
            SET status = ?, admin_remarks = ? 
            WHERE id = ?
        `;
        return await db.query(sql, [status, adminRemarks, id]);
    }

    static async countPending() {
        const rows = await db.query('SELECT COUNT(*) as total FROM complaints WHERE status = "Pending" OR status = "In Progress"');
        return rows[0].total;
    }
}

module.exports = Complaint;
