document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("checkbox");
  const navItems = document.querySelectorAll(".nav-item");
  const mainContent = document.querySelector(".main");
  const greeting = document.querySelector(".greeting");
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const dashboardApp = document.querySelector(".dashboard-app");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
  const resultsContainer = document.getElementById("stocks-results");
  const tableBody = document.getElementById("stocks-table-body");
  const resultsCount = document.getElementById("results-count");

  // Theme Toggle Functionality
  if (checkbox) {
    const currentTheme = localStorage.getItem("theme") || "light";
    if (currentTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
      checkbox.checked = true;
    }
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // Sidebar Toggle Functionality
  if (dashboardApp && sidebarToggleBtn) {
    const isCollapsed = localStorage.getItem("sidebar-collapsed") === "true";
    if (isCollapsed) {
      dashboardApp.classList.add("is-collapsed");
      sidebarToggleBtn.setAttribute("aria-expanded", "false");
    } else {
      sidebarToggleBtn.setAttribute("aria-expanded", "true");
    }

    sidebarToggleBtn.addEventListener("click", function () {
      const nowCollapsed = dashboardApp.classList.toggle("is-collapsed");
      localStorage.setItem("sidebar-collapsed", String(nowCollapsed));
      sidebarToggleBtn.setAttribute(
        "aria-expanded",
        nowCollapsed ? "false" : "true"
      );
    });
  }

  // Page templates
  const pageTemplates = {
    dashboard: `
      <div class="dashboard-content">
        <h2>Dashboard Overview</h2>
        <p>Welcome to your investment dashboard.</p>
      </div>
    `,
    stocks: `
      <div class="stocks-page">
        <div class="stocks-header">
          <h2 class="page-title">Stocks</h2>
          <p class="page-description">Search and discover stock information</p>
        </div>
        
        <div class="stocks-search-section">
          <div class="search-container">
            <input 
              type="text" 
              id="stock-search-input" 
              class="stock-search-input" 
              placeholder="Search stocks by name or symbol (e.g., AAPL, Tesla)"
              aria-label="Search stocks"
            />
            <button id="stock-search-btn" class="stock-search-btn" aria-label="Search stocks">
              <img src="/images/search-icon.png" alt="Search" />
            </button>
          </div>
        </div>

        <div class="stocks-results" id="stocks-results" style="display: none;">
          <div class="results-header">
            <h3>Search Results</h3>
            <span class="results-count" id="results-count">0 results</span>
          </div>
          
          <div class="stocks-table-container">
            <table class="stocks-table">
              <thead>
                <tr>
                  <th class="stock-name-col">Name</th>
                  <th class="stock-value-col">Value</th>
                  <th class="stock-change-col">Change</th>
                  <th class="stock-percent-col">Chg%</th>
                  <th class="stock-open-col">Open</th>
                  <th class="stock-high-col">High</th>
                  <th class="stock-low-col">Low</th>
                  <th class="stock-prev-col">Prev</th>
                </tr>
              </thead>
              <tbody id="stocks-table-body">
                <!-- Results will be populated here -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
    portfolios: `
      <div class="portfolios-page">
        <div class="portfolios-header">
          <div class="header-content">
            <h2 class="page-title">Portfolios</h2>
            <p class="page-description">Manage and track your investment portfolios</p>
          </div>
          <button class="add-portfolio-btn" id="add-portfolio-btn">
            <span class="add-icon">+</span>
            <span class="btn-text">Add Portfolio</span>
          </button>
        </div>
        
        <div class="portfolios-grid" id="portfolios-grid">
          <!-- Portfolio cards will be dynamically generated here -->
        </div>
      </div>

      <!-- Add Portfolio Modal -->
      <div class="modal-overlay" id="portfolio-modal-overlay" style="display: none;">
        <div class="modal" id="portfolio-modal">
          <div class="modal-header">
            <h3>Create New Portfolio</h3>
            <button class="modal-close-btn" id="modal-close-btn">&times;</button>
          </div>
          <form class="modal-form" id="portfolio-form">
            <div class="form-group">
              <label for="portfolio-name">Portfolio Name</label>
              <input 
                type="text" 
                id="portfolio-name" 
                name="name" 
                placeholder="e.g., Tech Growth Portfolio"
                required
              />
            </div>
            <div class="form-group">
              <label for="portfolio-description">Description</label>
              <textarea 
                id="portfolio-description" 
                name="description" 
                placeholder="Brief description of your portfolio strategy..."
                rows="3"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="portfolio-risk">Risk Profile</label>
              <select id="portfolio-risk" name="riskProfile" required>
                <option value="">Select risk level</option>
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>
            <div class="form-group">
              <label for="portfolio-initial">Initial Investment (Optional)</label>
              <input 
                type="number" 
                id="portfolio-initial" 
                name="initialInvestment" 
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="cancel-portfolio-btn">Cancel</button>
              <button type="submit" class="btn-primary">Create Portfolio</button>
            </div>
          </form>
        </div>
      </div>
    `,
    holdings: `
      <div class="holdings-content">
        <h2>Holdings</h2>
        <p>View your current holdings.</p>
      </div>
    `,
    transactions: `
      <div class="transactions-content">
        <h2>Transactions</h2>
        <p>Review your transaction history.</p>
      </div>
    `,
  };

  // Dummy stock data
  const dummyStockData = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      value: 175.43,
      change: 2.15,
      changePercent: 1.24,
      open: 173.28,
      high: 176.12,
      low: 172.95,
      prev: 173.28,
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      value: 176.43,
      change: 2.35,
      changePercent: 1.26,
      open: 153.28,
      high: 196.12,
      low: 172.95,
      prev: 173.28,
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      value: 338.11,
      change: -4.22,
      changePercent: -1.23,
      open: 342.33,
      high: 343.75,
      low: 336.89,
      prev: 342.33,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      value: 125.37,
      change: 1.89,
      changePercent: 1.53,
      open: 123.48,
      high: 126.22,
      low: 123.15,
      prev: 123.48,
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      value: 127.74,
      change: -2.33,
      changePercent: -1.79,
      open: 130.07,
      high: 131.25,
      low: 126.98,
      prev: 130.07,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      value: 248.5,
      change: 8.75,
      changePercent: 3.65,
      open: 239.75,
      high: 251.3,
      low: 238.22,
      prev: 239.75,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      value: 875.28,
      change: 15.42,
      changePercent: 1.79,
      open: 859.86,
      high: 883.15,
      low: 856.73,
      prev: 859.86,
    },
    {
      symbol: "META",
      name: "Meta Platforms Inc.",
      value: 296.73,
      change: -3.87,
      changePercent: -1.29,
      open: 300.6,
      high: 302.44,
      low: 294.12,
      prev: 300.6,
    },
    {
      symbol: "NFLX",
      name: "Netflix Inc.",
      value: 425.69,
      change: 7.21,
      changePercent: 1.72,
      open: 418.48,
      high: 428.93,
      low: 416.77,
      prev: 418.48,
    },
  ];

  // Dummy portfolio data
  let portfoliosData = [
    {
      id: 1,
      name: "Tech Growth Portfolio",
      description: "High-growth technology stocks focusing on innovation leaders like Apple, Google, Microsoft, and emerging tech companies.",
      totalValue: 125750.449,
      invested: 107500.45,
      returnAmount: 18249.999,
      returnPercent: 16.976672518006927,
      riskProfile: "Aggressive",
      holdings: 9,
      lastUpdated: "2024-01-15",
      performance: {
        "1D": 2.34,
        "1W": 5.67,
        "1M": 12.45,
        "3M": 16.98,
        "1Y": 24.67
      }
    },
    {
      id: 2,
      name: "Conservative Income",
      description: "Stable dividend-paying stocks and bonds for steady income generation with minimal risk exposure.",
      totalValue: 42203.93,
      invested: 38000.00,
      returnAmount: 4203.93,
      returnPercent: 11.06,
      riskProfile: "Conservative",
      holdings: 12,
      lastUpdated: "2024-01-15",
      performance: {
        "1D": 0.15,
        "1W": 0.89,
        "1M": 2.34,
        "3M": 5.67,
        "1Y": 11.06
      }
    },
    {
      id: 3,
      name: "Balanced Growth",
      description: "Mix of growth and value stocks across different sectors for balanced risk-adjusted returns.",
      totalValue: 78425.67,
      invested: 72000.00,
      returnAmount: 6425.67,
      returnPercent: 8.92,
      riskProfile: "Moderate",
      holdings: 15,
      lastUpdated: "2024-01-15",
      performance: {
        "1D": 1.23,
        "1W": 2.45,
        "1M": 5.67,
        "3M": 7.89,
        "1Y": 8.92
      }
    }
  ];

  function updatePageTitle(page) {
    const pageTitles = {
      dashboard: "Dashboard",
      stocks: "Stocks",
      portfolios: "Portfolios",
      holdings: "Holdings",
      transactions: "Transactions",
    };
    greeting.textContent = `Hello {firstName} - ${
      pageTitles[page] || "Dashboard"
    }`;
  }

  function renderStockResults(searchTerm = "") {
    let filteredData = dummyStockData;
    if (searchTerm) {
      filteredData = dummyStockData.filter(
        (stock) =>
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filteredData = filteredData.slice(0, 10);

    if (filteredData.length > 0) {
      resultsContainer.style.display = "block";
      resultsCount.textContent = `${filteredData.length} result${
        filteredData.length !== 1 ? "s" : ""
      }`;

      tableBody.innerHTML = filteredData
        .map(
          (stock) => `
        <tr class="stock-row">
          <td class="stock-name">
            <div class="stock-info">
              <span class="stock-symbol">${stock.symbol}</span>
              <span class="stock-company">${stock.name}</span>
            </div>
          </td>
          <td class="stock-value">$${stock.value.toFixed(2)}</td>
          <td class="stock-change ${
            stock.change >= 0 ? "positive" : "negative"
          }">
            ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}
          </td>
          <td class="stock-percent ${
            stock.changePercent >= 0 ? "positive" : "negative"
          }">
            ${stock.changePercent >= 0 ? "+" : ""}${stock.changePercent.toFixed(
            2
          )}%
          </td>
          <td class="stock-open">$${stock.open.toFixed(2)}</td>
          <td class="stock-high">$${stock.high.toFixed(2)}</td>
          <td class="stock-low">$${stock.low.toFixed(2)}</td>
          <td class="stock-prev">$${stock.prev.toFixed(2)}</td>
        </tr>
      `
        )
        .join("");
    } else {
      resultsContainer.style.display = "none";
    }
  }

  function renderPortfolios() {
    const portfoliosGrid = document.getElementById("portfolios-grid");
    if (!portfoliosGrid) return;

    portfoliosGrid.innerHTML = portfoliosData
      .map(
        (portfolio) => `
        <div class="portfolio-card" data-portfolio-id="${portfolio.id}">
          <div class="portfolio-card-header">
            <div class="portfolio-info">
              <h3 class="portfolio-name">${portfolio.name}</h3>
              <span class="portfolio-risk ${portfolio.riskProfile.toLowerCase()}">${portfolio.riskProfile}</span>
            </div>
            <div class="portfolio-menu">
              <button class="portfolio-menu-btn">⋯</button>
            </div>
          </div>
          
          <div class="portfolio-description">
            <p>${portfolio.description}</p>
          </div>
          
          <div class="portfolio-value">
            <div class="current-value">
              <span class="value-label">Total Value</span>
              <span class="value-amount">$${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="return-info">
              <span class="return-amount ${portfolio.returnPercent >= 0 ? 'positive' : 'negative'}">
                ${portfolio.returnPercent >= 0 ? '+' : ''}$${portfolio.returnAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span class="return-percent ${portfolio.returnPercent >= 0 ? 'positive' : 'negative'}">
                ${portfolio.returnPercent >= 0 ? '+' : ''}${portfolio.returnPercent.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div class="portfolio-stats">
            <div class="stat-item">
              <span class="stat-label">Holdings</span>
              <span class="stat-value">${portfolio.holdings}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Invested</span>
              <span class="stat-value">$${portfolio.invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <div class="portfolio-performance">
            <div class="performance-header">
              <span class="performance-label">Performance</span>
              <span class="performance-period">1M</span>
            </div>
            <div class="performance-chart">
              <div class="chart-placeholder">
                <div class="chart-line ${portfolio.performance['1M'] >= 0 ? 'positive' : 'negative'}"></div>
              </div>
              <span class="performance-value ${portfolio.performance['1M'] >= 0 ? 'positive' : 'negative'}">
                ${portfolio.performance['1M'] >= 0 ? '+' : ''}${portfolio.performance['1M']}%
              </span>
            </div>
          </div>
          
          <div class="portfolio-actions">
            <button class="btn-view">View</button>
            <button class="btn-edit">Edit</button>
            <button class="btn-add-stock">+ Add Stock</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  function setupPortfolioModal() {
    const addPortfolioBtn = document.getElementById("add-portfolio-btn");
    const modalOverlay = document.getElementById("portfolio-modal-overlay");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const cancelBtn = document.getElementById("cancel-portfolio-btn");
    const portfolioForm = document.getElementById("portfolio-form");

    if (!addPortfolioBtn || !modalOverlay) return;

    // Show modal
    addPortfolioBtn.addEventListener("click", () => {
      modalOverlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

    // Hide modal
    function hideModal() {
      modalOverlay.style.display = "none";
      document.body.style.overflow = "auto";
      portfolioForm.reset();
    }

    modalCloseBtn?.addEventListener("click", hideModal);
    cancelBtn?.addEventListener("click", hideModal);
    
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });

    // Handle form submission
    portfolioForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const formData = new FormData(portfolioForm);
      const newPortfolio = {
        id: portfoliosData.length + 1,
        name: formData.get("name"),
        description: formData.get("description"),
        riskProfile: formData.get("riskProfile"),
        totalValue: parseFloat(formData.get("initialInvestment")) || 0,
        invested: parseFloat(formData.get("initialInvestment")) || 0,
        returnAmount: 0,
        returnPercent: 0,
        holdings: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        performance: {
          "1D": 0,
          "1W": 0,
          "1M": 0,
          "3M": 0,
          "1Y": 0
        }
      };

      portfoliosData.push(newPortfolio);
      renderPortfolios();
      hideModal();
    });
  }

  function loadPage(page) {
    if (pageTemplates[page]) {
      mainContent.innerHTML = pageTemplates[page];
      updatePageTitle(page);

      // If stocks page, set up search functionality
      if (page === "stocks") {
        const searchInput = document.getElementById("stock-search-input");
        const searchBtn = document.getElementById("stock-search-btn");

        function performSearch() {
          const searchTerm = searchInput.value.trim();
          if (searchTerm) {
            renderStockResults(searchTerm);
          }
        }

        searchBtn.addEventListener("click", performSearch);
        searchInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
            performSearch();
          }
        });
      }

      // If portfolios page, set up portfolio functionality
      if (page === "portfolios") {
        renderPortfolios();
        setupPortfolioModal();
      }
    }
  }

  // Set up navigation
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      navItems.forEach((nav) => nav.classList.remove("active"));

      this.classList.add("active");

      const pageText =
        this.querySelector(".nav-text").textContent.toLowerCase();
      loadPage(pageText);
    });
  });

  // Load dashboard by default
  loadPage("dashboard");

  function showView(view) {
    if (loginSection)
      loginSection.style.display = view === "login" ? "block" : "none";
    if (registerSection)
      registerSection.style.display = view === "register" ? "block" : "none";
    if (dashboardSection)
      dashboardSection.style.display = view === "dashboard" ? "block" : "none";
  }

  const API_BASE =
    location.port === "5500" || location.port === "5173"
      ? "http://localhost:3000"
      : "";

  const isAuthed = !!localStorage.getItem("token");
  showView(isAuthed ? "dashboard" : "login");

  const goToRegister = document.getElementById("go-to-register");
  if (goToRegister)
    goToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      showView("register");
    });

  const goToLogin = document.getElementById("go-to-login");
  if (goToLogin)
    goToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      showView("login");
    });

  // Login submit
  const loginForm = document.getElementById("loginForm");
  const loginErrorEl = document.getElementById("loginError");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginErrorEl.hidden = true;
      loginErrorEl.textContent = "";

      const data = {
        email: loginForm.email.value.trim(),
        password: loginForm.password.value,
      };
      if (!data.email || !data.password) {
        loginErrorEl.textContent = "Please enter email and password.";
        loginErrorEl.hidden = false;
        return;
      }

      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(payload.error || payload.message || "Login failed");

        if (payload.token) localStorage.setItem("token", payload.token);
        if (payload.user)
          localStorage.setItem("user", JSON.stringify(payload.user));

        showView("dashboard");
        loadPage("dashboard");
      } catch (err) {
        loginErrorEl.textContent = err.message || "Login failed";
        loginErrorEl.hidden = false;
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Register submit
  const registerForm = document.getElementById("registerForm");
  const registerErrorEl = document.getElementById("registerError");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      registerErrorEl.hidden = true;
      registerErrorEl.textContent = "";

      const data = {
        name: registerForm.name.value.trim(),
        email: registerForm.email.value.trim(),
        password: registerForm.password.value,
        confirmPassword: registerForm.confirmPassword.value,
      };
      if (
        !data.name ||
        !data.email ||
        !data.password ||
        !data.confirmPassword
      ) {
        registerErrorEl.textContent = "All fields are required.";
        registerErrorEl.hidden = false;
        return;
      }
      if (data.password.length < 6) {
        registerErrorEl.textContent = "Password must be at least 6 characters.";
        registerErrorEl.hidden = false;
        return;
      }
      if (data.password !== data.confirmPassword) {
        registerErrorEl.textContent = "Passwords do not match.";
        registerErrorEl.hidden = false;
        return;
      }

      const btn = registerForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(
            payload.error || payload.message || "Register failed"
          );

        if (payload.token) localStorage.setItem("token", payload.token);
        if (payload.user)
          localStorage.setItem("user", JSON.stringify(payload.user));

        showView("dashboard");
        loadPage("dashboard");
      } catch (err) {
        registerErrorEl.textContent = err.message || "Register failed";
        registerErrorEl.hidden = false;
      } finally {
        btn.disabled = false;
      }
    });
  }

  // Logout
  const logoutLink = document.querySelector(".logout-item");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      showView("login");
    });
  }

  // Initial route: if authed show dashboard else login
  showView("dashboard");
});
