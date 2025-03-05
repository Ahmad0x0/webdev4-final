Jammal Bank 
Overview
Jammal Bank is a simple banking website that allows users to manage their finances, including currency conversion, investments, transfers, and financial news. The website is built using HTML, CSS, and JavaScript, with data stored in the browser's local storage.

Features
•	Currency Conversion: Convert between different currencies using real-time exchange rates.
•	Dashboard: View account balances, recent transactions, and investment holdings.
•	Investments: Manage stock holdings, watchlist, and order history.
•	Transfers: Perform quick and scheduled transfers to beneficiaries.
•	Financial News: Stay updated with the latest financial news and market data.
•	Saving Goals: Set and track saving goals with progress tracking.
•	User Authentication: Secure login and logout functionality.

APIs Used
API Name	API Key	Base URL
ExchangeRate-API	5939e4a4330eb97a01284f15	https://v6.exchangerate-api.com/v6/

Finnhub API	cuvgbt9r01qpi6rva1ngcuvg	https://finnhub.io/api/v1

Marketaux API	VMgho1gwPNffXO2buAUc2G9r	https://api.marketaux.com/v1/news/all







JavaScript Files
1.	currency-converter.js: Handles currency conversion functionality.
2.	dashboardScript.js: Manages the dashboard UI and user data display.
3.	financial-news.js: Fetches and displays financial news and market data.
4.	initializeStorage.js: Initializes local storage with default user data.
5.	investments.js: Manages investment-related functionalities like holdings, watchlist, and order history.
6.	navScript.js: Handles navigation and logout functionality.
7.	script-index.js: Manages the homepage UI and animations.
8.	script-login.js: Handles user login and authentication.
9.	sessionCheckUp.js: Checks user session validity and redirects if necessary.
10.	transfer.js: Manages transfer functionalities, including quick and scheduled transfers.

How to Use
1.	Login: Use the provided credentials to log in.
•	Username: Ahmad
•	Password: ahmad123
2.	Dashboard: After logging in, you will be directed to the dashboard where you can view your account balance, recent transactions, and investment holdings.
3.	Currency Conversion: Navigate to the currency converter to convert between different currencies using real-time exchange rates.
4.	Investments: Manage your stock holdings, add stocks to your watchlist, and view your order history.
5.	Transfers: Perform quick transfers to beneficiaries or schedule future transfers.
6.	Financial News: Stay updated with the latest financial news and market data.
7.	Saving Goals: Set and track your saving goals with progress tracking.

Local Storage
User data is stored in the browser's local storage, including account balances, transactions, investments, and saving goals. To reset the data, use the resetUserData() function available in the browser console.
