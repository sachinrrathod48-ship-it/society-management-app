const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async authenticate(email, password, role) {
        let table = '';
        if (role === 'admin') table = 'admins';
        else if (role === 'security') table = 'security';
        else if (role === 'resident') table = 'residents';
        else throw new Error('Invalid user role selected');

        const sql = `SELECT * FROM ${table} WHERE email = ? LIMIT 1`;
        const users = await db.query(sql, [email]);

        if (!users || users.length === 0) {
            return null; // User not found
        }

        const user = users[0];

        // Check password using bcrypt or plain text fallback (for quick setup)
        let isMatch = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password);
        }
        
        // Fallback check if plain text matches demo credentials
        if (!isMatch && user.password === password) {
            isMatch = true;
        }

        if (isMatch) {
            // Remove password before storing in session
            delete user.password;
            user.role = role;
            return user;
        }

        return null;
    }

    static async updatePassword(id, role, oldPassword, newPassword) {
        let table = role === 'admin' ? 'admins' : role === 'security' ? 'security' : 'residents';
        const users = await db.query(`SELECT password FROM ${table} WHERE id = ?`, [id]);
        if (!users || users.length === 0) return false;

        const user = users[0];
        let isMatch = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(oldPassword, user.password);
        } else if (user.password === oldPassword) {
            isMatch = true;
        }

        if (!isMatch) return false;

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedPassword, id]);
        return true;
    }
}

module.exports = User;
