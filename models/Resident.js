const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Resident {
    static async getAll() {
        return await db.query('SELECT * FROM residents ORDER BY flat_number ASC');
    }

    static async getById(id) {
        const rows = await db.query('SELECT * FROM residents WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const hashedPassword = await bcrypt.hash(data.password || 'resident123', 10);
        const sql = `
            INSERT INTO residents (name, email, password, phone, flat_number, wing, occupation, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.name,
            data.email,
            hashedPassword,
            data.phone,
            data.flat_number,
            data.wing,
            data.occupation || 'Resident',
            data.status || 'Active'
        ];
        return await db.query(sql, params);
    }

    static async update(id, data) {
        let sql = `
            UPDATE residents 
            SET name = ?, email = ?, phone = ?, flat_number = ?, wing = ?, occupation = ?, status = ?
        `;
        let params = [
            data.name,
            data.email,
            data.phone,
            data.flat_number,
            data.wing,
            data.occupation || 'Resident',
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
        return await db.query('DELETE FROM residents WHERE id = ?', [id]);
    }

    static async count() {
        const rows = await db.query('SELECT COUNT(*) as total FROM residents');
        return rows[0].total;
    }
}

module.exports = Resident;
