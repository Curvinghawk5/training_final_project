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
  const transactionsTableBody = document.getElementById("transactions-table-body");
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
      <div class="portfolios-content">
        <h2>Portfolios</h2>
        <p>Manage your investment portfolios.</p>
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
    <section class="transactions-section">
      <h2>All Transactions</h2>
      <p>Review your transaction history.</p>

      <div class="stocks-table-container">
        <table class="stocks-table">
          <thead>
            <tr>
              <th class="stock-name-col">Date</th>
              <th class="stock-value-col">Type</th>
              <th class="stock-change-col">Asset</th>
              <th class="stock-percent-col">Quantity</th>
              <th class="stock-open-col">Price</th>
              <th class="stock-high-col">Total Value</th>
              <th class="stock-low-col">Fees</th>
              <th class="stock-prev-col">Portfolio</th>
            </tr>
          </thead>
          <tbody id="transactions-table-body"></tbody>
        </table>
      </div>
    </section>
  </div>
`,


  };

  // Fetch transactions from the backend
async function fetchTransactions() {
  const token = localStorage.getItem("token"); // Retrieve the user's token from local storage
  try {
    const response = await fetch(`${API_BASE}/user/logs`, { // Use the correct endpoint to fetch user logs
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Pass the token for authentication
        "Content-Type": "application/json",
      },
    });


    // Check if the response from the server is not OK (e.g., status code is not 200-299).
    // If so, throw an error to handle the failure case.
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const transactions = await response.json(); // Parse the JSON response
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

  // Function to render transactions

  async function renderTransactions() {
    const transactionsTableBody = document.getElementById("transactions-table-body");
    if (transactionsTableBody) {
      try {
        const transactions = await fetchTransactions(); // Fetch transactions from the backend

        // Check if there are no transactions; if none, display a message. Otherwise, populate the table with transaction data.
        if (transactions.length === 0) {
          transactionsTableBody.innerHTML = `<tr><td colspan="8">No transactions found</td></tr>`;
        } else {
          transactionsTableBody.innerHTML = transactions
            .map(
              (transaction) => `
              <tr>
                <td>${transaction.date}</td>
                <td class="${transaction.type.toLowerCase()}">${transaction.type}</td>
                <span class="arrow"></span>${transaction.type}
                <td>${transaction.asset}</td>
                <td>${transaction.quantity}</td>
                <td>${transaction.price.toFixed(2)}</td>
                <td>${transaction.totalValue.toFixed(2)}</td>
                <td>${transaction.fees.toFixed(2)}</td>
                <td>${transaction.portfolio}</td>
              </tr>
            `
            )
            .join("");
        }
      } catch (error) {
        transactionsTableBody.innerHTML = `<tr><td colspan="8">Failed to load transactions</td></tr>`;
      }
    }
  }


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

  function loadPage(page) {
    if (pageTemplates[page]) {
      mainContent.innerHTML = pageTemplates[page];
      updatePageTitle(page);


      if (page === "transactions") {
        renderTransactions();
      }
      
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
