
    document.getElementById('columnVisibilityButton').addEventListener('click', function() {
        var dropdown = document.getElementById('columnVisibilityDropdown');
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('DOMContentLoaded', function() {
        var modal = document.getElementById('myModal');
        var modalText = document.getElementById('modalText');
        var confirmBtn = document.getElementById('confirmBtn');
        var currentButton;
        var currentColumn = null;
        var sortOrder = {};

        var deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                currentButton = button;
                modalText.textContent = 'Do you want to remove this review?';
                modal.style.display = 'block';

                confirmBtn.onclick = function() {
                    var row = currentButton.closest('tr');
                    row.parentNode.removeChild(row);
                    modal.style.display = 'none';
                };
            });
        });

        var columnHeaders = document.querySelectorAll('th[data-column]');
        columnHeaders.forEach(function(header) {
            header.addEventListener('click', function() {
                var column = header.getAttribute('data-column');
                if (!sortOrder[column]) {
                    sortOrder[column] = 'asc';
                } else if (sortOrder[column] === 'asc') {
                    sortOrder[column] = 'desc';
                } else {
                    sortOrder[column] = 'none';
                }
                sortTable(column, sortOrder[column]);
            });
        });

        var columnVisibilityLinks = document.querySelectorAll('#columnVisibilityDropdown a');
        columnVisibilityLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                var column = link.getAttribute('data-column');
                toggleColumnVisibility(column);
            });
        });

        window.onclick = function(event) {
            if (event.target == modal || event.target.classList.contains('close')) {
                modal.style.display = 'none';
            }
        };

        document.getElementById('copyBtn').addEventListener('click', function() {
            var table = document.getElementById('reviewTable');
            var range = document.createRange();
            range.selectNode(table);
            window.getSelection().removeAllRanges(); 
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
        });

        document.getElementById('excelBtn').addEventListener('click', function() {
            var table = document.getElementById('reviewTable');
            var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
            XLSX.writeFile(wb, 'review-list.xlsx');
        });

        document.getElementById('pdfBtn').addEventListener('click', function() {
            var table = document.getElementById('reviewTable');
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

            pdfMake.createPdf(docDefinition).download('review-list.pdf');
        });

        function sortTable(column, order) {
            var table = document.getElementById('reviewTable');
            var rows = Array.from(table.rows).slice(1);
            var index = Array.from(table.rows[0].cells).findIndex(cell => cell.getAttribute('data-column') === column);
            rows.sort((a, b) => {
                var aText = a.cells[index].innerText;
                var bText = b.cells[index].innerText;
                if (column === 'Rating') {
                    aText = a.querySelectorAll('.star-rating .fas').length;
                    bText = b.querySelectorAll('.star-rating .fas').length;
                }
                if (order === 'asc') {
                    return aText > bText ? 1 : -1;
                } else if (order === 'desc') {
                    return aText < bText ? 1 : -1;
                }
                return 0;
            });
            if (order === 'none') {
                rows = rows.reverse();
            }
            rows.forEach(row => table.tBodies[0].appendChild(row));
        }

        function toggleColumnVisibility(column) {
            var table = document.getElementById('reviewTable');
            var index = Array.from(table.rows[0].cells).findIndex(cell => cell.getAttribute('data-column') === column);
            var isVisible = !table.rows[0].cells[index].classList.contains('hidden');
            for (var i = 0; i < table.rows.length; i++) {
                if (isVisible) {
                    table.rows[i].cells[index].classList.add('hidden');
                } else {
                    table.rows[i].cells[index].classList.remove('hidden');
                }
            }
        }
    });
