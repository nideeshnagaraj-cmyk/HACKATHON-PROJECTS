document.addEventListener('DOMContentLoaded', () => {
    // State
    let state = {
        income: parseFloat(localStorage.getItem('budget_income')) || 0,
        expenses: JSON.parse(localStorage.getItem('budget_expenses')) || []
    };

    // DOM Elements
    const incomeInput = document.getElementById('income-input');
    const updateIncomeBtn = document.getElementById('update-income-btn');

    const expenseForm = document.getElementById('expense-form');
    const expenseDate = document.getElementById('expense-date');
    const expenseAmount = document.getElementById('expense-amount');
    const expenseCategory = document.getElementById('expense-category');
    const expenseNotes = document.getElementById('expense-notes');

    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const remainingBalanceEl = document.getElementById('remaining-balance');
    const expenseListEl = document.getElementById('expense-list');
    const alertMessageEl = document.getElementById('alert-message');

    // Initialize defaults
    expenseDate.valueAsDate = new Date();

    // Helper Functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const saveState = () => {
        localStorage.setItem('budget_income', state.income);
        localStorage.setItem('budget_expenses', JSON.stringify(state.expenses));
    };

    const calculateTotals = () => {
        const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = state.income - totalExpenses;

        return { totalExpenses, remaining };
    };

    const createDeleteHandler = (id) => {
        return () => {
            state.expenses = state.expenses.filter(exp => exp.id !== id);
            saveState();
            updateUI();
        };
    };

    const renderExpenses = () => {
        expenseListEl.innerHTML = '';

        // Sort expenses by date descending
        const sortedExpenses = [...state.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedExpenses.forEach(exp => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${formatDate(exp.date)}</td>
                <td><span class="category-badge">${exp.category}</span></td>
                <td><span style="color: var(--text-muted);">${exp.notes || '-'}</span></td>
                <td style="font-weight: 600;">${formatCurrency(exp.amount)}</td>
                <td><button class="btn-delete" data-id="${exp.id}">Delete</button></td>
            `;

            expenseListEl.appendChild(tr);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                createDeleteHandler(id)();
            });
        });
    };

    const checkAlert = (totalExpenses) => {
        if (state.income > 0 && totalExpenses > (0.8 * state.income)) {
            alertMessageEl.classList.remove('hidden');
        } else {
            alertMessageEl.classList.add('hidden');
        }
    };

    const updateUI = () => {
        const { totalExpenses, remaining } = calculateTotals();

        totalIncomeEl.textContent = formatCurrency(state.income);
        totalExpensesEl.textContent = formatCurrency(totalExpenses);
        remainingBalanceEl.textContent = formatCurrency(remaining);

        // Styling based on remaining balance
        if (remaining < 0) {
            remainingBalanceEl.className = 'amount negative';
        } else {
            remainingBalanceEl.className = 'amount';
        }

        renderExpenses();
        checkAlert(totalExpenses);
    };

    // Event Listeners
    updateIncomeBtn.addEventListener('click', () => {
        const newIncome = parseFloat(incomeInput.value);
        if (!isNaN(newIncome) && newIncome >= 0) {
            state.income = newIncome;
            saveState();
            updateUI();
            incomeInput.value = '';

            // Provide subtle visual feedback
            updateIncomeBtn.textContent = 'Saved!';
            setTimeout(() => { updateIncomeBtn.textContent = 'Set'; }, 2000);
        } else {
            alert("Please enter a valid positive income amount.");
        }
    });

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newExpense = {
            id: crypto.randomUUID(),
            date: expenseDate.value,
            amount: parseFloat(expenseAmount.value),
            category: expenseCategory.value,
            notes: expenseNotes.value.trim()
        };

        if (newExpense.amount > 0 && newExpense.category && newExpense.date) {
            state.expenses.push(newExpense);
            saveState();
            updateUI();

            // Reset form partly
            expenseAmount.value = '';
            expenseNotes.value = '';
            expenseCategory.value = '';
            // keep date as is (defaulting to today was on load, but nice to keep same day if entering multiples)
        }
    });

    // Initial render
    updateUI();
    if (state.income > 0) {
        incomeInput.value = state.income; // Optional: fill input with current income or leave blank
    }
});
