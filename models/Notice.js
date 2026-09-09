const db = require('../config/db');

class Notice {
    static async getAll() {
        return await db.query('SELECT * FROM notices ORDER BY date_posted DESC, created_at DESC');
    }

    static async getById(id) {
        const rows = await db.query('SELECT * FROM notices WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const today = new Date().toISOString().split('T')[0];
        const sql = `
            INSERT INTO notices (title, category, content, priority, posted_by, date_posted)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.title,
            data.category || 'General',
            data.content,
            data.priority || 'General',
            data.posted_by || 'Society Management',
            today
        ];
        return await db.query(sql, params);
    }

    static async update(id, data) {
        const sql = `
            UPDATE notices 
            SET title = ?, category = ?, content = ?, priority = ?, posted_by = ? 
            WHERE id = ?
        `;
        const params = [
            data.title,
            data.category || 'General',
            data.content,
            data.priority || 'General',
            data.posted_by || 'Society Management',
            id
        ];
        return await db.query(sql, params);
    }

    static async delete(id) {
        return await db.query('DELETE FROM notices WHERE id = ?', [id]);
    }
}

module.exports = Notice;
