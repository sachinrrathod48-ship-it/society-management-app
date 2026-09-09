// Smart Society Management System - Client Utility JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. Client-Side Table Instant Search Filter
    const searchInputs = document.querySelectorAll('[data-table-search]');
    searchInputs.forEach(input => {
        const tableId = input.getAttribute('data-table-search');
        const targetTable = document.getElementById(tableId);

        if (targetTable) {
            input.addEventListener('keyup', () => {
                const filter = input.value.toLowerCase().trim();
                const rows = targetTable.querySelectorAll('tbody tr');

                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    if (text.includes(filter)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }
    });

    // 2. Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }

    // 3. Quick Role Selection on Login Page
    const roleBtns = document.querySelectorAll('.role-tab-btn');
    const roleInput = document.getElementById('roleInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    if (roleBtns.length > 0 && roleInput) {
        roleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                roleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const selectedRole = btn.getAttribute('data-role');
                roleInput.value = selectedRole;

                // Auto-fill demo credentials for easy project evaluation
                if (emailInput && passwordInput) {
                    if (selectedRole === 'admin') {
                        emailInput.value = 'admin@society.com';
                        passwordInput.value = 'admin123';
                    } else if (selectedRole === 'security') {
                        emailInput.value = 'security@society.com';
                        passwordInput.value = 'security123';
                    } else if (selectedRole === 'resident') {
                        emailInput.value = 'resident@society.com';
                        passwordInput.value = 'resident123';
                    }
                }
            });
        });
    }
});

// Helper function to populate edit modals dynamically
function populateModal(modalId, data) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    Object.keys(data).forEach(key => {
        const field = modal.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = data[key];
        }
    });
}
