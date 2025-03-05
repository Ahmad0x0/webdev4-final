document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const refreshBtn = document.getElementById('refreshBtn');
    const newsContainer = document.getElementById('newsContainer');
    const marketData = document.getElementById('marketData');
    
    // API Endpoints
    const FINNHUB_API_KEY = 'cuvgbt9r01qpi6rva1ngcuvgbt9r01qpi6rva1o0';
    const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
    const MARKETAUX_API_KEY = 'VMgho1gwPNffXO2buAUc2G9rRG7NkDT9mMwlTaV3';
    const MARKETAUX_BASE_URL = 'https://api.marketaux.com/v1/news/all';
    
    // Stock symbols to track
    const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'BTC-USD'];
    
    // Debugging function to log errors
    function logError(source, error) {
        console.error(`[${source}] Error:`, error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
    }
    
    // Fetch market data from Finnhub API
    async function fetchMarketData() {
        newsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading market data...</div>';
        
        try {
            const marketPromises = STOCK_SYMBOLS.map(async (symbol) => {
                try {
                    const response = await fetch(`${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error for ${symbol}! status: ${response.status}`);
                    }
                    
                    return response.json();
                } catch (symbolError) {
                    logError(`Finnhub API - ${symbol}`, symbolError);
                    return null;
                }
            });
            
            const results = await Promise.all(marketPromises);
            const validResults = results.filter(result => result !== null);
            
            if (validResults.length === 0) {
                throw new Error('No valid market data could be retrieved');
            }
            
            displayMarketData(validResults, STOCK_SYMBOLS);
        } catch (error) {
            logError('Market Data Fetch', error);
            displayError(marketData, `Failed to load market data: ${error.message}`);
        }
    }
    
    // Fetch news data from Marketaux API
    async function fetchNewsData(category = 'all') {
        newsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
        
        try {
            const url = new URL(MARKETAUX_BASE_URL);
            url.searchParams.append('api_token', MARKETAUX_API_KEY);
            url.searchParams.append('language', 'en');
            url.searchParams.append('sectors', category);
            url.searchParams.append('limit', '10');
            
            const response = await fetch(url.toString());
            
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
            }
            
            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                throw new Error('No news articles found');
            }
            
            displayNewsData(data.data);
        } catch (error) {
            logError('News Data Fetch', error);
            displayError(newsContainer, `Failed to load news: ${error.message}`);
        }
    }
    
    // Display market data in the UI
    function displayMarketData(data, symbols) {
        const marketContainer = document.getElementById('marketData');
        marketContainer.innerHTML = '';
        
        data.forEach((quote, index) => {
            if (!quote) return; // Skip null results
            
            const symbol = symbols[index];
            const isPositive = quote.dp > 0;
            
            const marketItem = document.createElement('div');
            marketItem.className = 'market-item';
            marketItem.innerHTML = `
                <div class="market-name">${symbol}</div>
                <div class="market-price">$${quote.c ? quote.c.toFixed(2) : 'N/A'}</div>
                <div class="market-change ${isPositive ? 'positive' : 'negative'}">
                    <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'}"></i>
                    ${quote.dp ? Math.abs(quote.dp).toFixed(2) + '%' : 'N/A'}
                </div>`;
            
            marketContainer.appendChild(marketItem);
        });
    }
    
    // Display news data in the UI
    function displayNewsData(articles) {
        newsContainer.innerHTML = '';
        
        articles.forEach(article => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            
            // Truncate text safely
            const truncate = (text, maxLength) => 
                text && text.length > maxLength 
                    ? text.substring(0, maxLength) + '...' 
                    : text || 'No description available';
            
            newsCard.innerHTML = `
                <div class="news-content">
                    <h4 class="news-title">${truncate(article.title, 100)}</h4>
                    <p class="news-description">${truncate(article.description, 200)}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source || 'Unknown Source'}</span>
                        <a href="${article.url}" target="_blank" class="read-more-link">Read More</a>
                    </div>
                </div>`;
            
            newsContainer.appendChild(newsCard);
        });
    }
    
    // Display error message
    function displayError(container, message) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i> 
                ${message}
            </div>`;
    }
    
    // Refresh button event listener
    document.getElementById('refreshBtn').addEventListener('click', () => {
        fetchMarketData();
        fetchNewsData();
    });
    
    // Initial load
    fetchMarketData();
    fetchNewsData();
});