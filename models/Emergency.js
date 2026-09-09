const db = require('../config/db');

class Emergency {
    static async getAll() {
        return await db.query('SELECT * FROM emergency_contacts ORDER BY category ASC, name ASC');
    }

    static async getById(id) {
        const rows = await db.query('SELECT * FROM emergency_contacts WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const sql = `
            INSERT INTO emergency_contacts (name, designation, phone, category)
            VALUES (?, ?, ?, ?)
        `;
        const params = [
            data.name,
            data.designation,
            data.phone,
            data.category || 'Essential'
        ];
        return await db.query(sql, params);
    }

    static async update(id, data) {
        const sql = `
            UPDATE emergency_contacts 
            SET name = ?, designation = ?, phone = ?, category = ? 
            WHERE id = ?
        `;
        const params = [
            data.name,
            data.designation,
            data.phone,
            data.category || 'Essential',
            id
        ];
        return await db.query(sql, params);
    }

    static async delete(id) {
        return await db.query('DELETE FROM emergency_contacts WHERE id = ?', [id]);
    }
}

module.exports = Emergency;
