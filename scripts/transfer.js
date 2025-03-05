
// Initialize local storage
initializeLocalStorage();

document.addEventListener('DOMContentLoaded', function() {
    // Get user data from local storage
    const userData = getUserData();
    
    // Ensure beneficiaries exists
    if (!userData.beneficiaries) {
        userData.beneficiaries = [
            { name: 'John Smith', accountNo: '*****1234', bank: 'Chase Bank' },
            { name: 'Sarah Wilson', accountNo: '*****5678', bank: 'Bank of America' },
            { name: 'Mike Johnson', accountNo: '*****9012', bank: 'Wells Fargo' }
        ];
        updateUserData(userData);
    }
    
    // Ensure transferHistory exists
    if (!userData.transferHistory) {
        userData.transferHistory = [
            { date: '2024-02-23', beneficiary: 'John Smith', amount: '$500.00', description: 'Rent Payment', status: 'completed' },
            { date: '2024-02-22', beneficiary: 'Sarah Wilson', amount: '$150.00', description: 'Dinner Split', status: 'pending' },
            { date: '2024-02-21', beneficiary: 'Mike Johnson', amount: '$1000.00', description: 'Investment', status: 'failed' }
        ];
        updateUserData(userData);
    }
    
    // Populate beneficiaries
    const beneficiaryList = document.getElementById('beneficiaryList');
    if (beneficiaryList && userData.beneficiaries) {
        beneficiaryList.innerHTML = ''; // Clear existing content
        userData.beneficiaries.forEach(beneficiary => {
            const card = document.createElement('div');
            card.className = 'beneficiary-card';
            card.innerHTML = `
                <h4>${beneficiary.name}</h4>
                <p>Account: ${beneficiary.accountNo}</p>
                <p>Bank: ${beneficiary.bank}</p>
            `;
            card.addEventListener('click', () => {
                // Auto-fill the transfer form when clicking a beneficiary
                const beneficiarySelect = document.getElementById('beneficiarySelect');
                if (beneficiarySelect) {
                    // Set select value if it exists
                    for (let i = 0; i < beneficiarySelect.options.length; i++) {
                        if (beneficiarySelect.options[i].text === beneficiary.name) {
                            beneficiarySelect.selectedIndex = i;
                            break;
                        }
                    }
                }
                
                // Alternative: Set text input
                const quickTransferForm = document.getElementById('quickTransferForm');
                if (quickTransferForm) {
                    const accountInput = quickTransferForm.querySelector('input[type="text"]');
                    if (accountInput) {
                        accountInput.value = beneficiary.accountNo;
                    }
                }
            });
            beneficiaryList.appendChild(card);
        });
    }
    
    // Populate beneficiary select dropdown
    const beneficiarySelect = document.getElementById('beneficiarySelect');
    if (beneficiarySelect && userData.beneficiaries) {
        beneficiarySelect.innerHTML = '<option value="">Select Beneficiary</option>';
        userData.beneficiaries.forEach(beneficiary => {
            const option = document.createElement('option');
            option.value = beneficiary.accountNo;
            option.textContent = beneficiary.name;
            beneficiarySelect.appendChild(option);
        });
    }
    
    // Populate transfer history
    const transferHistoryTable = document.getElementById('transferHistory');
    if (transferHistoryTable && userData.transferHistory) {
        const tbody = transferHistoryTable.tagName === 'TABLE' ? 
                     transferHistoryTable.getElementsByTagName('tbody')[0] || transferHistoryTable :
                     transferHistoryTable;
        
        tbody.innerHTML = ''; // Clear existing content
        userData.transferHistory.forEach(transfer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transfer.date}</td>
                <td>${transfer.beneficiary}</td>
                <td>${transfer.amount}</td>
                <td>${transfer.description || ''}</td>
                <td><span class="status-badge status-${transfer.status}">${transfer.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Update available balance display
    const availableBalance = document.getElementById('availableBalance');
    if (availableBalance && userData.balances && userData.balances.USD !== undefined) {
        availableBalance.textContent = `$${userData.balances.USD.toFixed(2)}`;
    }
    
    // Handle quick transfer form submission
    const quickTransferForm = document.getElementById('quickTransferForm');
    if (quickTransferForm) {
        quickTransferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userData = getUserData();
            
            // Get form data
            const beneficiaryName = this.querySelector('#beneficiarySelect') ? 
                                   this.querySelector('#beneficiarySelect option:checked').textContent :
                                   'External Account';
            const amount = parseFloat(this.querySelector('input[type="number"]').value);
            const description = this.querySelector('input[name="description"]') ?
                               this.querySelector('input[name="description"]').value :
                               'Quick Transfer';
            
            // Check if user has enough balance
            if (userData.balances.USD < amount) {
                alert('Insufficient balance for this transfer');
                return;
            }
            
            // Create new transfer record
            const newTransfer = {
                date: new Date().toISOString().split('T')[0],
                beneficiary: beneficiaryName,
                amount: `$${amount.toFixed(2)}`,
                description: description,
                status: 'pending'
            };
            
            // Update user data
            userData.transferHistory.unshift(newTransfer);
            userData.balances.USD -= amount;
            
            // Add to recent activity if it exists
            if (userData.recentActivity) {
                userData.recentActivity.unshift({
                    datetime: new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).replace(',', ''),
                    activity: `Transfer to ${beneficiaryName}`,
                    location: 'Current Location',
                    device: 'Current Device',
                    status: 'warning'
                });
            }
            
            updateUserData(userData);
            
            // Show success message
            alert('Transfer initiated! Please check your email for confirmation.');
            this.reset();
            
            // Refresh to show updated data
            location.reload();
        });
    }
    
    // Handle scheduled transfer form submission
    const scheduleTransferForm = document.getElementById('scheduleTransferForm');
    if (scheduleTransferForm) {
        scheduleTransferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userData = getUserData();
            
            // Get form data
            const beneficiarySelect = this.querySelector('#beneficiarySelect');
            const beneficiaryName = beneficiarySelect ? 
                                   beneficiarySelect.options[beneficiarySelect.selectedIndex].textContent :
                                   'External Account';
            const amount = parseFloat(this.querySelector('input[type="number"]').value);
            const date = this.querySelector('input[type="date"]').value;
            const description = this.querySelector('input[name="description"]') ?
                               this.querySelector('input[name="description"]').value :
                               'Scheduled Transfer';
            
            // Check if user has enough balance
            if (userData.balances.USD < amount) {
                alert('Insufficient balance for this transfer');
                return;
            }
            
            // Create new transfer record
            const newTransfer = {
                date: date,
                beneficiary: beneficiaryName,
                amount: `$${amount.toFixed(2)}`,
                description: description,
                status: 'scheduled'
            };
            
            // Update user data
            userData.transferHistory.unshift(newTransfer);
            
            // Add to recent activity if it exists
            if (userData.recentActivity) {
                userData.recentActivity.unshift({
                    datetime: new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).replace(',', ''),
                    activity: `Scheduled Transfer to ${beneficiaryName}`,
                    location: 'Current Location',
                    device: 'Current Device',
                    status: 'warning'
                });
            }
            
            updateUserData(userData);
            
            // Show success message
            alert('Transfer scheduled! You will receive a confirmation email.');
            this.reset();
            
            // Refresh to show updated data
            location.reload();
        });
    }
    
    // Add new beneficiary form
    const addBeneficiaryForm = document.getElementById('addBeneficiaryForm');
    if (addBeneficiaryForm) {
        addBeneficiaryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userData = getUserData();
            
            // Get form data
            const name = this.querySelector('input[name="name"]').value;
            const accountNo = this.querySelector('input[name="accountNo"]').value;
            const bank = this.querySelector('input[name="bank"]').value;
            
            // Create new beneficiary
            const newBeneficiary = {
                name: name,
                accountNo: accountNo,
                bank: bank
            };
            
            // Update user data
            userData.beneficiaries.push(newBeneficiary);
            
            // Add to recent activity if it exists
            if (userData.recentActivity) {
                userData.recentActivity.unshift({
                    datetime: new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).replace(',', ''),
                    activity: `Added Beneficiary: ${name}`,
                    location: 'Current Location',
                    device: 'Current Device',
                    status: 'success'
                });
            }

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
            
            updateUserData(userData);
            
            // Show success message
            alert('Beneficiary added successfully!');
            this.reset();
            
            // Refresh to show updated data
            location.reload();
        });
    }
});