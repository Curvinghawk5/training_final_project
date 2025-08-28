document.addEventListener('DOMContentLoaded', function() {
  // Theme Toggle Functionality
  const checkbox = document.getElementById("checkbox");
  if (checkbox) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      checkbox.checked = true;
    }
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  // Sidebar Toggle Functionality
  const dashboardApp = document.querySelector('.dashboard-app');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

  if (dashboardApp && sidebarToggleBtn) {
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed) {
      dashboardApp.classList.add('is-collapsed');
      sidebarToggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      sidebarToggleBtn.setAttribute('aria-expanded', 'true');
    }

    sidebarToggleBtn.addEventListener('click', function() {
      const nowCollapsed = dashboardApp.classList.toggle('is-collapsed');
      localStorage.setItem('sidebar-collapsed', String(nowCollapsed));
      sidebarToggleBtn.setAttribute('aria-expanded', nowCollapsed ? 'false' : 'true');
    });
  }
});
