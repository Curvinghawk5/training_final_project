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
    updateThemeImages();

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
      }
      updateThemeImages();
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
              <label for="portfolio-name">Portfolio Name *</label>
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
                placeholder="Brief description of your portfolio strategy (optional)"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label for="portfolio-risk">Risk Profile</label>
              <select id="portfolio-risk" name="riskProfile">
                <option value="">Select risk level (optional)</option>
                <option value="Conservative">Conservative - Lower risk, stable returns</option>
                <option value="Moderate">Moderate - Balanced risk and growth</option>
                <option value="Aggressive">Aggressive - Higher risk, growth potential</option>
              </select>
            </div>

            <div class="form-group">
              <label for="portfolio-initial">Initial Cash Amount (Optional)</label>
              <input 
                type="number" 
                id="portfolio-initial" 
                name="initialCash" 
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <small class="form-help">Starting cash balance for this portfolio</small>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="cancel-portfolio-btn">Cancel</button>
              <button type="submit" class="btn-primary">Create Portfolio</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Portfolio Modal -->
      <div class="modal-overlay" id="edit-portfolio-modal-overlay" style="display: none;">
        <div class="modal" id="edit-portfolio-modal">
          <div class="modal-header">
            <h3>Edit Portfolio</h3>
            <button class="modal-close-btn" id="edit-modal-close-btn">&times;</button>
          </div>
          <form class="modal-form" id="edit-portfolio-form">
            <div class="form-group">
              <label for="edit-portfolio-name">Portfolio Name *</label>
              <input 
                type="text" 
                id="edit-portfolio-name" 
                name="name" 
                placeholder="e.g., Tech Growth Portfolio"
                required
              />
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  id="edit-portfolio-default" 
                  name="isDefault"
                />
                <span class="checkbox-text">Set as default portfolio</span>
              </label>
              <small class="form-help">New transactions will use this portfolio by default</small>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" id="cancel-edit-btn">Cancel</button>
              <button type="submit" class="btn-primary">Update Portfolio</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Portfolio Confirmation Modal -->
      <div class="modal-overlay" id="delete-modal-overlay" style="display: none;">
        <div class="modal" id="delete-modal">
          <div class="modal-header">
            <h3>Delete Portfolio</h3>
            <button class="modal-close-btn" id="delete-modal-close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="delete-warning">
              <div class="warning-icon"><img id="warning-icon-img" src="/images/warning-icon-light.png" alt="Warning"></div>
              <p>Are you sure you want to delete "<span id="delete-portfolio-name"></span>"?</p>
              <p class="warning-text">This action cannot be undone. The portfolio must be empty (no holdings) to be deleted.</p>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" id="cancel-delete-btn">Cancel</button>
            <button type="button" class="btn-danger" id="confirm-delete-btn">Delete Portfolio</button>
          </div>
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


  // State for portfolios data
  let portfoliosData = [];
  let portfoliosLoading = false;
  let portfoliosError = null;

  /*
    Update the page title greeting with the users first name
    @param {string} page - The page to update the title for
  */
  function updatePageTitle(page) {
    const firstName = getDisplayFirstName();
    greeting.textContent = firstName ? `Hello ${firstName}` : "Hello";
  }

  /*
    Updates theme-specific images based on current dark/light mode
  */
  function updateThemeImages() {
    const isDark = document.body.getAttribute("data-theme") === "dark";

    // Update delete modal warning icon
    const warningIcon = document.getElementById("warning-icon-img");
    if (warningIcon) {
      warningIcon.src = isDark ? "/images/warning-icon-dark.png" : "/images/warning-icon-light.png";
    }

    // Update empty portfolios bar chart state icon
    const barChartIcon = document.getElementById("bar-chart-icon-img");
    if (barChartIcon) {
      barChartIcon.src = isDark ? "/images/bar-chart-icon-dark.png" : "/images/bar-chart-icon-light.png";
    }
  }

  /*
    Fetches portfolios from the API and poulates them with data
    @return {Promise<Array>} - Array of populated portfolio objects
  */
  async function fetchPortfolios() {
    portfoliosLoading = true;
    portfoliosError = null;

    try {
      const response = await authenticatedFetch(`${API_BASE}/user/portfolio`);

      if (!response.ok) {
        throw new Error(`Failed to fetch portfolios: ${response.status}`);
      }

      const portfolios = await response.json();

      // Computed data for portfolios
      const enrichedPortfolios = await Promise.all(
        portfolios.map(async (portfolio) => {
          const holdingsCount = await getHoldingsCount(portfolio.uuid);
          const returnAmount = portfolio.value - portfolio.inputValue;
          const returnPercent = portfolio.inputValue > 0
            ? ((portfolio.value - portfolio.inputValue) / portfolio.inputValue) * 100
            : 0;

          return {
            id: portfolio.uuid,
            uuid: portfolio.uuid,
            name: portfolio.name,
            description: portfolio.description || "", // Not available in backend yet
            totalValue: portfolio.value || 0,
            invested: portfolio.inputValue || 0,
            returnAmount: returnAmount,
            returnPercent: returnPercent,
            riskProfile: portfolio.riskProfile || portfolio.risk_profile || "Moderate", // Not available in backend yet
            holdings: holdingsCount,
            lastUpdated: new Date().toISOString().split("T")[0], // Not available in backend yet
            isDefault: portfolio.is_default, // Not available in backend yet
            currency: portfolio.prefered_currency || portfolio.currency || "USD", // Not available in backend yet
            initialCash: portfolio.initialCash || portfolio.initial_cash || 0 // Not available in backend yet
          };
        })
      );

      // Populate portfolios data array which will be used to render the portfolios page
      portfoliosData = enrichedPortfolios;
      return enrichedPortfolios;
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      portfoliosError = error.message;
      throw error;
    } finally {
      portfoliosLoading = false;
    }
  }

  /*
    Gets the count of holdings for a specific portfolio
    @param {string} portfolioUuid - The unique identifier of the portfolio
    @return {Promise<number>} - The number of holdings in the portfolio
  */
  async function getHoldingsCount(portfolioUuid) {
    try {
      // Use the shares endpoint to get actual holdings count
      const response = await authenticatedFetch(`${API_BASE}/user/shares/${portfolioUuid}`);

      if (response.ok) {
        const shares = await response.json();
        return Array.isArray(shares) ? shares.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error getting holdings count:", error);
      return 0;
    }
  }

  /*
    Creates a new portfolio via the API endpoint - POST /user/portfolio
    @param {object} portfolioData - The data for the new portfolio
    @return {Promise<object>} - The created portfolio
  */
  async function createPortfolioAPI(portfolioData) {
    try {
      const response = await authenticatedFetch(`${API_BASE}/user/portfolio`, {
        method: "POST",
        body: JSON.stringify({
          name: portfolioData.name,
          isDefault: portfolioData.isDefault || false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create portfolio: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating portfolio:", error);
      throw error;
    }
  }

  /*
    Updates a portfolio via the API endpoint - PATCH /user/portfolio/update
    @param {string} portfolioUuid - The unique identifier of the portfolio
    @param {object} portfolioData - The data for the updated portfolio
    @return {Promise<object>} - The updated portfolio
  */
  async function updatePortfolioAPI(portfolioUuid, portfolioData) {
    try {
      const response = await authenticatedFetch(`${API_BASE}/user/portfolio/update`, {
        method: "PATCH",
        body: JSON.stringify({
          name: portfolioData.name,
          isDefault: portfolioData.isDefault || false,
          portfolio_uuid: portfolioUuid
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update portfolio: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating portfolio:", error);
      throw error;
    }
  }

  /*
    Deletes a portfolio via the API endpoint - DELETE /user/portfolio/:portfolio_uuid
    @param {string} portfolioUuid - The unique identifier of the portfolio
    @return {Promise<object>} - The deleted portfolio
  */
  async function deletePortfolioAPI(portfolioUuid) {
    try {
      const response = await authenticatedFetch(`${API_BASE}/user/portfolio/${portfolioUuid}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400 && errorData.message?.includes("not empty")) {
          throw new Error("Cannot delete portfolio with holdings. Please sell all stocks first.");
        }
        throw new Error(errorData.error || errorData.message || `Failed to delete portfolio: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      throw error;
    }
  }

  /*
    Renders the portfolios page with laoding, error, empty or populated portfolio cards
    @return {void} - Renders the portfolios page
  */  
  function renderPortfolios() {
    const portfoliosGrid = document.getElementById("portfolios-grid");
    if (!portfoliosGrid) return;

    // Show loading state if portfolios are still loading
    if (portfoliosLoading) {
      portfoliosGrid.innerHTML = `
        <div class="portfolios-loading">
          <div class="loading-skeleton">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
          </div>
          <p>Loading your portfolios...</p>
        </div>
      `;
      return;
    }

    // Show error state if there is an error loading the portfolios
    if (portfoliosError) {
      portfoliosGrid.innerHTML = `
        <div class="portfolios-error">
          <p>Error loading portfolios: ${portfoliosError}</p>
          <button onclick="loadPortfoliosData()" class="btn-secondary">Try Again</button>
        </div>
      `;
      return;
    }

    // Show empty state if there are no portfolios
    if (portfoliosData.length === 0) {
      portfoliosGrid.innerHTML = `
        <div class="portfolios-empty">
          <div class="bar-chart-icon"><img id="bar-chart-icon-img" src="/images/bar-chart-icon-light.png" alt="Empty"></div>
          <h3>No Portfolios Yet</h3>
          <p>Create your first investment portfolio to start tracking your investments</p>
          <button onclick="document.getElementById('add-portfolio-btn').click()" class="btn-primary">Create Your First Portfolio</button>
        </div>
      `;
      return;
    }

    // Render portfolios if there are portfolios
    portfoliosGrid.innerHTML = portfoliosData
      .map(
        (portfolio) => `
        <div class="portfolio-card" data-portfolio-id="${portfolio.id}">
          <div class="portfolio-card-header">
            <div class="portfolio-info">
              <h3 class="portfolio-name">${portfolio.name}</h3>
              <span class="portfolio-risk ${portfolio.riskProfile.toLowerCase()}">${portfolio.riskProfile
          }</span>
              ${portfolio.isDefault ? '<span class="default-badge">Default</span>' : ''}
            </div>
            <div class="portfolio-menu">
              <button class="portfolio-menu-btn">⋯</button>
            </div>
          </div>
          
          ${portfolio.description ? `
          <div class="portfolio-description">
            <p>${portfolio.description}</p>
          </div>
          ` : ''}
          
          <div class="portfolio-value">
            <div class="current-value">
              <span class="value-label">Total Value</span>
              <span class="value-amount">$${portfolio.totalValue.toLocaleString(
            "en-US",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}</span>
            </div>
            <div class="return-info">
              <span class="return-amount ${portfolio.returnPercent >= 0 ? "positive" : "negative"
          }">
                ${portfolio.returnPercent >= 0 ? "+" : ""
          }$${portfolio.returnAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
              </span>
              <span class="return-percent ${portfolio.returnPercent >= 0 ? "positive" : "negative"
          }">
                ${portfolio.returnPercent >= 0 ? "+" : ""
          }${portfolio.returnPercent.toFixed(2)}%
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
              <span class="stat-value">$${portfolio.invested.toLocaleString(
            "en-US",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}</span>
            </div>
          </div>
          
          <div class="portfolio-performance">
            <div class="performance-header">
              <span class="performance-label">All-time Return</span>
            </div>
            <div class="performance-chart">
              <div class="chart-placeholder">
                <div class="chart-line ${portfolio.returnPercent >= 0 ? "positive" : "negative"
          }"></div>
              </div>
              <span class="performance-value ${portfolio.returnPercent >= 0 ? "positive" : "negative"
          }">
                ${portfolio.returnPercent >= 0 ? "+" : ""}${portfolio.returnPercent.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div class="portfolio-actions">
            <button class="btn-view" onclick="redirectToHoldings('${portfolio.uuid}')">View</button>
            <button class="btn-edit" onclick="openEditModal('${portfolio.uuid}')">Edit</button>
            <button class="btn-delete" onclick="showDeleteConfirmation('${portfolio.uuid}', '${portfolio.name.replace(/'/g, "\\'")}')">Delete</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  /*
    Loads the portfolios data from the API and renders the portfolios page
    @return {void} - Loads the portfolios data from the API and renders the portfolios page
  */
  async function loadPortfoliosData() {
    try {
      await fetchPortfolios();
      renderPortfolios();
      updateThemeImages(); // Update theme images after rendering
    } catch (error) {
      console.error("Failed to load portfolios:", error);
      renderPortfolios();
      updateThemeImages(); // Update theme images after rendering error state
    }
  }

  /*
    Redirects to the holdings page by triggering the holdings nav item
    @param {string} portfolioUuid - The unique identifier of the portfolio
    @return {void} - Redirects to the holdings page
  */
  window.redirectToHoldings = function (portfolioUuid) {
    const holdingsNavItem = document.querySelector('.nav-item:nth-child(4)'); // Holdings is the 4th nav item
    if (holdingsNavItem) {
      holdingsNavItem.click();
    }
  }

  /*
    Opens the edit modal
    @param {string} portfolioUuid - The unique identifier of the portfolio
    @return {void} - Opens the edit modal
  */
  window.openEditModal = function (portfolioUuid) {
    const portfolio = portfoliosData.find(p => p.uuid === portfolioUuid);
    if (!portfolio) {
      console.error('Portfolio not found:', portfolioUuid);
      return;
    }

    const editModal = document.getElementById("edit-portfolio-modal-overlay");
    const editForm = document.getElementById("edit-portfolio-form");

    if (!editModal || !editForm) return;

    // Populate form with current portfolio data
    document.getElementById("edit-portfolio-name").value = portfolio.name || '';
    document.getElementById("edit-portfolio-default").checked = portfolio.isDefault || false;

    // Store the portfolio UUID for form submission
    editForm.dataset.portfolioUuid = portfolioUuid;

    // Show modal
    editModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

 /*
    Shows the delete modal
    @param {string} portfolioUuid - The unique identifier of the portfolio
    @param {string} portfolioName - The name of the portfolio
    @return {void} - Shows the delete modal
  */
  window.showDeleteConfirmation = function (portfolioUuid, portfolioName) {
    const deleteModal = document.getElementById("delete-modal-overlay");
    const portfolioNameSpan = document.getElementById("delete-portfolio-name");
    const confirmBtn = document.getElementById("confirm-delete-btn");

    if (!deleteModal || !portfolioNameSpan || !confirmBtn) return;

    portfolioNameSpan.textContent = portfolioName;
    confirmBtn.onclick = () => handleDeleteConfirmation(portfolioUuid, portfolioName);

    deleteModal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Update theme images when modal is shown
    updateThemeImages();
  }

  /*
    Handles the delete confirmation
    @param {string} portfolioUuid - The unique identifier of the portfolio
    @param {string} portfolioName - The name of the portfolio
    @return {void} - Handles the delete confirmation
  */
  async function handleDeleteConfirmation(portfolioUuid, portfolioName) {
    const confirmBtn = document.getElementById("confirm-delete-btn");
    const originalText = confirmBtn.textContent;

    try {
      // Update button state
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Deleting...";

      // Clear any existing error messages
      const existingError = document.querySelector("#delete-modal .form-error");
      if (existingError) existingError.remove();

      // Call delete API
      await deletePortfolioAPI(portfolioUuid);

      // Hide modal
      hideDeleteModal();

      // Refresh portfolios list
      await loadPortfoliosData();

    } catch (error) {
      console.error("Error deleting portfolio:", error);
      showDeleteError(error.message || "Failed to delete portfolio. Please try again.");

      // Reset button state
      confirmBtn.disabled = false;
      confirmBtn.textContent = originalText;
    }
  }

  /*
    Hides the delete modal by hiding the modal overlay and resetting the button state
    @return {void} - Hides the delete modal
  */
  function hideDeleteModal() {
    const deleteModal = document.getElementById("delete-modal-overlay");
    if (deleteModal) {
      deleteModal.style.display = "none";
      document.body.style.overflow = "auto";

      // Clear any error messages from the modal
      const errorMsg = deleteModal.querySelector(".form-error");
      if (errorMsg) errorMsg.remove();

      // Reset button state to allow for future deletions
      const confirmBtn = document.getElementById("confirm-delete-btn");
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Delete Portfolio";
      }
    }
  }

  /*
    Shows an error message in the delete modal
    @param {string} message - The message to show
    @return {void} - Shows an error message in the delete modal
  */
  function showDeleteError(message) {
    const deleteModal = document.getElementById("delete-modal");
    const existingError = deleteModal.querySelector(".form-error");
    if (existingError) existingError.remove();

    const errorDiv = document.createElement("div");
    errorDiv.className = "form-error";
    errorDiv.style.color = "#e74c3c";
    errorDiv.style.marginTop = "10px";
    errorDiv.style.fontSize = "14px";
    errorDiv.textContent = message;

    const actions = deleteModal.querySelector(".modal-actions");
    if (actions) {
      actions.parentNode.insertBefore(errorDiv, actions);
    }
  }

  /*
    Sets up the portfolio modal by adding event listeners to the modal and form
    @return {void} - Sets up the portfolio modal
  */
  function setupPortfolioModal() {
    const addPortfolioBtn = document.getElementById("add-portfolio-btn");
    const modalOverlay = document.getElementById("portfolio-modal-overlay");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const cancelBtn = document.getElementById("cancel-portfolio-btn");
    const portfolioForm = document.getElementById("portfolio-form");

    if (!addPortfolioBtn || !modalOverlay) return;

    // Show modal by displaying the modal overlay and setting the body overflow to hidden
    addPortfolioBtn.addEventListener("click", () => {
      modalOverlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

    /*
      Hides the portfolio modal by hiding the modal overlay and resetting the form and button state
      @return {void} - Hides the portfolio modal
    */
    function hideModal() {
      modalOverlay.style.display = "none";
      document.body.style.overflow = "auto";
      portfolioForm.reset();
      // Clear any error messages from the form
      const errorMsg = portfolioForm.querySelector(".form-error");
      if (errorMsg) errorMsg.remove();
      // Re-enable submit button to allow for future submissions
      const submitBtn = portfolioForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Portfolio";
      }
    }

    modalCloseBtn?.addEventListener("click", hideModal);
    cancelBtn?.addEventListener("click", hideModal);

    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        hideModal();
      }
    });

    // Handle form submission by creating a new portfolio via the API
    portfolioForm?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(portfolioForm);
      const portfolioData = {
        name: formData.get("name")?.trim(),
        description: formData.get("description")?.trim(),
        riskProfile: formData.get("riskProfile"),
        initialCash: parseFloat(formData.get("initialCash")) || 0,
        isDefault: portfoliosData.length === 0 // First portfolio is default
      };

      // Validate required fields
      if (!portfolioData.name) {
        showFormError(portfolioForm, "Portfolio name is required");
        return;
      }

      if (portfolioData.name.length < 2) {
        showFormError(portfolioForm, "Portfolio name must be at least 2 characters long");
        return;
      }

      if (portfolioData.name.length > 100) {
        showFormError(portfolioForm, "Portfolio name must be less than 100 characters");
        return;
      }

      if (portfolioData.description && portfolioData.description.length > 500) {
        showFormError(portfolioForm, "Description must be less than 500 characters");
        return;
      }

      const submitBtn = portfolioForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating...";
      }

      try {
        // Clear any previous error messages from the form
        const errorMsg = portfolioForm.querySelector(".form-error");
        if (errorMsg) errorMsg.remove();

        // Create portfolio via API and refresh portfolios list
        await createPortfolioAPI(portfolioData);
        await loadPortfoliosData();
        hideModal();
      } catch (error) {
        console.error("Error creating portfolio:", error);
        showFormError(portfolioForm, error.message || "Failed to create portfolio. Please try again.");

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Create Portfolio";
        }
      }
    });
  }

  /*
    Sets up the edit modal by adding event listeners to the modal and form
    @return {void} - Sets up the edit modal
  */
  function setupEditModal() {
    const editModalOverlay = document.getElementById("edit-portfolio-modal-overlay");
    const editModalCloseBtn = document.getElementById("edit-modal-close-btn");
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    const editForm = document.getElementById("edit-portfolio-form");

    if (!editModalOverlay || !editForm) return;

    /*
      Hides the edit modal by hiding the modal overlay and resetting the form and button state
      @return {void} - Hides the edit modal
    */
    function hideEditModal() {
      editModalOverlay.style.display = "none";
      document.body.style.overflow = "auto";
      editForm.reset();
      delete editForm.dataset.portfolioUuid;
      // Clear any error messages from the form
      const errorMsg = editForm.querySelector(".form-error");
      if (errorMsg) errorMsg.remove();
      // Re-enable submit button to allow for future submissions
      const submitBtn = editForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Portfolio";
      }
    }

    // Close modal handlers
    editModalCloseBtn?.addEventListener("click", hideEditModal);
    cancelEditBtn?.addEventListener("click", hideEditModal);

    editModalOverlay.addEventListener("click", (e) => {
      if (e.target === editModalOverlay) {
        hideEditModal();
      }
    });

    // Handle form submission
    editForm?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const portfolioUuid = editForm.dataset.portfolioUuid;
      if (!portfolioUuid) {
        console.error("No portfolio UUID found");
        return;
      }

      const formData = new FormData(editForm);
      const portfolioData = {
        name: formData.get("name")?.trim(),
        isDefault: formData.get("isDefault") === "on"
      };

      // Validate required fields
      if (!portfolioData.name) {
        showFormError(editForm, "Portfolio name is required");
        return;
      }

      if (portfolioData.name.length < 2) {
        showFormError(editForm, "Portfolio name must be at least 2 characters long");
        return;
      }

      if (portfolioData.name.length > 100) {
        showFormError(editForm, "Portfolio name must be less than 100 characters");
        return;
      }



      const submitBtn = editForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Updating...";
      }

      try {
        // Clear any previous error messages
        const errorMsg = editForm.querySelector(".form-error");
        if (errorMsg) errorMsg.remove();

        // Update portfolio via API
        await updatePortfolioAPI(portfolioUuid, portfolioData);

        // Refresh portfolios list
        await loadPortfoliosData();

        hideEditModal();
      } catch (error) {
        console.error("Error updating portfolio:", error);
        showFormError(editForm, error.message || "Failed to update portfolio. Please try again.");

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Update Portfolio";
        }
      }
    });
  }

  /*
    Sets up the delete modal by adding event listeners to the modal and form
    @return {void} - Sets up the delete modal
  */
  function setupDeleteModal() {
    const deleteModalOverlay = document.getElementById("delete-modal-overlay");
    const deleteModalCloseBtn = document.getElementById("delete-modal-close-btn");
    const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

    if (!deleteModalOverlay) return;

    // Close modal handlers by hiding the modal overlay and resetting the button state
    deleteModalCloseBtn?.addEventListener("click", hideDeleteModal);
    cancelDeleteBtn?.addEventListener("click", hideDeleteModal);

    deleteModalOverlay.addEventListener("click", (e) => {
      if (e.target === deleteModalOverlay) {
        hideDeleteModal();
      }
    });
  }

  /*
    Shows an error message in the form
    @param {object} form - The form to show the error message in
    @param {string} message - The message to show
    @return {void} - Shows an error message in the form
  */
  function showFormError(form, message) {
    // Remove any existing error message from the form
    const existingError = form.querySelector(".form-error");
    if (existingError) existingError.remove();

    // Create and insert error message into the form
    const errorDiv = document.createElement("div");
    errorDiv.className = "form-error";
    errorDiv.style.color = "#e74c3c";
    errorDiv.style.marginTop = "10px";
    errorDiv.style.fontSize = "14px";
    errorDiv.textContent = message;

    const actions = form.querySelector(".modal-actions");
    if (actions) {
      actions.parentNode.insertBefore(errorDiv, actions);
    }
  }

  /*
    Loads and displays a specific page content
    @param {string} page - The page to load
    @return {void} - Loads the page
  */
  function loadPage(page) {
    if (pageTemplates[page]) {
      mainContent.innerHTML = pageTemplates[page];
      updatePageTitle(page);

      // If stocks page, set up search functionality
      if (page === "stocks") {
        // Get elements AFTER the page HTML is loaded
        const resultsContainer = document.getElementById("stocks-results");
        const tableBody = document.getElementById("stocks-table-body");
        const resultsCount = document.getElementById("results-count");
        const searchInput = document.getElementById("stock-search-input");
        const searchBtn = document.getElementById("stock-search-btn");

        // Updated renderStockResults function with proper element access
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
            resultsCount.textContent = `${filteredData.length} result${filteredData.length !== 1 ? "s" : ""
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
                <td class="stock-change ${stock.change >= 0 ? "positive" : "negative"
                  }">
                  ${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}
                </td>
                <td class="stock-percent ${stock.changePercent >= 0 ? "positive" : "negative"
                  }">
                  ${stock.changePercent >= 0 ? "+" : ""
                  }${stock.changePercent.toFixed(2)}%
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
        setupPortfolioModal();
        setupEditModal();
        setupDeleteModal();
        loadPortfoliosData(); // Load portfolios from API
        // Update theme images after a short delay to ensure DOM is ready
        setTimeout(updateThemeImages, 100);
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

  /*
    Shows a specific view - login, register, dashboard
    @param {string} view - The view to show
    @return {void} - Shows the view
  */
  function showView(view) {
    if (loginSection)
      loginSection.style.display = view === "login" ? "block" : "none";
    if (registerSection)
      registerSection.style.display = view === "register" ? "block" : "none";
    if (dashboardSection)
      dashboardSection.style.display = view === "dashboard" ? "block" : "none";

    if (view === "login" || view === "register") {
      document.body.classList.add("auth-page");
    } else {
      document.body.classList.remove("auth-page");
    }
  }

  const API_BASE =
    location.port === "5500" || location.port === "5173"
      ? "http://localhost:3000"
      : "";

  // Authentication
  const AUTH_TOKEN_KEY = "auth_token";
  const USER_DATA_KEY = "user_data";

  /*
    Checks if the user is authenticated
    @return {boolean} - True if the user is authenticated, false otherwise
  */
  function isAuthenticated() {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /*
    Stores authentication data
    @param {string} token - The authentication token
    @param {object} userData - The user data
    @return {void} - Stores the authentication data
  */
  function storeAuthData(token, userData = null) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    if (userData) {
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  }

  /*
    Clears all authentication data from session storage
    @return {void} - Clears the authentication data
  */
  function clearAuthData() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
  }

  /*
    Gets stored user data from session storage
    @return {object} - The user data object or null if no user data is found
  */
  function getUserData() {
    const userData = sessionStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /*
    Capitalises the first letter of a word
    @param {string} str - The word to capitalise
    @return {string} - The capitalised word
  */
  function capitalizeWord(str) {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /*
    Formats a full name by capitalising the first letter of the first and last name
    @param {string} firstName - The first name
    @param {string} lastName - The last name
    @return {string} - The formatted full name
  */
  function formatFullName(firstName, lastName) {
    const parts = [];
    if (firstName) parts.push(capitalizeWord(firstName));
    if (lastName) parts.push(capitalizeWord(lastName));
    return parts.join(" ");
  }

  /*
    Gets the display first name from the user data - fname, username or empty string if no user data is found
    @return {string} - The display first name
  */
  function getDisplayFirstName() {
    const userData = getUserData();
    if (!userData) return "";
    const first =
      userData.fname ||
      userData.username ||
      "";
    return capitalizeWord(first);
  }

  /*
    Gets the authentication token for API requests from session storage
    @return {string} - The authentication token
  */
  function getAuthToken() {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  }

  /*
    Makes an authenticated API request with the authentication token from session storage
    @param {string} url - The URL to make the request to
    @param {object} options - The options for the request
    @return {Promise<Response>} - The response from the API
  */
  async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    return fetch(url, { ...options, headers });
  }

  /*
    Updates the user display in the dashboard
    @return {void} - Updates the user display
  */
  function updateUserDisplay() {
    const userData = getUserData();
    if (userData) {
      const greeting = document.querySelector(".greeting");
      if (greeting) {
        const firstName = getDisplayFirstName();
        greeting.textContent = firstName ? `Hello ${firstName}` : "Hello";
      }

      // Update profile name
      const profileName = document.querySelector(".profile-name");
      if (profileName) {
        const firstName =
          userData.firstName || userData.fName || userData.fname;
        const lastName = userData.lastName || userData.lName || userData.lname;
        const hasAnyName = Boolean(firstName) || Boolean(lastName);
        const fullName = hasAnyName
          ? formatFullName(firstName, lastName)
          : capitalizeWord(userData.username);
        profileName.textContent = fullName;
      }

      // Update avatar initial
      const avatar = document.querySelector(".avatar");
      if (avatar) {
        const firstName =
          userData.firstName || userData.fName || userData.fname;
        const initial = firstName
          ? firstName.charAt(0).toUpperCase()
          : userData.username.charAt(0).toUpperCase();
        avatar.textContent = initial;
      }
    }
  }

  /*
    Checks the authentication status on page load and periodically
    @return {void} - Checks the authentication status
  */
  function checkAuthStatus() {
    if (!isAuthenticated()) {
      clearAuthData();
      if (
        document.getElementById("dashboard-section").style.display !== "none"
      ) {
        showView("login");
      }
    }
  }

  // Check authentication status every 5 minutes
  setInterval(checkAuthStatus, 5 * 60 * 1000);

  const isAuthed = isAuthenticated();
  showView(isAuthed ? "dashboard" : "login");
  if (isAuthed) {
    loadPage("dashboard");
  }

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
        username: loginForm.username.value.trim(),
        password: loginForm.password.value,
      };

      if (!data.username || !data.password) {
        loginErrorEl.textContent = "Please enter username and password.";
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

        if (payload.token) {
          // Store user data for display
          const userData = { username: data.username };
          storeAuthData(payload.token, userData);
          showView("dashboard");
          loadPage("dashboard");
          updateUserDisplay();
        } else {
          throw new Error("No token received");
        }
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

      // Collect form data
      const firstName = registerForm.firstName.value.trim();
      const lastName = registerForm.lastName.value.trim();
      const username = registerForm.username.value.trim();
      const password = registerForm.password.value;
      const confirmPassword = registerForm.confirmPassword.value;

      // Validation
      if (
        !firstName ||
        !lastName ||
        !username ||
        !password ||
        !confirmPassword
      ) {
        registerErrorEl.textContent = "All fields are required.";
        registerErrorEl.hidden = false;
        return;
      }
      if (password.length < 6) {
        registerErrorEl.textContent = "Password must be at least 6 characters.";
        registerErrorEl.hidden = false;
        return;
      }
      if (password !== confirmPassword) {
        registerErrorEl.textContent = "Passwords do not match.";
        registerErrorEl.hidden = false;
        return;
      }

      const data = {
        username: username,
        password: password,
        fname: firstName,
        lname: lastName,
      };

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
            payload.error || payload.message || "Registration failed"
          );

        // After successful registration, automatically log in
        const loginData = { username: username, password: password };
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        });
        const loginPayload = await loginRes.json().catch(() => ({}));

        if (loginRes.ok && loginPayload.token) {
          // Store user data including firstName/lastName for future use
          const userData = {
            username: username,
            firstName: firstName,
            lastName: lastName,
          };
          storeAuthData(loginPayload.token, userData);
          showView("dashboard");
          loadPage("dashboard");
          updateUserDisplay();
        } else {
          // Registration successful but auto-login failed, redirect to login
          showView("login");
        }
      } catch (err) {
        registerErrorEl.textContent = err.message || "Registration failed";
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
      clearAuthData();
      showView("login");
    });
  }

  // Initial setup
  if (isAuthed) {
    updateUserDisplay();
  }
});
