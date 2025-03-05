
console.log("dashboardScript.js loaded successfully");
document.addEventListener('DOMContentLoaded', function () {
    // Retrieve user data from local storage
    const userData = getUserData();
    const users = getUsers();
    const user = users[0]; 

    // Update UI with user data
    if (document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = user.name;
    }
    

    if (document.getElementById('last-login')) {
        document.getElementById('last-login').textContent = `Last login: ${new Date().toLocaleString()}`;
    }
   
    
    // Ensure balances exist
    if (!userData.balances) {
        userData.balances = { USD: 10000.00 }; // Default balance if none exists
        updateUserData(userData);
    }
    

    // Update balance display
    updateBalanceDisplay();
    

    // Populate transactions table
    const transactionsTable = document.getElementById('transactions-table');
    if (transactionsTable && userData.transferHistory) {
        populateTransactionsTable(transactionsTable, userData.transferHistory);
    }



    // Populate holdings table
    const holdingsTable = document.getElementById('holdings-table');
    if (holdingsTable && userData.holdings) {
        userData.holdings.forEach(holding => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${holding.symbol}</td>
                <td>${holding.name}</td>
                <td>${holding.shares}</td>
                <td>$${holding.price.toFixed(2)}</td>
                <td>$${holding.marketValue.toFixed(2)}</td>
                <td style="color: ${holding.return >= 0 ? 'green' : 'red'}">${holding.return}%</td>
            `;
            holdingsTable.appendChild(row);
        });
    }


    // Populate watchlist table
    const watchlistTable = document.getElementById('watchlist-table');
    if (watchlistTable && userData.watchlist) {
        userData.watchlist.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.symbol}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td style="color: ${item.change >= 0 ? 'green' : 'red'}">${item.change}%</td>
            `;
            watchlistTable.appendChild(row);
        });
    }


    // Initialize saving goals if they don't exist
    if (!userData.savingGoals) {
        userData.savingGoals = [
            { id: 1, goal: "Vacation", savedAmount: 1500, targetAmount: 3000 },
            { id: 2, goal: "New Car", savedAmount: 5000, targetAmount: 20000 }
        ];
        updateUserData(userData);
    } else {
        // Ensure each goal has an ID
        userData.savingGoals.forEach((goal, index) => {
            if (!goal.id) {
                goal.id = index + 1;
            }
        });

        updateUserData(userData);
    }
    
    // Initialize transfer history if it doesn't exist
    if (!userData.transferHistory) {
        userData.transferHistory = [];
        updateUserData(userData);
    }
    


    // Enhanced Saving Goals Display
    // Check if the new saving-goals-list container exists
    const savingGoalsList = document.getElementById('saving-goals-list');
    const savingGoalsTable = document.getElementById('saving-goals-table');
    
    if (savingGoalsList) {
        // New UI - render the dynamic savings goals list
        renderSavingsGoals(userData.savingGoals);
        
        // Add "Add Goal" button if it doesn't exist
        if (!document.getElementById('add-goal-btn')) {
            const addGoalBtn = document.createElement('button');
            addGoalBtn.id = 'add-goal-btn';
            addGoalBtn.className = 'btn btn-primary mt-3';
            addGoalBtn.textContent = 'Add New Goal';
            addGoalBtn.addEventListener('click', showAddGoalForm);
            savingGoalsList.parentElement.appendChild(addGoalBtn);
        }
    } else if (savingGoalsTable) {
        // Original UI - create the table as before but with edit/delete buttons
        renderSavingsGoalsTable(userData.savingGoals, savingGoalsTable);
    }

    // Mobile navigation functionality
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('overlay');

    if (mobileNavToggle && sidebar && overlay) {
        function toggleNav() {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            const icon = mobileNavToggle.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }

        mobileNavToggle.addEventListener('click', toggleNav);
        overlay.addEventListener('click', toggleNav);

        // Close menu when clicking a nav link on mobile
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    toggleNav();
                }
            });
        });

        // Close menu when window is resized
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                toggleNav();
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            alert('Logging out...');
            window.location.href = 'index.html';
        });
    }
});

// Update balance display function
function updateBalanceDisplay() {
    const userData = getUserData();
    if (document.getElementById('account-balance')) {
        // Ensure USD balance exists
        if (userData.balances && userData.balances.USD !== undefined) {
            document.getElementById('account-balance').textContent = `$${userData.balances.USD.toFixed(2)}`;
        } else {
            document.getElementById('account-balance').textContent = '$0.00';
        }
    }
}

// Populate transactions table
function populateTransactionsTable(table, transactions) {
    // Clear existing transactions
    const tbody = table.querySelector('tbody') || table;
    tbody.innerHTML = '';
    
    // Add transactions in reverse chronological order (newest first)
    transactions.slice().reverse().forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.beneficiary}</td>
            <td style="color: ${transaction.amount.includes('-') ? 'red' : 'green'}">${transaction.amount}</td>
            <td>${transaction.status}</td>
        `;
        tbody.appendChild(row);
    });
}

// Function to render savings goals with interactive elements
function renderSavingsGoals(goals) {
    const savingsContainer = document.getElementById('saving-goals-list');
    if (!savingsContainer) return; // Exit if container doesn't exist
    
    savingsContainer.innerHTML = '';
    
    if (!Array.isArray(goals)) {
        console.error("Savings goals data is not an array:", goals);
        return;
    }
    
    goals.forEach(goal => {
        const saved = goal.savedAmount || 0;
        const target = goal.targetAmount || 1; // Prevent division by zero
        const goalName = goal.goal || "Unnamed Goal";
        const goalId = goal.id;
        
        const percentage = Math.round((saved / target) * 100);
        
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.dataset.goalId = goalId;
        goalElement.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goalName}</div>
                <div class="goal-percentage">${percentage}%</div>
            </div>
            <div class="goal-amount">
                <span class="saved-amount">$${saved.toFixed(2)}</span> / 
                <span class="target-amount">$${target.toFixed(2)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: ${percentage}%;"></div>
            </div>
            <div class="goal-actions mt-2">
                <button class="btn-transfer btn-sm" data-goal-id="${goalId}">Transfer</button>
                <button class="btn-edit btn-sm" data-goal-id="${goalId}">Edit</button>
                <button class="btn-delete btn-sm" data-goal-id="${goalId}">Delete</button>
            </div>
        `;
        savingsContainer.appendChild(goalElement);
        
        // Add event listeners for the buttons
        const transferBtn = goalElement.querySelector('.btn-transfer');
        const editBtn = goalElement.querySelector('.btn-edit');
        const deleteBtn = goalElement.querySelector('.btn-delete');
        
        transferBtn.addEventListener('click', () => showTransferForm(goalId));
        editBtn.addEventListener('click', () => showEditGoalForm(goalId));
        deleteBtn.addEventListener('click', () => deleteGoal(goalId));
    });
}

// Function to render the table version of savings goals with interactive elements
function renderSavingsGoalsTable(goals, tableElement) {
    if (!tableElement) return;
    
    // Clear existing content
    tableElement.querySelector('tbody').innerHTML = '';
    
    goals.forEach(goal => {
        const saved = goal.savedAmount || 0;
        const target = goal.targetAmount || 1;
        const progress = ((saved / target) * 100).toFixed(1);
        const goalId = goal.id;
        
        const row = document.createElement('tr');
        row.dataset.goalId = goalId;
        row.innerHTML = `
            <td>${goal.goal}</td>
            <td class="saved-amount">$${saved.toFixed(2)}</td>
            <td class="target-amount">$${target.toFixed(2)}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%;">${progress}%</div>
                </div>
            </td>
            <td>
                <button class="btn-transfer btn-sm" data-goal-id="${goalId}">Transfer</button>
                <button class="btn-edit btn-sm" data-goal-id="${goalId}">Edit</button>
                <button class="btn-delete btn-sm" data-goal-id="${goalId}">Delete</button>
            </td>
        `;
        tableElement.querySelector('tbody').appendChild(row);
        
        // Add event listeners
        const transferBtn = row.querySelector('.btn-transfer');
        const editBtn = row.querySelector('.btn-edit');
        const deleteBtn = row.querySelector('.btn-delete');
        
        transferBtn.addEventListener('click', () => showTransferForm(goalId));
        editBtn.addEventListener('click', () => showEditGoalForm(goalId));
        deleteBtn.addEventListener('click', () => deleteGoal(goalId));
    });
    
    // Add "Add Goal" button if it doesn't exist
    if (!document.getElementById('add-goal-btn')) {
        const addGoalBtn = document.createElement('button');
        addGoalBtn.id = 'add-goal-btn';
        addGoalBtn.className = 'btn btn-primary mt-3';
        addGoalBtn.textContent = 'Add New Goal';
        addGoalBtn.addEventListener('click', showAddGoalForm);
        tableElement.parentElement.appendChild(addGoalBtn);
    }
}

// Function to show modal for transferring funds from balance
function showTransferForm(goalId) {
    const userData = getUserData();
    const goal = userData.savingGoals.find(g => g.id === goalId);
    
    if (!goal) return;
    
    const currentBalance = userData.balances?.USD || 0;
    
    // Create or get modal container
    let modalContainer = document.getElementById('goal-modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'goal-modal-container';
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Transfer to "${goal.goal}"</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>Current account balance: <strong>$${currentBalance.toFixed(2)}</strong></p>
                <p>Current savings: <strong>$${goal.savedAmount.toFixed(2)}</strong> / $${goal.targetAmount.toFixed(2)}</p>
                <p>Remaining to goal: <strong>$${(goal.targetAmount - goal.savedAmount).toFixed(2)}</strong></p>
                <form id="transfer-form">
                    <div class="form-group">
                        <label for="amount">Amount to transfer ($):</label>
                        <input type="number" id="amount" min="0.01" max="${currentBalance}" step="0.01" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Transfer Funds</button>
                </form>
            </div>
        </div>
    `;
    
    // Show modal
    modalContainer.classList.add('active');
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.close-btn');
    const backdrop = modalContainer.querySelector('.modal-backdrop');
    const form = modalContainer.querySelector('#transfer-form');
    
    closeBtn.addEventListener('click', () => modalContainer.classList.remove('active'));
    backdrop.addEventListener('click', () => modalContainer.classList.remove('active'));
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (amount > currentBalance) {
            alert('Insufficient funds in your account');
            return;
        }
        
        // Update goal and balance
        goal.savedAmount += amount;
        userData.balances.USD -= amount;
        
        // Add to transaction history
        if (!userData.transferHistory) {
            userData.transferHistory = [];
        }
        
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US'); // Format: MM/DD/YYYY
        
        userData.transferHistory.push({
            date: dateStr,
            beneficiary: `Savings: ${goal.goal}`,
            amount: `-$${amount.toFixed(2)}`,
            status: 'Completed'
        });
        
        updateUserData(userData);
        
        // Update UI
        updateBalanceDisplay();
        
        const savingGoalsList = document.getElementById('saving-goals-list');
        const savingGoalsTable = document.getElementById('saving-goals-table');
        
        if (savingGoalsList) {
            renderSavingsGoals(userData.savingGoals);
        } else if (savingGoalsTable) {
            renderSavingsGoalsTable(userData.savingGoals, savingGoalsTable);
        }
        
        // Update transactions table if it exists
        const transactionsTable = document.getElementById('transactions-table');
        if (transactionsTable) {
            populateTransactionsTable(transactionsTable, userData.transferHistory);
        }
        
        // Close modal
        modalContainer.classList.remove('active');
        
        // Show success message
        alert(`$${amount.toFixed(2)} transferred to your "${goal.goal}" savings goal!`);
    });
}

// Function to show modal for editing a goal
function showEditGoalForm(goalId) {
    const userData = getUserData();
    const goal = userData.savingGoals.find(g => g.id === goalId);
    
    if (!goal) return;
    
    // Create or get modal container
    let modalContainer = document.getElementById('goal-modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'goal-modal-container';
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Saving Goal</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <form id="edit-goal-form">
                    <div class="form-group">
                        <label for="goal-name">Goal Name:</label>
                        <input type="text" id="goal-name" value="${goal.goal}" required>
                    </div>
                    <div class="form-group">
                        <label for="saved-amount">Current Savings ($):</label>
                        <input type="number" id="saved-amount" value="${goal.savedAmount.toFixed(2)}" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="target-amount">Target Amount ($):</label>
                        <input type="number" id="target-amount" value="${goal.targetAmount.toFixed(2)}" min="0.01" step="0.01" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        </div>
    `;
    
    // Show modal
    modalContainer.classList.add('active');
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.close-btn');
    const backdrop = modalContainer.querySelector('.modal-backdrop');
    const form = modalContainer.querySelector('#edit-goal-form');
    
    closeBtn.addEventListener('click', () => modalContainer.classList.remove('active'));
    backdrop.addEventListener('click', () => modalContainer.classList.remove('active'));
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const goalName = document.getElementById('goal-name').value.trim();
        const savedAmount = parseFloat(document.getElementById('saved-amount').value);
        const targetAmount = parseFloat(document.getElementById('target-amount').value);
        
        if (!goalName || isNaN(savedAmount) || isNaN(targetAmount) || targetAmount <= 0) {
            alert('Please enter valid information');
            return;
        }
        
        // Update goal
        goal.goal = goalName;
        goal.savedAmount = savedAmount;
        goal.targetAmount = targetAmount;
        updateUserData(userData);
        
        // Update UI
        const savingGoalsList = document.getElementById('saving-goals-list');
        const savingGoalsTable = document.getElementById('saving-goals-table');
        
        if (savingGoalsList) {
            renderSavingsGoals(userData.savingGoals);
        } else if (savingGoalsTable) {
            renderSavingsGoalsTable(userData.savingGoals, savingGoalsTable);
        }
        
        // Close modal
        modalContainer.classList.remove('active');
        
        // Show success message
        alert('Saving goal updated successfully!');
    });
}

// Function to show modal for adding a new goal
function showAddGoalForm() {
    // Create or get modal container
    let modalContainer = document.getElementById('goal-modal-container');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'goal-modal-container';
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    modalContainer.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Saving Goal</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <form id="add-goal-form">
                    <div class="form-group">
                        <label for="goal-name">Goal Name:</label>
                        <input type="text" id="goal-name" required>
                    </div>
                    <div class="form-group">
                        <label for="saved-amount">Initial Savings ($):</label>
                        <input type="number" id="saved-amount" value="0" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="target-amount">Target Amount ($):</label>
                        <input type="number" id="target-amount" min="0.01" step="0.01" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Create Goal</button>
                </form>
            </div>
        </div>
    `;
    
    // Show modal
    modalContainer.classList.add('active');
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.close-btn');
    const backdrop = modalContainer.querySelector('.modal-backdrop');
    const form = modalContainer.querySelector('#add-goal-form');
    
    closeBtn.addEventListener('click', () => modalContainer.classList.remove('active'));
    backdrop.addEventListener('click', () => modalContainer.classList.remove('active'));
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const userData = getUserData();
        
        const goalName = document.getElementById('goal-name').value.trim();
        const savedAmount = parseFloat(document.getElementById('saved-amount').value);
        const targetAmount = parseFloat(document.getElementById('target-amount').value);
        
        if (!goalName || isNaN(savedAmount) || isNaN(targetAmount) || targetAmount <= 0) {
            alert('Please enter valid information');
            return;
        }
        
        // Generate a new ID
        const maxId = userData.savingGoals.reduce((max, goal) => Math.max(max, goal.id || 0), 0);
        const newId = maxId + 1;
        
        // Add new goal
        userData.savingGoals.push({
            id: newId,
            goal: goalName,
            savedAmount: savedAmount,
            targetAmount: targetAmount
        });
        
        updateUserData(userData);
        
        // Update UI
        const savingGoalsList = document.getElementById('saving-goals-list');
        const savingGoalsTable = document.getElementById('saving-goals-table');
        
        if (savingGoalsList) {
            renderSavingsGoals(userData.savingGoals);
        } else if (savingGoalsTable) {
            renderSavingsGoalsTable(userData.savingGoals, savingGoalsTable);
        }
        
        // Close modal
        modalContainer.classList.remove('active');
        
        // Show success message
        alert('New saving goal created successfully!');
    });
}

// Function to delete a goal
function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this saving goal?')) {
        return;
    }
    
    const userData = getUserData();
    const goalIndex = userData.savingGoals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) return;
    
    // Remove goal
    userData.savingGoals.splice(goalIndex, 1);
    updateUserData(userData);
    
    // Update UI
    const savingGoalsList = document.getElementById('saving-goals-list');
    const savingGoalsTable = document.getElementById('saving-goals-table');
    
    if (savingGoalsList) {
        renderSavingsGoals(userData.savingGoals);
    } else if (savingGoalsTable) {
        renderSavingsGoalsTable(userData.savingGoals, savingGoalsTable);
    }
    
    // Show success message
    alert('Saving goal deleted successfully!');
}

// Helper function to get user data from local storage
function getUserData() {
    const userDataStr = localStorage.getItem('userData');
    return userDataStr ? JSON.parse(userDataStr) : { savingGoals: [], balances: { USD: 10000.00 } };
}

// Helper function to get users from local storage
function getUsers() {
    const usersStr = localStorage.getItem('users');
    return usersStr ? JSON.parse(usersStr) : [{ name: 'Demo User' }];
}

// Helper function to update user data in local storage
function updateUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Add CSS for the modal and interactive elements if it doesn't exist
function addStyles() {
    if (document.getElementById('dynamic-goals-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-goals-styles';
    styleElement.textContent = `
        /* Modal styles */
        .modal-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
        }
        
        .modal-container.active {
            display: block;
        }
        
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
        }
        
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 500px;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
        }
        
        .form-group input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        /* Button styles */
        .btn-sm {
            padding: 2px 8px;
            font-size: 12px;
            margin-right: 5px;
            border-radius: 3px;
            cursor: pointer;
        }
        
        .btn-transfer {
            background-color: #4CAF50;
            color: white;
            border: none;
        }
        
        .btn-edit {
            background-color: #2196F3;
            color: white;
            border: none;
        }
        
        .btn-delete {
            background-color: #f44336;
            color: white;
            border: none;
        }
        
        /* Enhanced goal item styles */
        .goal-item {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .goal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .goal-title {
            font-weight: bold;
            font-size: 16px;
        }
        
        .goal-percentage {
            font-weight: bold;
            color: #4CAF50;
        }
        
        .goal-amount {
            margin-bottom: 10px;
            font-size: 14px;
            color: #666;
        }
        
        .progress-bar {
            background-color: #e0e0e0;
            height: 10px;
            border-radius: 5px;
            overflow: hidden;
        }
        
        .progress {
            background-color: #4CAF50;
            height: 100%;
            border-radius: 5px;
            text-align: center;
            color: white;
            font-size: 10px;
            line-height: 10px;
            transition: width 0.5s ease-in-out;
        }
        
        .goal-actions {
            margin-top: 10px;
        }
        
        .mt-2 {
            margin-top: 10px;
        }
        
        .mt-3 {
            margin-top: 15px;
        }
        
        .btn {
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn-primary {
            background-color:#0047AB;
            color: white;
            border: none;
        }
    `;
    
    document.head.appendChild(styleElement);
}


// Add this function to implement quick transfers
function setupQuickTransfer() {
    const quickTransferForm = document.getElementById('quick-transfer-form');
    if (!quickTransferForm) return;
    
    quickTransferForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const accountNumber = document.getElementById('transfer-account').value.trim();
        const amount = parseFloat(document.getElementById('transfer-amount').value);
        const description = document.getElementById('transfer-description')?.value.trim() || 'Quick Transfer';
        
        // Validate input
        if (!accountNumber || accountNumber.length < 5) {
            alert('Please enter a valid account number (minimum 5 characters)');
            return;
        }
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        // Get user data
        const userData = getUserData();
        const currentBalance = userData.balances?.USD || 0;
        
        // Check if user has sufficient funds
        if (amount > currentBalance) {
            alert('Insufficient funds for this transfer');
            return;
        }
        
        // Update balance
        userData.balances.USD -= amount;
        
        // Add to transaction history
        if (!userData.transferHistory) {
            userData.transferHistory = [];
        }
        

        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US'); // Format: MM/DD/YYYY
        
        userData.transferHistory.push({
            date: dateStr,
            beneficiary: `Account: ${accountNumber}`,
            amount: `-$${amount.toFixed(2)}`,
            description: description,
            status: 'Completed'
        });
        
        // Save updated data
        updateUserData(userData);
        
        // Update UI
        updateBalanceDisplay();
        
        // Update transactions table if it exists
        const transactionsTable = document.getElementById('transactions-table');
        if (transactionsTable) {
            populateTransactionsTable(transactionsTable, userData.transferHistory);
        }
        
        // Reset form
        quickTransferForm.reset();
        
        // Show success message
        alert(`$${amount.toFixed(2)} successfully transferred to account ${accountNumber}`);
    });
}

// Add this to the DOMContentLoaded event listener (at the bottom of the main event listener)
// Just before the closing });
setupQuickTransfer();

// Call the function to add styles
addStyles();