document.getElementById('columnVisibilityButton').addEventListener('click', function() {
    var dropdown = document.getElementById('columnVisibilityDropdown');
    dropdown.classList.toggle('hidden');
});

document.addEventListener('DOMContentLoaded', function() {
    var statusButtons = document.querySelectorAll('.status-btn');
    var roleSelects = document.querySelectorAll('.role-select');
    var modal = document.getElementById('myModal');
    var modalText = document.getElementById('modalText');
    var confirmBtn = document.getElementById('confirmBtn');
    var currentButton, currentSelect, originalRole;

    loadUserRoles();
    loadUserStatus();

    statusButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            currentButton = button;
            var currentStatus = button.textContent.trim();
            var email = button.closest('tr').querySelector('td:nth-child(3)').textContent.trim();

            if (currentStatus === 'Active') {
                modalText.textContent = 'Are you sure you want to Ban this user?';
            } else if (currentStatus === 'Banned') {
                modalText.textContent = 'Are you sure you want to Activate this user?';
            }

            modal.style.display = 'block';

            confirmBtn.onclick = function() {
                var newStatus = currentStatus === 'Active' ? 'Banned' : 'Active';
                button.textContent = newStatus;
                button.dataset.status = newStatus;
                if (newStatus === 'Banned') {
                    button.classList.remove('bg-green-500');
                    button.classList.add('bg-red-500');
                } else {
                    button.classList.remove('bg-red-500');
                    button.classList.add('bg-green-500');
                }
                updateUserStatus(email, newStatus);
                modal.style.display = 'none';
            };
        });
    });

    roleSelects.forEach(function(select) {
        select.addEventListener('focus', function() {
            originalRole = select.getAttribute('data-original-role');
        });
        select.addEventListener('change', function() {
            currentSelect = select;
            var newRole = select.value;
            var email = select.closest('tr').querySelector('td:nth-child(3)').textContent.trim();

            if (newRole !== originalRole) {
                modalText.textContent = 'Do you want to change the role of this user?';
                modal.style.display = 'block';

                confirmBtn.onclick = function() {
                    updateUserRoleInLocalStorage(email, newRole);
                    select.setAttribute('data-original-role', newRole);
                    modal.style.display = 'none';
                };
            } else {
                updateUserRoleInLocalStorage(email, newRole);
            }
        });
    });

    window.onclick = function(event) {
        if (event.target == modal || event.target.classList.contains('close')) {
            modal.style.display = 'none';
        }
    };

    document.getElementById('copyBtn').addEventListener('click', function() {
        var table = document.getElementById('userTable');
        var range = document.createRange();
        range.selectNode(table);
        window.getSelection().removeAllRanges(); 
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
    });

    document.getElementById('excelBtn').addEventListener('click', function() {
        var table = document.getElementById('userTable');
        var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
        XLSX.writeFile(wb, 'user-list.xlsx');
    });

    document.getElementById('pdfBtn').addEventListener('click', function() {
        var table = document.getElementById('userTable');
        var rows = [];
        table.querySelectorAll('tr').forEach(function(row) {
            var rowData = [];
            row.querySelectorAll('th, td').forEach(function(cell) {
                rowData.push(cell.innerText);
            });
            rows.push(rowData);
        });

        var docDefinition = {
            content: [
                {
                    table: {
                        headerRows: 1,
                        body: rows
                    }
                }
            ]
        };

        pdfMake.createPdf(docDefinition).download('user-list.pdf');
    });

    // Column Sorting
    document.querySelectorAll('th[data-column]').forEach(function(header) {
        var sortState = 0; // 0: default, 1: ascending, 2: descending
        header.addEventListener('click', function() {
            var column = header.getAttribute('data-column');
            var table = header.closest('table');
            var rows = Array.from(table.querySelectorAll('tbody tr'));
            sortState = (sortState + 1) % 3;
            
            rows.sort(function(a, b) {
                var aText = a.querySelector('td:nth-child(' + (header.cellIndex + 1) + ')').innerText;
                var bText = b.querySelector('td:nth-child(' + (header.cellIndex + 1) + ')').innerText;
                
                if (column === 'Role') {
                    var roleOrder = { admin: 1, lead_guide: 2, guide: 3, user: 4 };
                    aText = roleOrder[aText.toLowerCase()];
                    bText = roleOrder[bText.toLowerCase()];
                } else if (column === 'Status') {
                    var statusOrder = { Active: 1, Banned: 2 };
                    aText = statusOrder[aText];
                    bText = statusOrder[bText];
                }

                if (sortState === 1) {
                    return aText > bText ? 1 : -1;
                } else if (sortState === 2) {
                    return aText < bText ? 1 : -1;
                } else {
                    return 0;
                }
            });

            if (sortState === 0) {
                rows.sort(function(a, b) {
                    return a.rowIndex - b.rowIndex;
                });
            }

            var tbody = table.querySelector('tbody');
            tbody.innerHTML = '';
            rows.forEach(function(row) {
                tbody.appendChild(row);
            });
        });
    });

    // Column Visibility
    document.querySelectorAll('#columnVisibilityDropdown a').forEach(function(item) {
        item.addEventListener('click', function() {
            var column = item.getAttribute('data-column');
            var header = document.querySelector('th[data-column="' + column + '"]');
            var index = header.cellIndex + 1;
            var cells = document.querySelectorAll('th:nth-child(' + index + '), td:nth-child(' + index + ')');
            
            cells.forEach(function(cell) {
                cell.style.display = cell.style.display === 'none' ? '' : 'none';
            });
        });
    });
});

function loadUserRoles() {
    var users = document.querySelectorAll('tbody tr');
    users.forEach(function(user) {
        var email = user.querySelector('td:nth-child(3)').textContent.trim();
        var role = localStorage.getItem(email + '_role');
        if (role) {
            user.querySelector('select').value = role;
            user.querySelector('select').setAttribute('data-original-role', role);
        }
    });
}

function updateUserRoleInLocalStorage(email, role) {
    localStorage.setItem(email + '_role', role);
}

function loadUserStatus() {
    var users = document.querySelectorAll('tbody tr');
    users.forEach(function(user) {
        var email = user.querySelector('td:nth-child(3)').textContent.trim();
        var status = localStorage.getItem(email + '_status');
        if (status) {
            var button = user.querySelector('.status-btn');
            button.textContent = status;
            button.dataset.status = status;
            if (status === 'Banned') {
                button.classList.remove('bg-green-500');
                button.classList.add('bg-red-500');
            } else {
                button.classList.remove('bg-red-500');
                button.classList.add('bg-green-500');
            }
        }
    });
}

function updateUserStatus(email, status) {
    localStorage.setItem(email + '_status', status);
}
