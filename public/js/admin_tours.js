
    document.getElementById('columnVisibilityButton').addEventListener('click', function() {
        var dropdown = document.getElementById('columnVisibilityDropdown');
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('DOMContentLoaded', function() {
        var modal = document.getElementById('myModal');
        var modalText = document.getElementById('modalText');
        var confirmBtn = document.getElementById('confirmBtn');
        var currentButton, currentSelect, originalValue;

        function loadTourDifficulty() {
            var difficultySelects = document.querySelectorAll('.difficulty-select');
            difficultySelects.forEach(function(select) {
                var tourId = select.getAttribute('data-tour-id');
                var savedDifficulty = localStorage.getItem('tour_' + tourId + '_difficulty');
                if (savedDifficulty) {
                    select.value = savedDifficulty;
                }
            });
        }

        function saveTourDifficulty(tourId, difficulty) {
            localStorage.setItem('tour_' + tourId + '_difficulty', difficulty);
        }

        loadTourDifficulty();

        var difficultySelects = document.querySelectorAll('.difficulty-select');
        difficultySelects.forEach(function(select) {
            select.addEventListener('focus', function() {
                originalValue = select.value;
            });
            select.addEventListener('change', function() {
                currentSelect = select;
                var newValue = select.value;
                var tourId = select.getAttribute('data-tour-id');

                if (newValue !== originalValue) {
                    modalText.textContent = 'Do you want to change the difficulty of this tour?';
                    modal.style.display = 'block';

                    confirmBtn.onclick = function() {
                        saveTourDifficulty(tourId, newValue);
                        currentSelect.setAttribute('data-original-difficulty', newValue);
                        modal.style.display = 'none';
                    };
                }
            });
        });

        var deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                currentButton = button;
                modalText.textContent = 'Do you want to remove this tour?';
                modal.style.display = 'block';

                confirmBtn.onclick = function() {
                    var row = currentButton.closest('tr');
                    row.parentNode.removeChild(row);
                    modal.style.display = 'none';
                };
            });
        });

        var editButtons = document.querySelectorAll('.edit-btn');
        editButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                window.location.href = 'tour_form.html';
            });
        });

        window.onclick = function(event) {
            if (event.target == modal || event.target.classList.contains('close')) {
                modal.style.display = 'none';
            }
        };

        document.getElementById('copyBtn').addEventListener('click', function() {
            var table = document.getElementById('tourTable');
            var range = document.createRange();
            range.selectNode(table);
            window.getSelection().removeAllRanges(); 
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
        });

        document.getElementById('excelBtn').addEventListener('click', function() {
            var table = document.getElementById('tourTable');
            var wb = XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
            XLSX.writeFile(wb, 'tour-list.xlsx');
        });

        document.getElementById('pdfBtn').addEventListener('click', function() {
            var table = document.getElementById('tourTable');
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

            pdfMake.createPdf(docDefinition).download('tour-list.pdf');
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

                    if (column === 'Difficulty') {
                        var difficultyOrder = { easy: 1, medium: 2, hard: 3 };
                        aText = difficultyOrder[aText.toLowerCase()];
                        bText = difficultyOrder[bText.toLowerCase()];
                    } else if (column === 'Rating') {
                        aText = a.querySelector('.star-rating').querySelectorAll('i').length;
                        bText = b.querySelector('.star-rating').querySelectorAll('i').length;
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

                rows.forEach(function(row) {
                    table.querySelector('tbody').appendChild(row);
                });
            });
        });

        // Column Visibility
        document.querySelectorAll('#columnVisibilityDropdown a').forEach(function(link) {
            link.addEventListener('click', function() {
                var column = link.getAttribute('data-column');
                var table = document.getElementById('tourTable');
                var th = table.querySelector('th[data-column="' + column + '"]');
                var index = Array.from(th.parentNode.children).indexOf(th);
                var visible = th.style.display !== 'none';

                th.style.display = visible ? 'none' : '';
                table.querySelectorAll('tbody tr').forEach(function(row) {
                    row.querySelectorAll('td')[index].style.display = visible ? 'none' : '';
                });
            });
        });
    });
