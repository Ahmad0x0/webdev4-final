
document.addEventListener('DOMContentLoaded', function () {
    // Initialize local storage if not exists
    initializeLocalStorage();

    // API Key for ExchangeRate-API (free tier)
    const API_KEY = '5939e4a4330eb97a01284f15';
    const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

    // Supported currencies
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD'];

    // DOM Elements
    const balanceGrid = document.getElementById('balanceGrid');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const amount = document.getElementById('amount');
    const convertBtn = document.getElementById('convertBtn');
    const conversionRate = document.getElementById('conversionRate');
    const alert = document.getElementById('alert');
    const ratesTable = document.getElementById('ratesTable').getElementsByTagName('tbody')[0];
    const loading = document.getElementById('loading');

    // Populate currency select options
    function populateCurrencySelects() {
        currencies.forEach(currency => {
            fromCurrency.add(new Option(currency, currency));
            toCurrency.add(new Option(currency, currency));
        });
    }

    // Update balances display
    function updateBalances() {
        const userData = getUserData();
        balanceGrid.innerHTML = '';

        Object.entries(userData.balances).forEach(([currency, amount]) => {
            if (amount > 0) {
                balanceGrid.innerHTML += `
                <div class="balance-item">
                    <div class="balance-currency">${currency}</div>
                    <div class="balance-amount">${amount.toFixed(2)}</div>
                </div>
            `;
            }
        });
    }

    // Fetch exchange rates
    async function fetchRates() {
        loading.style.display = 'block';
        try {
            const response = await fetch(BASE_URL);
            const data = await response.json();

            ratesTable.innerHTML = '';
            currencies.forEach(currency => {
                if (currency !== 'USD') {
                    const rate = data.conversion_rates[currency];
                    const change = (Math.random() * 2 - 1).toFixed(2); // Simulated 24h change

                    ratesTable.innerHTML += `
                    <tr>
                        <td>${currency}</td>
                        <td>${rate.toFixed(4)}</td>
                        <td style="color: ${change >= 0 ? 'var(--success)' : 'var(--danger)'}">
                            ${change}%
                        </td>
                    </tr>
                `;
                }
            });
        } catch (error) {
            console.error('Error fetching rates:', error);
            alert.textContent = 'Error fetching exchange rates. Please try again later.';
            alert.className = 'alert alert-warning';
            alert.style.display = 'block';
        }
        loading.style.display = 'none';
    }

    // Handle currency conversion
    async function convertCurrency(e) {
        e.preventDefault();
        const fromCurr = fromCurrency.value;
        const toCurr = toCurrency.value;
        const amountValue = parseFloat(amount.value);

        if (fromCurr === toCurr) {
            alert.textContent = 'Please select different currencies';
            alert.className = 'alert alert-warning';
            alert.style.display = 'block';
            return;
        }

        const userData = getUserData();

        // Initialize the currency balance if it doesn't exist
        if (userData.balances[fromCurr] === undefined) {
            userData.balances[fromCurr] = 0;
        }

        if (amountValue > userData.balances[fromCurr]) {
            alert.textContent = 'Insufficient balance';
            alert.className = 'alert alert-warning';
            alert.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${BASE_URL.replace('/latest/USD', '')}/pair/${fromCurr}/${toCurr}/${amountValue}`);
            const data = await response.json();
            const convertedAmount = data.conversion_result;

            // Initialize toCurrency if it doesn't exist
            if (userData.balances[toCurr] === undefined) {
                userData.balances[toCurr] = 0;
            }

            // Update balances
            userData.balances[fromCurr] -= amountValue;
            userData.balances[toCurr] += convertedAmount;

            // Add to transfer history
            if (!userData.transferHistory) {
                userData.transferHistory = [];
            }

            userData.transferHistory.unshift({
                date: new Date().toISOString().split('T')[0],
                beneficiary: `${fromCurr} to ${toCurr} conversion`,
                amount: `-${amountValue.toFixed(2)} ${fromCurr} / +${convertedAmount.toFixed(2)} ${toCurr}`,
                description: 'Currency Exchange',
                status: 'completed'
            });

            updateUserData(userData);
            updateBalances();

            alert.textContent = `Successfully converted ${amountValue} ${fromCurr} to ${convertedAmount.toFixed(2)} ${toCurr}`;
            alert.className = 'alert alert-success';
            alert.style.display = 'block';

            // Reset form
            amount.value = '';
            conversionRate.textContent = '--';
        } catch (error) {
            console.error('Error converting currency:', error);
            alert.textContent = 'Error converting currency. Please try again later.';
            alert.className = 'alert alert-warning';
            alert.style.display = 'block';
        }
    }

    // Update conversion rate display
    async function updateConversionRate() {
        const fromCurr = fromCurrency.value;
        const toCurr = toCurrency.value;

        if (fromCurr && toCurr && fromCurr !== toCurr) {
            try {
                const response = await fetch(`${BASE_URL.replace('/latest/USD', '')}/pair/${fromCurr}/${toCurr}/1`);
                const data = await response.json();
                conversionRate.textContent = `1 ${fromCurr} = ${data.conversion_rate.toFixed(4)} ${toCurr}`;
            } catch (error) {
                console.error('Error fetching conversion rate:', error);
                conversionRate.textContent = 'Error fetching rate';
            }
        } else {
            conversionRate.textContent = '--';
        }
    }

    // Event Listeners
    if (document.getElementById('convertForm')) {
        document.getElementById('convertForm').addEventListener('submit', convertCurrency);
    }

    if (fromCurrency) {
        fromCurrency.addEventListener('change', updateConversionRate);
    }

    if (toCurrency) {
        toCurrency.addEventListener('change', updateConversionRate);
    }

    // Initialize
    if (fromCurrency && toCurrency) {
        populateCurrencySelects();
    }
    
    if (balanceGrid) {
        updateBalances();
    }
    
    if (ratesTable) {
        fetchRates();
        // Refresh rates every minute
        setInterval(fetchRates, 60000);
    }
});