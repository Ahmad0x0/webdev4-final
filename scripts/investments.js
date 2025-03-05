document.addEventListener('DOMContentLoaded', function() {
    // Ensure local storage is initialized
    initializeLocalStorage();
    
    // Get user data from local storage
    let userData = getUserData();

    // Update portfolio overview
    function updatePortfolioOverview() {
        // Calculate total portfolio value
        const totalPortfolioValue = userData.holdings.reduce((total, holding) => 
            total + holding.marketValue, 0);
        
        // Update overview elements
        document.getElementById('totalPortfolioValue').textContent = 
            `$${totalPortfolioValue.toFixed(2)}`;
        
        document.getElementById('availableCash').textContent = 
            `$${userData.balances.USD.toFixed(2)}`;
        
        // Placeholder for total return calculation
        const totalReturn = totalPortfolioValue - userData.holdings.reduce((total, holding) => 
            total + (holding.shares * holding.price), 0);
        
        document.getElementById('totalReturn').textContent = 
            `$${totalReturn.toFixed(2)}`;
    }

    // Populate holdings table
    function populateHoldingsTable() {
        const holdingsTableBody = document.getElementById('holdingsTableBody');
        holdingsTableBody.innerHTML = ''; // Clear existing content
        
        userData.holdings.forEach(holding => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${holding.symbol}</td>
                <td>${holding.name}</td>
                <td>${holding.shares}</td>
                <td>$${holding.price.toFixed(2)}</td>
                <td>$${holding.marketValue.toFixed(2)}</td>
                <td class="${holding.return >= 0 ? 'positive' : 'negative'}">
                    ${holding.return.toFixed(2)}%
                </td>
            `;
            holdingsTableBody.appendChild(row);
        });

        updatePortfolioOverview();
    }
    
    // Populate watchlist
    function populateWatchlist() {
        const watchlistTableBody = document.getElementById('watchlistTableBody');
        watchlistTableBody.innerHTML = ''; // Clear existing content
        
        userData.watchlist.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.symbol}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td class="${item.change >= 0 ? 'positive' : 'negative'}">
                    ${item.change.toFixed(2)}%
                </td>
                <td>
                    <button class="btn trade-btn" data-symbol="${item.symbol}">Trade</button>
                    <button class="btn remove-watchlist-btn" data-symbol="${item.symbol}">Remove</button>
                </td>
            `;
            watchlistTableBody.appendChild(row);
        });
        
        // Add event listeners to trade buttons
        document.querySelectorAll('.trade-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const symbol = this.getAttribute('data-symbol');
                document.getElementById('tradeSymbol').value = symbol;
            });
        });

        // Add event listeners to remove watchlist buttons
        document.querySelectorAll('.remove-watchlist-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const symbol = this.getAttribute('data-symbol');
                removeFromWatchlist(symbol);
            });
        });
    }
    
    // Populate order history
    function populateOrderHistory() {
        const orderHistoryTableBody = document.getElementById('orderHistoryTableBody');
        orderHistoryTableBody.innerHTML = ''; // Clear existing content
        
        userData.orderHistory.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.date}</td>
                <td>${order.symbol}</td>
                <td>${order.type}</td>
                <td>${order.quantity}</td>
                <td>$${order.price.toFixed(2)}</td>
                <td>${order.status}</td>
            `;
            orderHistoryTableBody.appendChild(row);
        });
    }

    // Add to watchlist
    function addToWatchlist(symbol) {
        // Check if symbol already exists in watchlist
        const existingIndex = userData.watchlist.findIndex(item => item.symbol === symbol.toUpperCase());
        if (existingIndex === -1) {
            // Add default placeholder values
            userData.watchlist.push({
                symbol: symbol.toUpperCase(),
                price: 0,
                change: 0
            });
            updateUserData(userData);
            populateWatchlist();
            alert(`${symbol} added to watchlist`);
        } else {
            alert(`${symbol} is already in your watchlist`);
        }
    }

    // Remove from watchlist
    function removeFromWatchlist(symbol) {
        userData.watchlist = userData.watchlist.filter(item => item.symbol !== symbol);
        updateUserData(userData);
        populateWatchlist();
        alert(`${symbol} removed from watchlist`);
    }
    
    // Handle trade form submission
    const tradeForm = document.getElementById('tradeForm');
    tradeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
        const action = document.getElementById('tradeAction').value;
        const quantity = parseInt(document.getElementById('tradeQuantity').value);
        const orderType = document.getElementById('orderType').value;
        
        // Validate inputs
        if (!symbol || isNaN(quantity) || quantity <= 0) {
            alert('Please enter valid trade details');
            return;
        }

        // Simulate a price (in real app, this would come from an API)
        const price = Math.floor(Math.random() * 500) + 10; // Random price between 10-510
        
        // Create new order
        const newOrder = {
            date: new Date().toISOString().split('T')[0],
            symbol: symbol,
            type: action,
            quantity: quantity,
            price: price,
            status: 'Pending'
        };
        
        // Add to order history
        userData.orderHistory.unshift(newOrder);
        
        // Handle buy/sell logic
        if (action === 'buy') {
            // Check if user has enough balance
            const totalCost = quantity * price;
            if (totalCost > userData.balances.USD) {
                alert('Insufficient funds');
                return;
            }

            // Find existing holding or create new
            const holdingIndex = userData.holdings.findIndex(h => h.symbol === symbol);
            
            if (holdingIndex >= 0) {
                // Update existing holding
                userData.holdings[holdingIndex].shares += quantity;
                userData.holdings[holdingIndex].price = price;
                userData.holdings[holdingIndex].marketValue = 
                    userData.holdings[holdingIndex].shares * price;
            } else {
                // Add new holding
                userData.holdings.push({
                    symbol: symbol,
                    name: `${symbol} Inc.`, // Placeholder name
                    shares: quantity,
                    price: price,
                    marketValue: quantity * price,
                    return: 0
                });
            }
            
            // Deduct from USD balance
            userData.balances.USD -= totalCost;
            
            // Optionally add to watchlist if not already there
            const watchlistIndex = userData.watchlist.findIndex(w => w.symbol === symbol);
            if (watchlistIndex === -1) {
                userData.watchlist.push({
                    symbol: symbol,
                    price: price,
                    change: 0
                });
            }
        } else if (action === 'sell') {
            const holdingIndex = userData.holdings.findIndex(h => h.symbol === symbol);
            
            if (holdingIndex >= 0) {
                const holding = userData.holdings[holdingIndex];
                
                // Check if enough shares to sell
                if (holding.shares < quantity) {
                    alert(`You only have ${holding.shares} shares of ${symbol}`);
                    return;
                }
                
                // Update holding
                holding.shares -= quantity;
                holding.marketValue = holding.shares * price;
                
                // Remove holding if no shares left
                if (holding.shares <= 0) {
                    userData.holdings.splice(holdingIndex, 1);
                }
                
                // Add to USD balance
                userData.balances.USD += quantity * price;
            } else {
                alert(`You do not own any shares of ${symbol}`);
                return;
            }
        }
        
        // Update user data in local storage
        updateUserData(userData);
        
        // Refresh displays
        populateHoldingsTable();
        populateWatchlist();
        populateOrderHistory();
        
        // Show success message
        alert(`${action.toUpperCase()} order for ${quantity} shares of ${symbol} placed successfully!`);
        
        // Reset form
        tradeForm.reset();
    });

    // Add Watchlist Button Event Listener
    document.getElementById('addWatchlistBtn').addEventListener('click', function() {
        const symbol = document.getElementById('newWatchlistSymbol').value;
        if (symbol) {
            addToWatchlist(symbol);
            document.getElementById('newWatchlistSymbol').value = ''; // Clear input
        }
    });
    
    // Initial population of data
    populateHoldingsTable();
    populateWatchlist();
    populateOrderHistory();
});