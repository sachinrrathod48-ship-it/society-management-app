const db = require('../config/db');

class Maintenance {
    static async getAll() {
        const sql = `
            SELECT m.*, r.name as resident_name 
            FROM maintenance m 
            JOIN residents r ON m.resident_id = r.id 
            ORDER BY m.due_date DESC, m.created_at DESC
        `;
        return await db.query(sql);
    }

    static async getByResidentId(residentId) {
        const sql = `
            SELECT * FROM maintenance 
            WHERE resident_id = ? 
            ORDER BY due_date DESC
        `;
        return await db.query(sql, [residentId]);
    }

    static async create(data) {
        const sql = `
            INSERT INTO maintenance (resident_id, flat_number, month_year, amount, due_date, status)
            VALUES (?, ?, ?, ?, ?, 'Unpaid')
        `;
        const params = [
            data.resident_id,
            data.flat_number,
            data.month_year,
            data.amount,
            data.due_date
        ];
        return await db.query(sql, params);
    }

    static async createBulkForMonth(monthYear, amount, dueDate) {
        const residents = await db.query('SELECT id, flat_number FROM residents WHERE status = "Active"');
        let count = 0;
        for (const r of residents) {
            const sql = `
                INSERT INTO maintenance (resident_id, flat_number, month_year, amount, due_date, status)
                VALUES (?, ?, ?, ?, ?, 'Unpaid')
            `;
            await db.query(sql, [r.id, r.flat_number, monthYear, amount, dueDate]);
            count++;
        }
        return count;
    }

    static async markAsPaid(id, paymentMethod = 'Online / UPI') {
        const today = new Date().toISOString().split('T')[0];
        const sql = `
            UPDATE maintenance 
            SET status = 'Paid', payment_date = ?, payment_method = ? 
            WHERE id = ?
        `;
        return await db.query(sql, [today, paymentMethod, id]);
    }

    static async countPendingAmount() {
        const rows = await db.query('SELECT SUM(amount) as total FROM maintenance WHERE status = "Unpaid"');
        return rows[0].total || 0;
    }
}

module.exports = Maintenance;
