// Initialize default user data if not exists
function initializeLocalStorage() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            { username: 'Ahmad', password: 'ahmad123', name: 'Ahmad Aljammal' }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('userData')) {
        const defaultUserData = {
            holdings: [
                { symbol: 'AAPL', name: 'Apple Inc.', shares: 50, price: 175.84, marketValue: 8792.00, return: 15.4 },
                { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 30, price: 328.79, marketValue: 9863.70, return: 22.1 },
                { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 15, price: 143.96, marketValue: 2159.40, return: -5.2 }
            ],
            watchlist: [
                { symbol: 'TSLA', price: 202.64, change: 3.2 },
                { symbol: 'AMZN', price: 178.22, change: -1.4 },
                { symbol: 'NVDA', price: 788.17, change: 0.8 }
            ],
            orderHistory: [
                { date: '2024-02-23', symbol: 'AAPL', type: 'Buy', quantity: 10, price: 175.84, status: 'Completed' },
                { date: '2024-02-22', symbol: 'MSFT', type: 'Sell', quantity: 5, price: 328.79, status: 'Completed' },
                { date: '2024-02-21', symbol: 'GOOGL', type: 'Buy', quantity: 8, price: 143.96, status: 'Pending' }
            ],
            recentActivity: [
                { datetime: '2024-02-24 14:30', activity: 'Login Successful', location: 'New York, US', device: 'iPhone 13', status: 'success' },
                { datetime: '2024-02-24 12:15', activity: 'Password Change', location: 'New York, US', device: 'Chrome Windows', status: 'success' }
            ],
            beneficiaries: [
                { name: 'John Smith', accountNo: '*****1234', bank: 'Chase Bank' },
                { name: 'Sarah Wilson', accountNo: '*****5678', bank: 'Bank of America' }
            ],
            transferHistory: [
                { date: '2024-02-23', beneficiary: 'John Smith', amount: '$500.00', description: 'Rent Payment', status: 'completed' }
            ],
            balances: {
                USD: 45600,
                EUR: 0,
                GBP: 0,
                JPY: 0
            }
        };
        localStorage.setItem('userData', JSON.stringify(defaultUserData));
    }
}

// Get user data from local storage
function getUserData() {
    return JSON.parse(localStorage.getItem('userData'));
}

// Update user data in local storage
function updateUserData(updatedData) {
    localStorage.setItem('userData', JSON.stringify(updatedData));
}

// Reset user data to default
function resetUserData() {
    localStorage.removeItem('userData');
    initializeLocalStorage();
}

// Get all users (for login purposes)
function getUsers() {
    return JSON.parse(localStorage.getItem('users'));
}

// Authenticate user login
function authenticateUser(username, password) {
    const users = getUsers();
    return users.find(user => user.username === username && user.password === password);
}

// Add a new user (registration)
function addUser(newUser) {
    const users = getUsers();
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
}

// Initialize local storage on script load
initializeLocalStorage();

// Attach functions to the `window` object for global access
window.getUserData = getUserData;
window.updateUserData = updateUserData;
window.resetUserData = resetUserData;
window.getUsers = getUsers;
window.authenticateUser = authenticateUser;
window.addUser = addUser;
