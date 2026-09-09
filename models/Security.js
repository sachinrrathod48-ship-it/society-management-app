const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Security {
    static async getAll() {
        return await db.query('SELECT * FROM security ORDER BY created_at DESC');
    }

    static async getById(id) {
        const rows = await db.query('SELECT * FROM security WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const hashedPassword = await bcrypt.hash(data.password || 'security123', 10);
        const sql = `
            INSERT INTO security (name, email, password, phone, badge_number, shift, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.name,
            data.email,
            hashedPassword,
            data.phone,
            data.badge_number,
            data.shift || 'Morning',
            data.status || 'Active'
        ];
        return await db.query(sql, params);
    }

    static async update(id, data) {
        let sql = `
            UPDATE security 
            SET name = ?, email = ?, phone = ?, badge_number = ?, shift = ?, status = ?
        `;
        let params = [
            data.name,
            data.email,
            data.phone,
            data.badge_number,
            data.shift || 'Morning',
            data.status || 'Active'
        ];

        if (data.password && data.password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            sql += `, password = ?`;
            params.push(hashedPassword);
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        return await db.query(sql, params);
    }

    static async delete(id) {
        return await db.query('DELETE FROM security WHERE id = ?', [id]);
    }

    static async count() {
        const rows = await db.query('SELECT COUNT(*) as total FROM security WHERE status = "Active" OR status = "On Duty"');
        return rows[0].total;
    }
}

module.exports = Security;
