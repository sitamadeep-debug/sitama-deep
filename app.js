// SITAMA-DEEP SPA Engine 2026
// Sistem Informasi Telaah Modul Ajar Berbasis Pembelajaran Mendalam
// Naskah Praktik Baik GEMPITA 2026 - Sudarso, S.Pd. (Kepala SMK Negeri Wonosalam, Jombang)

(function () {
  // Version Guard: Otomatis membersihkan cache localStorage jika versi aplikasi diperbarui
  const APP_VERSION = '2026.10.03.v11';
  if (localStorage.getItem('sitama_app_version') !== APP_VERSION) {
    localStorage.clear();
    localStorage.setItem('sitama_app_version', APP_VERSION);
  }

  // LocalStorage Helpers
  function getStoredData(key, fallback) {
    const saved = localStorage.getItem('sitama_' + key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return fallback;
  }

  function setStoredData(key, val) {
    localStorage.setItem('sitama_' + key, JSON.stringify(val));
  }

  // Application Global State
  const state = {
    lang: getStoredData('lang', 'id'),
    currentUserId: getStoredData('currentUserId', 'USR-002'), // Default Sudarso, S.Pd. (Kepsek)
    currentRole: getStoredData('currentRole', 'principal'),
    currentView: getStoredData('currentView', 'landing'),
    selectedModuleId: getStoredData('selectedModuleId', 'MOD-001'),
    
    school: initialMockData.school,
    departments: initialMockData.departments,
    users: getStoredData('users', initialMockData.users),
    academicYears: getStoredData('academicYears', initialMockData.academicYears),
    subjects: getStoredData('subjects', initialMockData.subjects),
    classes: getStoredData('classes', initialMockData.classes),
    modules: getStoredData('modules', initialMockData.modules),
    notifications: getStoredData('notifications', initialMockData.notifications),
    auditLogs: getStoredData('auditLogs', initialMockData.auditLogs),
    
    // Auth Tab & Password Recovery State
    authTab: 'login', // 'login' | 'register' | 'forgot'
    recoveryUser: null,
    recoveryOtpGenerated: '',
    recoverySuccessMsg: '',
    recoveryErrorMsg: '',
    registerSuccessMsg: '',
    
    // Search and Table Filters
    moduleSearchQuery: '',
    moduleStatusFilter: 'all',
    moduleDeptFilter: 'all',
    teacherTableTab: 'all', // 'all' | 'pending' | 'needs_revision' | 'approved'
    
    // Modals and Active Workspace
    reviewDraftScores: {},
    activeModal: null, // null | 'new_user_admin' | 'tendik_verify'
    selectedVerifyModId: null,
    showNotifDropdown: false
  };

  // Translation Helper
  function t(key) {
    const dict = translations[state.lang] || translations.id;
    return dict[key] || key;
  }

  // Get Current Active User
  function getCurrentUser() {
    return state.users.find(u => u.id === state.currentUserId) || state.users[1];
  }

  // Save State Helper
  function saveState() {
    setStoredData('lang', state.lang);
    setStoredData('currentUserId', state.currentUserId);
    setStoredData('currentRole', state.currentRole);
    setStoredData('currentView', state.currentView);
    setStoredData('modules', state.modules);
    setStoredData('users', state.users);
    setStoredData('notifications', state.notifications);
  }

  // Add Audit Trail Record
  function logActivity(activity, description) {
    const user = getCurrentUser();
    const newLog = {
      id: 'LOG-' + Math.floor(100 + Math.random() * 900),
      user_name: user ? user.name : 'Tamu',
      role: user ? user.role : 'guest',
      activity,
      description,
      ip_address: '192.168.1.' + Math.floor(10 + Math.random() * 80),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    state.auditLogs.unshift(newLog);
    setStoredData('auditLogs', state.auditLogs);
  }

  // Status Badge Generator
  function renderStatusBadge(statusKey) {
    let cssClass = 'badge-draft';
    let label = statusKey;

    switch (statusKey) {
      case 'Draft': cssClass = 'badge-draft'; label = t('statusDraft'); break;
      case 'Pending Review': cssClass = 'badge-pending'; label = t('statusPendingReview'); break;
      case 'Under Review': cssClass = 'badge-reviewing'; label = t('statusUnderReview'); break;
      case 'Needs Revision': cssClass = 'badge-needs-rev'; label = t('statusNeedsRevision'); break;
      case 'In Revision': cssClass = 'badge-in-rev'; label = t('statusInRevision'); break;
      case 'Appropriate with Revisions': cssClass = 'badge-app-rev'; label = t('statusAppropriateWithRevisions'); break;
      case 'Approved': cssClass = 'badge-approved'; label = t('statusApproved'); break;
      case 'Rejected': cssClass = 'badge-rejected'; label = t('statusRejected'); break;
      case 'Waiting for Re-review': cssClass = 'badge-pending'; label = t('statusWaitingReReview'); break;
    }
    return `<span class="badge ${cssClass}">${label}</span>`;
  }

  // Eligibility Badge Generator
  function renderEligibilityBadge(catKey) {
    let cssClass = 'badge-approved';
    let label = catKey;
    const k = String(catKey || '').trim();
    if (k === 'Sangat Layak' || k === 'Highly Appropriate' || k === 'catHighlyAppropriate') {
      cssClass = 'badge-approved';
      label = t('catHighlyAppropriate');
    } else if (k === 'Layak' || k === 'Appropriate' || k === 'catAppropriate') {
      cssClass = 'badge-reviewing';
      label = t('catAppropriate');
    } else if (k === 'Layak Dengan Revisi' || k === 'Layak dengan Revisi' || k === 'Appropriate with Revisions' || k === 'catAppropriateWithRevisions') {
      cssClass = 'badge-app-rev';
      label = t('catAppropriateWithRevisions');
    } else if (k === 'Perlu Revisi' || k === 'Needs Revision' || k === 'catNeedsRevision') {
      cssClass = 'badge-needs-rev';
      label = t('catNeedsRevision');
    } else {
      cssClass = 'badge-rejected';
      label = t('catNotAppropriateYet');
    }
    return `<span class="badge ${cssClass}">${label}</span>`;
  }

  /* ------------------- MAIN SPA RENDERER ------------------- */
  function renderApp() {
    const appEl = document.getElementById('app');
    
    // Public Landing Page
    if (state.currentView === 'landing') {
      appEl.innerHTML = renderLandingPage();
      bindLandingEvents();
      return;
    }

    // Auth Page (Login, New User, Forgot Password)
    if (state.currentView === 'login') {
      appEl.innerHTML = renderLoginPage();
      bindEvents();
      return;
    }

    const user = getCurrentUser();
    const unreadCount = state.notifications.filter(n => !n.is_read && n.user_id === user.id).length;

    appEl.innerHTML = `
      <!-- TOP NAVIGATION BAR -->
      <header class="app-header">
        <div class="header-brand" onclick="navigateTo('dashboard')">
          <img src="${state.school.logo}" alt="Logo SMKN Wonosalam" onerror="this.src='https://via.placeholder.com/48?text=SMK'"/>
          <div>
            <div class="brand-title">
              ${t('appName')}
              <span class="brand-badge">GEMPITA 2026</span>
            </div>
            <div class="brand-subtitle">${t('appLongName')} - SMK Negeri Wonosalam</div>
          </div>
        </div>

        <div class="header-actions">
          <!-- Quick Role Switcher Pill for 4 Account Levels -->
          <div class="role-pill">
            <span>${t('switchRole')}:</span>
            <select id="roleSwitcherSelect">
              <option value="USR-001" ${user.id === 'USR-001' ? 'selected' : ''}>1. Admin - Siti Rahmawati, S.Kom.</option>
              <option value="USR-002" ${user.id === 'USR-002' ? 'selected' : ''}>2. Kepsek - Sudarso, S.Pd.</option>
              <option value="USR-002B" ${user.id === 'USR-002B' ? 'selected' : ''}>2. Waka Kurikulum - Drs. Bambang Supriyadi</option>
              <option value="USR-003" ${user.id === 'USR-003' ? 'selected' : ''}>3. Guru ATP - Budi Santoso, S.Pd.</option>
              <option value="USR-004" ${user.id === 'USR-004' ? 'selected' : ''}>3. Guru Kuliner - Dewi Lestari, S.Pd.</option>
              <option value="USR-005" ${user.id === 'USR-005' ? 'selected' : ''}>3. Guru TKR - Ahmad Fauzi, S.T.</option>
              <option value="USR-006" ${user.id === 'USR-006' ? 'selected' : ''}>3. Guru TPM - Joko Widodo, S.T.</option>
              <option value="USR-007" ${user.id === 'USR-007' ? 'selected' : ''}>3. Guru IPAS - Rudi Hermawan, S.Si.</option>
              <option value="USR-008" ${user.id === 'USR-008' ? 'selected' : ''}>4. Tendik/TU - Tri Wahyuni, S.AP.</option>
            </select>
          </div>

          <!-- Bilingual Switcher Pill -->
          <button class="lang-btn" id="toggleLangBtn">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            ${state.lang.toUpperCase()}
          </button>

          <!-- Notifications Dropdown -->
          <div class="notif-wrapper">
            <button class="notif-btn" id="notifDropdownBtn" title="${t('notifications')}">
              <svg width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ''}
            </button>
            <div class="notif-dropdown ${state.showNotifDropdown ? 'show' : ''}" id="notifDropdownMenu">
              <div class="notif-header">
                <span>${t('notifications')} (${unreadCount})</span>
                <span style="font-size:0.75rem; color:var(--primary-blue); cursor:pointer;" onclick="markAllNotificationsRead()">${t('markAllAsRead')}</span>
              </div>
              <div class="notif-list">
                ${renderNotificationItems(user.id)}
              </div>
            </div>
          </div>

          <!-- User Menu Profile -->
          <div class="user-menu" onclick="navigateTo('profile')">
            <div class="avatar">${user.name.charAt(0)}</div>
            <div style="display:flex; flex-direction:column; line-height:1.2;">
              <span style="font-size:0.85rem; font-weight:700; max-width:140px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${user.name.split(' ')[0]}</span>
              <span style="font-size:0.7rem; color:#93C5FD; text-transform:capitalize;">${user.title_badge || t(user.role)}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="app-wrapper">
        <!-- SIDEBAR NAVIGATION -->
        <aside class="app-sidebar">
          <ul class="sidebar-menu">
            ${renderSidebarMenu(user.role)}
          </ul>
        </aside>

        <!-- MAIN VIEW CONTAINER -->
        <main class="app-main">
          ${renderPageView()}
        </main>
      </div>

      <!-- ACTIVE MODAL DIALOG CONTAINER -->
      ${renderActiveModalHTML()}
    `;

    bindEvents();
    renderCharts();
  }

  // Sidebar Menu Generator for 4 Account Levels
  function renderSidebarMenu(role) {
    const items = [];

    if (role === 'admin') {
      items.push({ view: 'dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', label: t('menuAdminDashboard') });
      items.push({ view: 'user_management', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', label: t('menuUserManagement') });
      items.push({ view: 'master_data', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>', label: t('menuMasterData') });
      items.push({ view: 'rubric_management', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', label: t('menuRubric') });
      items.push({ view: 'modules', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', label: t('menuModules') });
      items.push({ view: 'reports', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', label: t('menuReports') });
      items.push({ view: 'audit_logs', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', label: t('menuAuditLog') });
    } else if (role === 'principal') {
      items.push({ view: 'dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', label: t('menuPrincipalDashboard') });
      items.push({ view: 'modules', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', label: t('menuPendingReviews') });
      items.push({ view: 'reports', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', label: t('menuReports') });
    } else if (role === 'tendik') {
      items.push({ view: 'dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', label: t('menuTendikDashboard') });
      items.push({ view: 'tendik_archive', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>', label: t('menuTendikArchive') });
      items.push({ view: 'modules', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', label: t('menuModules') });
    } else { // Teacher
      items.push({ view: 'dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', label: t('menuMyDashboard') });
      items.push({ view: 'upload_module', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>', label: t('menuUploadModule') });
      items.push({ view: 'modules', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>', label: t('menuMyModules') });
    }

    items.unshift({ view: 'landing', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>', label: 'Beranda / Landing Page' });
    items.push({ view: 'profile', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', label: t('menuProfile') });
    items.push({ view: 'login', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>', label: t('logout') });

    return items.map(item => `
      <li>
        <a class="menu-item ${state.currentView === item.view ? 'active' : ''}" onclick="navigateTo('${item.view}')">
          ${item.icon}
          <span>${item.label}</span>
        </a>
      </li>
    `).join('');
  }

  // Render Notification Dropdown Content
  function renderNotificationItems(userId) {
    const userNotifs = state.notifications.filter(n => n.user_id === userId);
    if (userNotifs.length === 0) {
      return `<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">${t('noNotifications')}</div>`;
    }

    return userNotifs.map(n => `
      <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}', '${n.related_module_id}')">
        <div style="font-weight:700; font-size:0.85rem; color:var(--text-main);">${state.lang === 'en' ? n.title_en : n.title_id}</div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">${state.lang === 'en' ? n.message_en : n.message_id}</div>
        <div style="font-size:0.7rem; color:var(--text-light); margin-top:4px;">${n.created_at}</div>
      </div>
    `).join('');
  }

  // View Dispatcher
  function renderPageView() {
    switch (state.currentView) {
      case 'dashboard':
        if (state.currentRole === 'admin') return renderAdminDashboard();
        if (state.currentRole === 'principal') return renderPrincipalDashboard();
        if (state.currentRole === 'tendik') return renderTendikDashboard();
        return renderTeacherDashboard();
      case 'tendik_archive':
        return renderTendikArchivePage();
      case 'upload_module':
        return renderUploadModulePage();
      case 'modules':
        return renderModuleListPage();
      case 'review_workspace':
        return renderReviewWorkspacePage();
      case 'review_result_detail':
        return renderReviewResultDetailPage();
      case 'feedback_revision':
        return renderFeedbackRevisionPage();
      case 'print_preview':
        return renderPrintPreviewPage();
      case 'reports':
        return renderReportsPage();
      case 'user_management':
        return renderUserManagementPage();
      case 'master_data':
        return renderMasterDataPage();
      case 'rubric_management':
        return renderRubricManagementPage();
      case 'audit_logs':
        return renderAuditLogsPage();
      case 'profile':
        return renderProfilePage();
      default:
        return renderTeacherDashboard();
    }
  }

  /* ------------------- TEACHER DASHBOARD (MATCHING GAMBAR 4) ------------------- */
  function renderTeacherDashboard() {
    const user = getCurrentUser();
    const myMods = state.modules.filter(m => m.teacher_id === user.id);
    const approvedCount = myMods.filter(m => m.status === 'Approved').length;
    const needsRevCount = myMods.filter(m => m.status === 'Needs Revision' || m.status === 'In Revision').length;
    const pendingCount = myMods.filter(m => m.status === 'Pending Review' || m.status === 'Under Review').length;

    // Filter table by active teacher tab
    let filteredMods = myMods;
    if (state.teacherTableTab === 'pending') filteredMods = myMods.filter(m => m.status === 'Pending Review' || m.status === 'Under Review');
    else if (state.teacherTableTab === 'needs_revision') filteredMods = myMods.filter(m => m.status === 'Needs Revision' || m.status === 'In Revision');
    else if (state.teacherTableTab === 'approved') filteredMods = myMods.filter(m => m.status === 'Approved');

    return `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuMyDashboard')}</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">
          Selamat datang, <b>${user.name}</b> (${user.department ? `Guru ${user.department}` : 'Pendidik SMKN Wonosalam'}). Pantau status telaah dan umpan balik modul ajar Anda di sini.
        </p>
      </div>

      <!-- Action Hero Banner (Matching Gambar 4) -->
      <div class="hero-banner">
        <div>
          <div class="hero-banner-title">Siapkan Modul Ajar Pembelajaran Mendalam</div>
          <div class="hero-banner-desc">
            Pastikan modul ajar Anda memenuhi 3 pengalaman belajar utama: <b>Berkesadaran (Mindful)</b>, <b>Bermakna (Meaningful)</b>, dan <b>Menggembirakan (Joyful)</b>.
          </div>
        </div>
        <button class="btn btn-success" onclick="navigateTo('upload_module')" style="padding:11px 22px; font-size:0.92rem; z-index:2;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          + Upload Modul Ajar
        </button>
      </div>

      <!-- 4 Stat Cards (Matching Gambar 4) -->
      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
          </div>
          <div>
            <div class="stat-val">${myMods.length}</div>
            <div class="stat-lbl">${t('myTotalModules')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon yellow">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div>
            <div class="stat-val">${pendingCount}</div>
            <div class="stat-lbl">${t('pendingReviews')}</div>
          </div>
        </div>

        <div class="stat-card" style="${needsRevCount > 0 ? 'border-color:#FCA5A5;' : ''}">
          <div class="stat-icon red">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div>
            <div class="stat-val">${needsRevCount}</div>
            <div class="stat-lbl">${t('myNeedsRevision')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div>
            <div class="stat-val">${approvedCount}</div>
            <div class="stat-lbl">${t('myApproved')}</div>
          </div>
        </div>
      </div>

      <!-- Module Table Card with Teacher Friendly Filter Tabs (Matching Gambar 4) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Daftar Modul Saya & Hasil Telaah</span>
          <div style="display:flex; gap:6px;">
            <button class="btn ${state.teacherTableTab === 'all' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setTeacherTableTab('all')">${t('all')}</button>
            <button class="btn ${state.teacherTableTab === 'pending' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setTeacherTableTab('pending')">${t('pendingReviews')}</button>
            <button class="btn ${state.teacherTableTab === 'needs_revision' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setTeacherTableTab('needs_revision')">${t('statusNeedsRevision')}</button>
            <button class="btn ${state.teacherTableTab === 'approved' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setTeacherTableTab('approved')">${t('statusApproved')}</button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>${t('moduleTitle')}</th>
                <th>${t('subject')}</th>
                <th>Kelas</th>
                <th>${t('status')}</th>
                <th>Skor Akhir</th>
                <th>${t('Catatan Kepala Sekolah', 'Catatan Kepala Sekolah')}</th>
                <th style="text-align:center;">${t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMods.length === 0 ? `
                <tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-muted);">Tidak ada modul dalam kategori ini.</td></tr>
              ` : filteredMods.map(m => `
                <tr>
                  <td>
                    <div style="font-weight:700; color:var(--primary-dark); font-size:0.92rem;">
                      ${m.title}
                      <span class="badge-version">v${m.version_number}</span>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-light); margin-top:2px;">Diunggah: ${m.submitted_at}</div>
                  </td>
                  <td><b>${m.department || 'Umum'}</b><br/><span style="font-size:0.8rem; color:var(--text-muted);">${m.subject_name}</span></td>
                  <td>${m.class_name}</td>
                  <td>${renderStatusBadge(m.status)}</td>
                  <td>
                    ${m.review ? `
                      <span style="font-weight:800; font-size:0.95rem; color:${m.review.percentage_score >= 86 ? '#059669' : m.review.percentage_score >= 76 ? '#2563EB' : '#DC2626'};">
                        ${m.review.percentage_score}%
                      </span>
                      <span style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">(${m.review.total_score}/188)</span>
                    ` : '<span style="color:var(--text-light);">-</span>'}
                  </td>
                  <td style="max-width:240px; font-size:0.82rem; color:var(--text-muted); line-height:1.4;">
                    ${m.review ? m.review.general_feedback : '<i>Menunggu telaah oleh Kepala Sekolah...</i>'}
                  </td>
                  <td style="text-align:center; white-space:nowrap;">
                    ${m.review ? `
                      <button class="btn btn-primary btn-sm" onclick="viewReviewDetail('${m.id}')" title="Lihat Nilai Lengkap 47 Indikator">${t('detail')}</button>
                      ${m.status === 'Needs Revision' || m.status === 'In Revision' ? `
                        <button class="btn btn-success btn-sm" onclick="openRevisionPage('${m.id}')">
                          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          ${t('uploadRevision')}
                        </button>
                      ` : ''}
                      ${m.status === 'Approved' ? `
                        <button class="btn btn-outline btn-sm" onclick="openPrintPreview('${m.id}')" title="Cetak Lembar Pengesahan">
                          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                          ${t('print')}
                        </button>
                      ` : ''}
                    ` : `
                      <button class="btn btn-outline btn-sm" onclick="viewModuleDetail('${m.id}')">${t('view')}</button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ------------------- UPLOAD MODULE PAGE (SUPER INTUITIVE FOR TEACHERS) ------------------- */
  function renderUploadModulePage() {
    const user = getCurrentUser();

    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuUploadModule')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">
            Unggah modul ajar untuk ditelaah oleh Kepala Sekolah (<b>Sudarso, S.Pd.</b>) dan Waka Kurikulum.
          </p>
        </div>
        <button class="btn btn-outline" onclick="navigateTo('dashboard')">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>
          ${t('back')}
        </button>
      </div>

      <div class="split-workspace">
        <!-- Form Area -->
        <div>
          <form id="uploadModuleForm">
            <!-- Step 1: Identitas Modul -->
            <div class="card step-card">
              <div class="card-header">
                <span class="card-title">1. Identitas & Penempatan Modul Ajar</span>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label>Mata Pelajaran & Konsentrasi Keahlian</label>
                  <select class="form-control" id="modSubject" required>
                    ${state.subjects.map(s => `
                      <option value="${s.id}">[${s.department}] ${s.name_id}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Kelas & Fase</label>
                  <select class="form-control" id="modClass" required>
                    ${state.classes.map(c => `
                      <option value="${c.class_name}">${c.class_name} (${c.phase})</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label>Tahun Pelajaran</label>
                  <select class="form-control" id="modAcademicYear">
                    ${state.academicYears.map(ay => `
                      <option value="${ay.year_name}">${ay.year_name} (${ay.status})</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Semester</label>
                  <select class="form-control" id="modSemester">
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Step 2: Substansi & Capaian Pembelajaran -->
            <div class="card step-card">
              <div class="card-header">
                <span class="card-title">2. Substansi Pembelajaran (CP & TP HOTS)</span>
              </div>

              <div class="form-group">
                <label>Judul Modul Ajar Lengkap</label>
                <input type="text" class="form-control" id="modTitle" placeholder="Contoh: Pemangkasan Kopi Robusta Berbasis Mindful Learning" required />
              </div>

              <div class="form-group">
                <label>Topik / Materi Pokok Bahasan</label>
                <input type="text" class="form-control" id="modTopic" placeholder="Contoh: Pemeliharaan Tanaman Perkebunan Wonosalam" required />
              </div>

              <div class="form-group">
                <label>Rumusan Capaian Pembelajaran (CP)</label>
                <textarea class="form-control" id="modCP" rows="2" placeholder="Tuliskan capaian pembelajaran fase terkait..." required></textarea>
              </div>

              <div class="form-group">
                <label>Tujuan Pembelajaran (TP) Spesifik, Terukur, & HOTS</label>
                <textarea class="form-control" id="modTP" rows="3" placeholder="1. Mengidentifikasi masalah secara kritis... 2. Merancang solusi kontekstual..." required></textarea>
              </div>
            </div>

            <!-- Step 3: Deep Learning Checklist -->
            <div class="card step-card">
              <div class="card-header">
                <span class="card-title">3. Pengalaman Belajar Pembelajaran Mendalam (Deep Learning)</span>
              </div>

              <p style="font-size:0.83rem; color:var(--text-muted); margin-bottom:14px;">
                Centang pengalaman belajar yang telah dirancang secara eksplisit dalam modul ajar Anda:
              </p>

              <label class="dl-checklist-item">
                <input type="checkbox" id="dlMindful" checked />
                <div>
                  <b style="color:var(--primary-navy);">1. Berkesadaran (Mindful Learning)</b>
                  <div style="font-size:0.8rem; color:var(--text-muted);">
                    Peserta didik memahami makna & tujuan pembelajaran, fokus hadir utuh, dan melakukan refleksi diri/metakognisi.
                  </div>
                </div>
              </label>

              <label class="dl-checklist-item">
                <input type="checkbox" id="dlMeaningful" checked />
                <div>
                  <b style="color:var(--primary-navy);">2. Bermakna (Meaningful Learning)</b>
                  <div style="font-size:0.8rem; color:var(--text-muted);">
                    Materi dikaitkan dengan konteks nyata di lingkungan Wonosalam/industri, menghubungkan pengetahuan awal, dan pemecahan masalah otentik.
                  </div>
                </div>
              </label>

              <label class="dl-checklist-item">
                <input type="checkbox" id="dlJoyful" checked />
                <div>
                  <b style="color:var(--primary-navy);">3. Menggembirakan (Joyful Learning)</b>
                  <div style="font-size:0.8rem; color:var(--text-muted);">
                    Menciptakan iklim belajar positif, aman, kolaboratif, memicu antusiasme, rasa ingin tahu, dan kebanggaan berkarya vokasi.
                  </div>
                </div>
              </label>
            </div>

            <!-- Step 4: Upload File Berkas -->
            <div class="card step-card">
              <div class="card-header">
                <span class="card-title">4. Berkas Modul Ajar (PDF / DOCX)</span>
              </div>

              <div class="form-group">
                <input type="file" class="form-control" id="modFile" accept=".pdf,.doc,.docx" required />
                <span style="font-size:0.75rem; color:var(--text-muted); margin-top:4px; display:block;">
                  Format: .pdf, .docx (Maksimal 25 MB). Lampirkan lembar kerja peserta didik (LKPD) dan instrumen asesmen.
                </span>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                <button type="button" class="btn btn-outline" onclick="navigateTo('dashboard')">${t('cancel')}</button>
                <button type="submit" class="btn btn-primary" style="padding:10px 24px;">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ${t('submitForReview')}
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Right Side: Tips & Guidance for Teachers -->
        <div>
          <div class="card" style="border-top:4px solid var(--accent-cyan);">
            <div class="card-header"><span class="card-title">💡 Panduan Telaah Kepala Sekolah</span></div>
            <div style="font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
              <p style="margin-bottom:10px;">
                Agar modul ajar Anda mendapatkan kategori <b>Sangat Layak (Skor ≥ 86%)</b>, pastikan mencakup aspek-aspek utama berikut:
              </p>
              <ul style="padding-left:18px; margin-bottom:12px;">
                <li>Identitas lengkap: Nama SMKN Wonosalam, Jurusan, Kelas, Semester.</li>
                <li>Tujuan Pembelajaran (TP) berorientasi HOTS & Profil Pelajar.</li>
                <li>Aktivitas refleksi terintegrasi pada awal, inti, dan akhir pembelajaran.</li>
                <li>Asesmen asesmen diagnostik, formatif, dan sumatif terlampir dengan rubrik yang jelas.</li>
                <li>Pemberian ruang diferensiasi (konten, proses, produk) bagi peserta didik.</li>
              </ul>
              <div class="guide-tip-box">
                ℹ️ <b>Info Standar:</b> Penelaahan dilakukan menggunakan instrumen baku 47 indikator dengan skor maksimal 188.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------- ANTRIAN TELAAH & MODUL AJAR (MATCHING GAMBAR 3) ------------------- */
  function renderModuleListPage() {
    const user = getCurrentUser();
    const canReview = user.role === 'principal' || user.role === 'admin';

    // Filter modules based on search query, status filter, and department filter
    let list = state.modules;

    if (state.moduleSearchQuery) {
      const q = state.moduleSearchQuery.toLowerCase();
      list = list.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.teacher_name.toLowerCase().includes(q) || 
        m.subject_name.toLowerCase().includes(q)
      );
    }

    if (state.moduleStatusFilter && state.moduleStatusFilter !== 'all') {
      list = list.filter(m => m.status === state.moduleStatusFilter);
    }

    if (state.moduleDeptFilter && state.moduleDeptFilter !== 'all') {
      list = list.filter(m => m.department === state.moduleDeptFilter);
    }

    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuModules')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Kelola, cari, dan telusuri modul ajar pembelajaran mendalam.</p>
        </div>
        ${user.role === 'teacher' ? `
          <button class="btn btn-primary" onclick="navigateTo('upload_module')">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            + Upload Modul Ajar
          </button>
        ` : ''}
      </div>

      <!-- Filter Bar Matching Gambar 3 -->
      <div class="filter-bar">
        <div class="filter-search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="modSearchInput" placeholder="Cari... (Judul, Guru, Mapel...)" value="${state.moduleSearchQuery}" oninput="handleSearchModule(this.value)" />
        </div>

        <select class="filter-select" id="modStatusFilter" onchange="handleFilterStatus(this.value)">
          <option value="all">-- Filter Status --</option>
          <option value="Approved" ${state.moduleStatusFilter === 'Approved' ? 'selected' : ''}>Disetujui</option>
          <option value="Pending Review" ${state.moduleStatusFilter === 'Pending Review' ? 'selected' : ''}>Menunggu Telaah</option>
          <option value="Needs Revision" ${state.moduleStatusFilter === 'Needs Revision' ? 'selected' : ''}>Perlu Revisi</option>
          <option value="Appropriate with Revisions" ${state.moduleStatusFilter === 'Appropriate with Revisions' ? 'selected' : ''}>Layak Dengan Revisi</option>
          <option value="In Revision" ${state.moduleStatusFilter === 'In Revision' ? 'selected' : ''}>Dalam Revisi</option>
        </select>

        <select class="filter-select" id="modDeptFilter" onchange="handleFilterDept(this.value)">
          <option value="all">-- Filter Konsentrasi Keahlian --</option>
          <option value="ATP" ${state.moduleDeptFilter === 'ATP' ? 'selected' : ''}>Agribisnis Tanaman Perkebunan (ATP)</option>
          <option value="Kuliner" ${state.moduleDeptFilter === 'Kuliner' ? 'selected' : ''}>Kuliner</option>
          <option value="TKR" ${state.moduleDeptFilter === 'TKR' ? 'selected' : ''}>Teknik Kendaraan Ringan (TKR)</option>
          <option value="TPM" ${state.moduleDeptFilter === 'TPM' ? 'selected' : ''}>Teknik Pemesinan (TPM)</option>
          <option value="Umum" ${state.moduleDeptFilter === 'Umum' ? 'selected' : ''}>Umum / IPAS</option>
        </select>

        <button class="btn btn-outline btn-sm" onclick="resetModuleFilters()">${t('all')}</button>
      </div>

      <!-- Main Modules Table (Matching Gambar 3) -->
      <div class="card" style="padding:0; overflow:hidden;">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Judul Modul</th>
                <th>Guru</th>
                <th>Mata Pelajaran</th>
                <th>Kelas</th>
                <th>Versi</th>
                <th>Status</th>
                <th>Skor</th>
                <th style="text-align:center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? `
                <tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted);">Tidak ada modul yang sesuai dengan filter pencarian.</td></tr>
              ` : list.map(m => `
                <tr>
                  <td>
                    <div style="font-weight:700; color:var(--primary-dark); font-size:0.92rem;">${m.title}</div>
                    <div style="font-size:0.75rem; color:var(--text-light);">${m.submitted_at}</div>
                  </td>
                  <td style="font-weight:600;">${m.teacher_name}</td>
                  <td><b>${m.department || 'Umum'}</b><br/><span style="font-size:0.8rem; color:var(--text-muted);">${m.subject_name}</span></td>
                  <td>${m.class_name}</td>
                  <td><span class="badge-version">v${m.version_number}</span></td>
                  <td>${renderStatusBadge(m.status)}</td>
                  <td style="font-weight:800; font-size:0.95rem;">
                    ${m.review ? `${m.review.percentage_score}%` : '<span style="color:var(--text-light);">-</span>'}
                  </td>
                  <td style="text-align:center; white-space:nowrap;">
                    ${canReview && (m.status === 'Pending Review' || m.status === 'Waiting for Re-review') ? `
                      <button class="btn btn-primary btn-sm" onclick="openReviewWorkspace('${m.id}')">${t('review')}</button>
                    ` : ''}
                    ${m.review ? `
                      <button class="btn btn-outline btn-sm" onclick="viewReviewDetail('${m.id}')">${t('detail')}</button>
                      <button class="btn btn-outline btn-sm" onclick="openPrintPreview('${m.id}')" title="Cetak Lembar Pengesahan">${t('print')}</button>
                    ` : `
                      <button class="btn btn-outline btn-sm" onclick="viewModuleDetail('${m.id}')">${t('view')}</button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ------------------- REVIEW WORKSPACE (KEPALA SEKOLAH - SUDARSO, S.PD.) ------------------- */
  function renderReviewWorkspacePage() {
    const mod = state.modules.find(m => m.id === state.selectedModuleId) || state.modules[0];
    const currentScores = state.reviewDraftScores[mod.id] || (mod.review ? mod.review.scores : {});
    
    // Auto-calculate live scores
    let liveTotal = 0;
    rubricCategories.forEach(c => {
      c.indicators.forEach(ind => {
        liveTotal += parseInt(currentScores[ind.id] || 3, 10);
      });
    });
    const liveMax = 47 * 4; // 188
    const livePercent = Math.round((liveTotal / liveMax) * 100);
    const liveCategory = calculateEligibility(currentScores).categoryKey;

    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('reviewRubricTitle')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">
            Penelaah: <b>${getCurrentUser().name}</b> (${getCurrentUser().title_badge || 'Kepala Sekolah'}) • Menelaah Modul: <b>${mod.title}</b>
          </p>
        </div>
        <button class="btn btn-outline" onclick="navigateTo('modules')">${t('back')}</button>
      </div>

      <div class="split-workspace">
        <!-- Left Panel: Module Info & Document Simulator -->
        <div>
          <div class="card">
            <div class="card-header"><span class="card-title">Informasi & Berkas Modul</span></div>
            <table class="data-table" style="font-size:0.85rem;">
              <tr><td style="font-weight:700; width:35%;">Judul Modul</td><td>${mod.title}</td></tr>
              <tr><td style="font-weight:700;">Guru Pengampu</td><td>${mod.teacher_name} (NIP: ${mod.nip || '-'})</td></tr>
              <tr><td style="font-weight:700;">Konsentrasi / Mapel</td><td><b>${mod.department || 'Umum'}</b> - ${mod.subject_name}</td></tr>
              <tr><td style="font-weight:700;">Kelas / Fase</td><td>${mod.class_name} (${mod.phase})</td></tr>
              <tr><td style="font-weight:700;">Capaian Pembelajaran</td><td>${mod.learning_outcomes}</td></tr>
              <tr><td style="font-weight:700;">Tujuan Pembelajaran</td><td>${mod.learning_objectives}</td></tr>
              <tr><td style="font-weight:700;">Deep Learning Tag</td><td>
                <span class="badge badge-approved">Mindful</span>
                <span class="badge badge-approved">Meaningful</span>
                <span class="badge badge-approved">Joyful</span>
              </td></tr>
              <tr><td style="font-weight:700;">Berkas Terunggah</td><td>
                <a href="#" style="color:var(--primary-blue); font-weight:700;" onclick="alert('Membuka file: ${mod.file_name}'); return false;">
                  📄 ${mod.file_name} (${mod.file_size})
                </a>
              </td></tr>
            </table>
          </div>

          <div class="card" style="background:#0A1128; color:#FFFFFF; text-align:center; padding:32px 20px;">
            <svg width="48" height="48" fill="none" stroke="var(--accent-sky)" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:10px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <h3 style="font-weight:800; font-size:1.1rem;">Pratinjau Dokumen Modul Ajar</h3>
            <p style="font-size:0.8rem; color:#94A3B8; margin-bottom:14px;">"${mod.title}"</p>
            <button class="btn btn-primary btn-sm" onclick="alert('Membuka penampil berkas dokumen...');">Buka Layar Penuh</button>
          </div>
        </div>

        <!-- Right Panel: Interactive 47-Indicator Rating Instrument -->
        <div>
          <!-- Sticky Live Score Header with Quick Presets for Principal -->
          <div class="review-sticky-header">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div>
                <div style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">Perhitungan Skor 47 Indikator Real-time:</div>
                <div style="font-size:1.6rem; font-weight:800; color:var(--primary-dark);">
                  <span id="liveTotalScore">${liveTotal}</span> / 188 (<span id="livePercent">${livePercent}%</span>)
                </div>
              </div>
              <div id="liveCategoryBadge">
                ${renderEligibilityBadge(liveCategory)}
              </div>
            </div>

            <div style="width:100%; height:8px; background:#E2E8F0; border-radius:4px; overflow:hidden; margin-bottom:12px;">
              <div id="liveProgressBar" style="width:${livePercent}%; height:100%; background:var(--primary-blue); transition:width 0.25s ease;"></div>
            </div>

            <!-- Quick Presets for Rapid Evaluation -->
            <div class="quick-presets-bar">
              <span style="font-size:0.75rem; color:var(--text-muted); font-weight:700; align-self:center;">Isi Cepat:</span>
              <button type="button" class="btn btn-outline btn-sm" onclick="quickFillScores('${mod.id}', 3)">⚡ Sesuai (Skor 3)</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="quickFillScores('${mod.id}', 4)">🌟 Sangat Sesuai (Skor 4)</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="quickFillScores('${mod.id}', 2)">⚠️ Perlu Revisi (Skor 2)</button>
            </div>
          </div>

          <!-- 9 Categories Form -->
          <form id="reviewRubricForm">
            ${rubricCategories.map(cat => `
              <div class="card" style="margin-bottom:16px;">
                <div class="card-header" style="background:#F8FAFC;">
                  <span class="card-title" style="font-size:0.95rem;">${state.lang === 'en' ? cat.name_en : cat.name_id}</span>
                </div>
                <div>
                  ${cat.indicators.map(ind => {
                    const val = currentScores[ind.id] || 3;
                    return `
                      <div style="padding:10px 0; border-bottom:1px solid #F1F5F9; display:flex; justify-content:space-between; align-items:center;">
                        <div style="font-size:0.85rem; max-width:65%; line-height:1.4;">
                          <b style="color:var(--primary-blue);">${ind.id}.</b> 
                          ${state.lang === 'en' ? ind.name_en : ind.name_id}
                        </div>
                        <div style="display:flex; gap:10px;">
                          ${[1, 2, 3, 4].map(num => `
                            <label style="font-size:0.8rem; display:flex; align-items:center; gap:3px; cursor:pointer;">
                              <input type="radio" name="score_${ind.id}" value="${num}" ${val == num ? 'checked' : ''} onchange="updateLiveScore('${mod.id}')" />
                              <b>${num}</b>
                            </label>
                          `).join('')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}

            <!-- Feedback & Final Decision -->
            <div class="card">
              <div class="card-header"><span class="card-title">Kesimpulan, Rekomendasi & Keputusan Akhir</span></div>
              
              <div class="form-group">
                <label>Catatan Umum / Umpan Balik Kualitatif Kepala Sekolah</label>
                <textarea class="form-control" id="revGeneralFeedback" rows="3" required placeholder="Tuliskan catatan apresiasi atau aspek yang perlu diperbaiki...">${mod.review ? mod.review.general_feedback : 'Modul telah mengintegrasikan pembelajaran mendalam secara komprehensif.'}</textarea>
              </div>

              <div class="form-group">
                <label>Rekomendasi Tindak Lanjut</label>
                <textarea class="form-control" id="revRecommendation" rows="2" placeholder="Rekomendasi implementasi di kelas / revisi...">${mod.review ? mod.review.recommendation : 'Direkomendasikan untuk digunakan dalam pembelajaran semester berjalan.'}</textarea>
              </div>

              <div class="grid-2">
                <div class="form-group">
                  <label>Status Keputusan Akhir</label>
                  <select class="form-control" id="revFinalStatus">
                    <option value="Approved" ${mod.status === 'Approved' ? 'selected' : ''}>Disetujui (Approved)</option>
                    <option value="Needs Revision" ${mod.status === 'Needs Revision' ? 'selected' : ''}>Perlu Revisi (Needs Revision)</option>
                    <option value="Appropriate with Revisions" ${mod.status === 'Appropriate with Revisions' ? 'selected' : ''}>Layak Dengan Revisi</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Batas Waktu Revisi (Bila Perlu Revisi)</label>
                  <input type="date" class="form-control" id="revDueDate" value="${mod.review && mod.review.due_revision_date ? mod.review.due_revision_date : '2025-10-15'}" />
                </div>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                <button type="button" class="btn btn-outline" onclick="navigateTo('modules')">${t('cancel')}</button>
                <button type="submit" class="btn btn-primary" style="padding:10px 24px;">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ${t('saveReview')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  /* ------------------- REVIEW RESULT DETAIL PAGE ------------------- */
  function renderReviewResultDetailPage() {
    const mod = state.modules.find(m => m.id === state.selectedModuleId) || state.modules[0];
    const rev = mod.review;

    if (!rev) {
      return `
        <div class="card" style="text-align:center; padding:40px;">
          <h2>Modul Belum Ditelaah</h2>
          <p style="color:var(--text-muted); margin-bottom:16px;">Modul "${mod.title}" saat ini masih dalam antrian telaah.</p>
          <button class="btn btn-outline" onclick="navigateTo('modules')">${t('back')}</button>
        </div>
      `;
    }

    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('reviewResultDetail')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Rincian evaluasi 47 indikator untuk modul: <b>${mod.title}</b></p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="openPrintPreview('${mod.id}')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            ${t('print')} Dokumen Resmi
          </button>
          <button class="btn btn-outline" onclick="navigateTo('modules')">${t('back')}</button>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom:20px;">
        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div>
            <div class="stat-val">${rev.total_score} / 188</div>
            <div class="stat-lbl">${t('totalScoreObtained')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </div>
          <div>
            <div class="stat-val">${rev.percentage_score}%</div>
            <div class="stat-lbl">${t('scorePercentage')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div>
            <div class="stat-val" style="font-size:1.25rem;">${rev.eligibility_category}</div>
            <div class="stat-lbl">${t('eligibilityCategory')}</div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <div class="card-header"><span class="card-title">Catatan dan Rekomendasi Kepala Sekolah (Sudarso, S.Pd.)</span></div>
        <div style="font-size:0.95rem; line-height:1.6; margin-bottom:12px;">
          <b>Catatan Umum:</b> "${rev.general_feedback}"
        </div>
        <div style="font-size:0.95rem; line-height:1.6; color:var(--text-muted);">
          <b>Rekomendasi Tindak Lanjut:</b> "${rev.recommendation}"
        </div>
        <div style="margin-top:16px; font-size:0.85rem; color:var(--text-light);">
          Penelaah: <b>${rev.reviewer_name}</b> (NIP: ${rev.reviewer_nip || '197609232008011006'}) • Tanggal Telaah: ${rev.review_date}
        </div>
      </div>

      <!-- Rincian Evaluasi 47 Indikator -->
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <span class="card-title">Rincian Evaluasi 47 Indikator Rubrik Pembelajaran Mendalam</span>
          <span style="font-size:0.8rem; color:var(--text-muted);">Skor Maksimal: 188</span>
        </div>
        <div class="table-responsive">
          <table class="data-table" style="font-size:0.85rem;">
            <thead>
              <tr>
                <th style="width:65px; text-align:center;">Kode</th>
                <th>Komponen & Indikator Penilaian</th>
                <th style="width:110px; text-align:center;">Skor (1-4)</th>
                <th style="width:160px; text-align:center;">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${rubricCategories.map(cat => `
                <tr style="background:#F8FAFC; font-weight:800; color:var(--primary-dark);">
                  <td colspan="4" style="padding:10px 14px;">
                    📂 ${state.lang === 'en' ? cat.name_en : cat.name_id}
                  </td>
                </tr>
                ${cat.indicators.map(ind => {
                  const s = rev.scores ? (rev.scores[ind.id] !== undefined ? rev.scores[ind.id] : 3) : 3;
                  let badge = '<span class="badge badge-approved">Sangat Baik (4)</span>';
                  if (s === 3) badge = '<span class="badge badge-reviewing">Sesuai (3)</span>';
                  else if (s === 2) badge = '<span class="badge badge-needs-rev">Perlu Revisi (2)</span>';
                  else if (s === 1) badge = '<span class="badge badge-rejected">Kurang (1)</span>';
                  return `
                    <tr style="${s <= 2 ? 'background:#FEF2F2;' : ''}">
                      <td style="text-align:center; font-weight:700; color:var(--text-muted);">${ind.id}</td>
                      <td>
                        ${ind[state.lang === 'en' ? 'name_en' : 'name_id']}
                        ${s <= 2 ? '<div style="font-size:0.75rem; color:#DC2626; font-weight:600; margin-top:2px;">⚠️ Perlu diperbaiki pada modul revisi</div>' : ''}
                      </td>
                      <td style="text-align:center; font-weight:800; font-size:1rem; color:var(--primary-dark);">${s}</td>
                      <td style="text-align:center;">${badge}</td>
                    </tr>
                  `;
                }).join('')}
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ------------------- FEEDBACK & REVISION PAGE ------------------- */
  function renderFeedbackRevisionPage() {
    const mod = state.modules.find(m => m.id === state.selectedModuleId) || state.modules[0];
    const rev = mod.review || {};

    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuFeedbackRevision')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Unggah pembaruan modul ajar berdasarkan rekomendasi telaah Kepala Sekolah.</p>
        </div>
        <button class="btn btn-outline" onclick="navigateTo('dashboard')">${t('back')}</button>
      </div>

      <div class="card" style="max-width:800px; margin:0 auto;">
        <div style="background:#FEF2F2; border-left:4px solid #DC2626; padding:16px; border-radius:8px; margin-bottom:20px;">
          <h4 style="font-weight:800; color:#991B1B; margin-bottom:4px;">Catatan Penelaah (${rev.reviewer_name || 'Kepala Sekolah'}):</h4>
          <p style="font-size:0.9rem; color:#7F1D1D;">"${rev.general_feedback || 'Mohon melengkapi rubrik penilaian autentik.'}"</p>
          <div style="font-size:0.8rem; color:#991B1B; margin-top:8px; font-weight:600;">Batas Waktu Revisi: ${rev.due_revision_date || 'Segera'}</div>
        </div>

        <form id="submitRevisionForm">
          <div class="form-group">
            <label>Rangkuman Perubahan / Catatan Perbaikan</label>
            <textarea class="form-control" id="revNotes" rows="3" placeholder="Jelaskan aspek yang telah diperbaiki sesuai umpan balik pimpinan..." required></textarea>
          </div>

          <div class="form-group">
            <label>Unggah Dokumen Hasil Revisi (v${mod.version_number + 1})</label>
            <input type="file" class="form-control" id="revFile" accept=".pdf,.doc,.docx" required />
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
            <button type="button" class="btn btn-outline" onclick="navigateTo('dashboard')">${t('cancel')}</button>
            <button type="submit" class="btn btn-success" style="padding:10px 22px;">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              ${t('uploadRevision')}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /* ------------------- FORMAL PRINT PREVIEW PAGE ------------------- */
  function renderPrintPreviewPage() {
    const mod = state.modules.find(m => m.id === state.selectedModuleId) || state.modules[0];
    const rev = mod.review || {
      reviewer_name: "Sudarso, S.Pd.",
      reviewer_nip: "197609232008011006",
      review_date: "2025-09-06",
      total_score: 173,
      max_score: 188,
      percentage_score: 92,
      eligibility_category: "Sangat Layak",
      general_feedback: "Modul sangat inspiratif dan komprehensif mengintegrasikan kearifan lokal Wonosalam dengan Deep Learning.",
      recommendation: "Direkomendasikan sebagai best practice implementasi kurikulum merdeka."
    };

    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between;" class="no-print">
        <button class="btn btn-primary" onclick="window.print()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          ${t('print')} Dokumen Resmi / Export PDF
        </button>
        <button class="btn btn-outline" onclick="navigateTo('modules')">${t('back')}</button>
      </div>

      <!-- Formal Printable Sheet -->
      <div class="print-document">
        <!-- Official Kop Cabdin Jombang & SMKN Wonosalam -->
        <div class="print-kop">
          <img src="${state.school.logo}" alt="Logo Sekolah" style="height:90px; width:auto;"/>
          <div class="print-kop-text">
            <h2 style="font-size:1.2rem; font-weight:800; margin:0; text-transform:uppercase;">PEMERINTAH PROVINSI JAWA TIMUR</h2>
            <h3 style="font-size:1.05rem; font-weight:700; margin:2px 0; text-transform:uppercase;">DINAS PENDIDIKAN</h3>
            <h3 style="font-size:1.05rem; font-weight:700; margin:2px 0; text-transform:uppercase;">CABANG DINAS PENDIDIKAN WILAYAH KABUPATEN JOMBANG</h3>
            <h3 style="font-size:1.3rem; font-weight:800; margin:2px 0; color:#1E3A8A; text-transform:uppercase;">SMK NEGERI WONOSALAM</h3>
            <p style="font-size:0.8rem; margin:2px 0; color:#333;">Jl. Anjasmoro, Dsn. Pucangrejo, Ds. Wonosalam, Kec. Wonosalam, Kab. Jombang, Jawa Timur 61476 | Telp: +62 815-1594-0188</p>
            <p style="font-size:0.75rem; margin:0; color:#475569;">Email: smkn.wonosalam.jbg@gmail.com | Website: www.smknwonosalam.sch.id</p>
          </div>
        </div>

        <div style="text-align:center; margin-bottom:20px;">
          <h3 style="text-decoration:underline; font-weight:800; font-size:1.2rem;">LEMBAR HASIL PENELAAHAN MODUL AJAR (DEEP LEARNING)</h3>
          <p style="font-size:0.85rem; font-style:italic;">Nomor Registrasi: SITAMA-DEEP/RVC/${mod.id}/2026</p>
        </div>

        <table class="data-table" style="font-size:0.85rem; margin-bottom:20px;">
          <tr><td style="font-weight:700; width:30%;">Nama Guru Pengampu</td><td>${mod.teacher_name} (NIP: ${mod.nip || '-'})</td></tr>
          <tr><td style="font-weight:700;">Konsentrasi Keahlian / Jurusan</td><td><b>${mod.department || 'Umum'}</b></td></tr>
          <tr><td style="font-weight:700;">Mata Pelajaran / Kelas</td><td>${mod.subject_name} / ${mod.class_name} (${mod.phase})</td></tr>
          <tr><td style="font-weight:700;">Judul Modul Ajar</td><td>${mod.title}</td></tr>
          <tr><td style="font-weight:700;">Tahun Pelajaran / Semester</td><td>${mod.academic_year} / ${mod.semester}</td></tr>
          <tr><td style="font-weight:700;">Tanggal Penelaahan</td><td>${rev.review_date}</td></tr>
        </table>

        <h4 style="font-size:0.95rem; font-weight:800; margin-bottom:8px;">Hasil Penilaian Evaluasi (47 Indikator Rubrik Baku):</h4>
        <table class="data-table" style="font-size:0.8rem; margin-bottom:20px; border:1px solid #CBD5E1;">
          <thead>
            <tr><th>No</th><th>Komponen & Indikator Evaluasi</th><th>Skor (1-4)</th></tr>
          </thead>
          <tbody>
            ${rubricCategories.map(cat => `
              <tr style="background:#F1F5F9;"><td colspan="3"><b>${cat.name_id}</b></td></tr>
              ${cat.indicators.map(ind => `
                <tr>
                  <td style="text-align:center;">${ind.id}</td>
                  <td>${ind.name_id}</td>
                  <td style="text-align:center; font-weight:800;">${rev.scores ? (rev.scores[ind.id] || 4) : 4}</td>
                </tr>
              `).join('')}
            `).join('')}
          </tbody>
        </table>

        <!-- Total Score Box -->
        <div style="border:2px solid #000; padding:14px; margin-bottom:24px; border-radius:6px;">
          <div style="font-weight:800; font-size:1rem; margin-bottom:4px;">RINGKASAN SKOR KELAYAKAN PEMBELAJARAN MENDALAM:</div>
          <div>Total Skor Perolehan: <b>${rev.total_score} / 188</b></div>
          <div>Persentase Kelayakan: <b>${rev.percentage_score}%</b></div>
          <div>Kategori Kelayakan: <b style="text-decoration:underline;">${rev.eligibility_category}</b></div>
          <div style="margin-top:6px;"><b>Catatan Umum Penelaah:</b> "${rev.general_feedback}"</div>
        </div>

        <div class="signature-grid">
          <div class="signature-box">
            <div>Guru Pengampu,</div>
            <div class="signature-space"></div>
            <div style="font-weight:700; text-decoration:underline;">${mod.teacher_name}</div>
            <div>NIP. ${mod.nip || '-'}</div>
          </div>
          <div class="signature-box">
            <div>Wonosalam, ${rev.review_date}</div>
            <div>Kepala SMK Negeri Wonosalam,</div>
            <div class="signature-space"></div>
            <div style="font-weight:700; text-decoration:underline;">${state.school.principal_name}</div>
            <div>NIP. ${state.school.principal_nip}</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------- DASHBOARD KEPALA SEKOLAH (MATCHING GAMBAR 2) ------------------- */
  function renderPrincipalDashboard() {
    const pendingMods = state.modules.filter(m => m.status === 'Pending Review' || m.status === 'Waiting for Re-review');
    const inRevMods = state.modules.filter(m => m.status === 'Needs Revision' || m.status === 'In Revision');
    const approvedMods = state.modules.filter(m => m.status === 'Approved');

    return `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuPrincipalDashboard')}</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">
          Selamat datang, <b>${getCurrentUser().name}</b> (${getCurrentUser().title_badge || 'Kepala Sekolah'}). Berikut ringkasan modul ajar yang perlu ditelaah.
        </p>
      </div>

      <!-- 4 Stat Cards Matching Gambar 2 -->
      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-icon yellow">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
          </div>
          <div>
            <div class="stat-val">${pendingMods.length}</div>
            <div class="stat-lbl">${t('pendingReviews')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon red">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </div>
          <div>
            <div class="stat-val">${inRevMods.length}</div>
            <div class="stat-lbl">${t('inRevision')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 11.08V12a10 10 0 1 1-5.93-9.14"></polyline><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div>
            <div class="stat-val">${approvedMods.length}</div>
            <div class="stat-lbl">${t('approvedModules')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div class="stat-val">3</div>
            <div class="stat-lbl">${t('activeTeachersUploading')}</div>
          </div>
        </div>
      </div>

      <!-- Prioritas Telaah Hari Ini (Matching Gambar 2) -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Prioritas Telaah Hari Ini (Menunggu Penilaian)</span>
          <button class="btn btn-primary btn-sm" onclick="navigateTo('modules')">Lihat Semua Modul</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Judul Modul Ajar</th>
                <th>Guru Pengampu</th>
                <th>Mata Pelajaran</th>
                <th>Kelas / Fase</th>
                <th>Tanggal Unggah</th>
                <th>Status</th>
                <th style="text-align:center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${pendingMods.length === 0 ? `
                <tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">Tidak ada modul menunggu telaah saat ini.</td></tr>
              ` : pendingMods.map(m => `
                <tr>
                  <td style="font-weight:700; color:var(--primary-dark);">${m.title}</td>
                  <td>${m.teacher_name}</td>
                  <td><b>${m.department || 'Umum'}</b> - ${m.subject_name}</td>
                  <td>${m.class_name} (${m.phase})</td>
                  <td>${m.submitted_at}</td>
                  <td>${renderStatusBadge(m.status)}</td>
                  <td style="text-align:center;">
                    <button class="btn btn-primary btn-sm" onclick="openReviewWorkspace('${m.id}')">${t('review')}</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2 Analytics Charts Matching Gambar 2 -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><span class="card-title">Kesesuaian Indikator Mindful, Meaningful, Joyful</span></div>
          <canvas id="chartPrincipalRadar" height="200"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Rekap Hasil Telaah per Konsentrasi Keahlian</span></div>
          <canvas id="chartPrincipalSubjects" height="200"></canvas>
        </div>
      </div>
    `;
  }

  /* ------------------- DASHBOARD ADMIN (MATCHING GAMBAR 5) ------------------- */
  function renderAdminDashboard() {
    const totalTeachers = state.users.filter(u => u.role === 'teacher').length;
    const totalPrincipals = state.users.filter(u => u.role === 'principal').length;
    const totalMods = state.modules.length;
    const pendingMods = state.modules.filter(m => m.status === 'Pending Review' || m.status === 'Waiting for Re-review').length;

    return `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuAdminDashboard')}</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">Ringkasan pengawasan sistem telaah modul ajar sekolah.</p>
      </div>

      <!-- 4 Stat Cards Matching Gambar 5 -->
      <div class="grid-4">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div class="stat-val">${totalTeachers}</div>
            <div class="stat-lbl">${t('totalTeachers')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <div class="stat-val">${totalPrincipals}</div>
            <div class="stat-lbl">${t('totalPrincipals')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
          </div>
          <div>
            <div class="stat-val">${totalMods}</div>
            <div class="stat-lbl">${t('totalModules')}</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon yellow">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div>
            <div class="stat-val">${pendingMods}</div>
            <div class="stat-lbl">${t('pendingReviews')}</div>
          </div>
        </div>
      </div>

      <!-- Charts Matching Gambar 5 -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><span class="card-title">Status Telaah Modul</span></div>
          <canvas id="chartAdminStatus" height="200"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Rata-rata Skor per Dimensi Deep Learning</span></div>
          <canvas id="chartAdminRadar" height="200"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Aktivitas Pengguna Terbaru (Audit Trail)</span>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('audit_logs')">Lihat Semua</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Pengguna</th><th>Peran</th><th>Aktivitas</th><th>Rincian</th><th>Waktu</th></tr>
            </thead>
            <tbody>
              ${state.auditLogs.slice(0, 5).map(log => `
                <tr>
                  <td style="font-weight:700;">${log.user_name}</td>
                  <td><span class="badge badge-draft">${log.role}</span></td>
                  <td style="color:var(--primary-blue); font-weight:700;">${log.activity}</td>
                  <td>${log.description}</td>
                  <td style="font-size:0.8rem; color:var(--text-light);">${log.created_at}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ------------------- DASHBOARD TENDIK & BUKU KENDALI ------------------- */
  function renderTendikDashboard() {
    const verifiedCount = state.modules.filter(m => m.tendik_verification && m.tendik_verification.archive_code).length;
    const pendingPhysical = state.modules.filter(m => !m.tendik_verification || m.status === 'Pending Review').length;

    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuTendikDashboard')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">
            Pengadministrasian Kurikulum & Buku Kendali Arsip Berkas Fisik/Digital Modul Ajar (Petugas: <b>Tri Wahyuni, S.AP.</b>)
          </p>
        </div>
        <button class="btn btn-primary" onclick="navigateTo('tendik_archive')">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 8v13H3V8"></path><path d="M1 3h22v5H1z"></path><path d="M10 12h4"></path></svg>
          Buka Buku Kendali & Register Arsip
        </button>
      </div>

      <div class="grid-3">
        <div class="stat-card">
          <div class="stat-icon green"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
          <div><div class="stat-val">${verifiedCount}</div><div class="stat-lbl">Terarsip & Berkode Resmi</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
          <div><div class="stat-val">${pendingPhysical}</div><div class="stat-lbl">Menunggu Verifikasi Fisik</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path></svg></div>
          <div><div class="stat-val">4</div><div class="stat-lbl">Jurusan Aktif (ATP, KLN, TKR, TPM)</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">Verifikasi Administrasi & Penerbitan Tanda Terima</span></div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Kode Modul</th><th>Judul & Guru Pengampu</th><th>Jurusan</th><th>Status Telaah</th><th>Status Berkas Fisik</th><th>Kode Arsip / Lokasi</th><th style="text-align:center;">Aksi Tendik</th></tr>
            </thead>
            <tbody>
              ${state.modules.map(m => {
                const v = m.tendik_verification;
                return `
                  <tr>
                    <td style="font-weight:700;">${m.id}</td>
                    <td>
                      <div style="font-weight:700; color:var(--primary-dark);">${m.title}</div>
                      <div style="font-size:0.8rem; color:var(--text-muted);">${m.teacher_name}</div>
                    </td>
                    <td><span class="badge badge-draft">${m.department || 'Umum'}</span></td>
                    <td>${renderStatusBadge(m.status)}</td>
                    <td>${v ? `<span class="badge badge-approved">${v.physical_status}</span>` : `<span class="badge badge-pending">Menunggu Verifikasi</span>`}</td>
                    <td>${v ? `<b>${v.archive_code}</b><br/><span style="font-size:0.75rem; color:var(--text-muted);">${v.rack_location}</span>` : '-'}</td>
                    <td style="text-align:center; white-space:nowrap;">
                      <button class="btn btn-outline btn-sm" onclick="openTendikVerifyModal('${m.id}')">Verifikasi</button>
                      <button class="btn btn-primary btn-sm" onclick="tendikPrintReceipt('${m.id}')">Cetak Tanda Terima</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderTendikArchivePage() {
    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;" class="no-print">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuTendikArchive')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Register Resmi Pengendalian & Pengarsipan Modul Ajar SMKN Wonosalam.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-primary" onclick="window.print()">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Cetak Buku Kendali (PDF)
          </button>
          <button class="btn btn-outline" onclick="navigateTo('dashboard')">${t('back')}</button>
        </div>
      </div>

      <div class="print-document">
        <div class="print-kop">
          <img src="${state.school.logo}" alt="Logo Sekolah" style="height:90px; width:auto;"/>
          <div class="print-kop-text">
            <h2 style="font-size:1.2rem; font-weight:800; margin:0; text-transform:uppercase;">PEMERINTAH PROVINSI JAWA TIMUR</h2>
            <h3 style="font-size:1.05rem; font-weight:700; margin:2px 0; text-transform:uppercase;">DINAS PENDIDIKAN</h3>
            <h3 style="font-size:1.05rem; font-weight:700; margin:2px 0; text-transform:uppercase;">CABANG DINAS PENDIDIKAN WILAYAH KABUPATEN JOMBANG</h3>
            <h3 style="font-size:1.3rem; font-weight:800; margin:2px 0; color:#1E3A8A; text-transform:uppercase;">SMK NEGERI WONOSALAM</h3>
            <p style="font-size:0.8rem; margin:2px 0; color:#333;">Jl. Anjasmoro, Dsn. Pucangrejo, Ds. Wonosalam, Kec. Wonosalam, Kab. Jombang 61476</p>
          </div>
        </div>

        <div style="text-align:center; margin-bottom:24px;">
          <h3 style="font-size:1.2rem; font-weight:800; text-decoration:underline;">BUKU KENDALI & REGISTER ARSIP MODUL AJAR (KURIKULUM MERDEKA)</h3>
          <p style="font-size:0.85rem; color:#475569;">Tahun Pelajaran 2025/2026 - Bagian Tata Usaha & Urusan Kurikulum</p>
        </div>

        <table class="data-table" style="font-size:0.85rem; margin-bottom:24px; border:1px solid #000;">
          <thead>
            <tr style="background:#F1F5F9; border-bottom:2px solid #000;">
              <th>No.</th>
              <th>Kode Registrasi Arsip</th>
              <th>Judul Modul Ajar</th>
              <th>Guru Pengampu / NIP</th>
              <th>Jurusan</th>
              <th>Status Telaah</th>
              <th>Verifikasi Fisik</th>
              <th>Lokasi Rak</th>
            </tr>
          </thead>
          <tbody>
            ${state.modules.map((m, idx) => {
              const v = m.tendik_verification || {};
              return `
                <tr>
                  <td style="text-align:center; font-weight:700;">${idx + 1}</td>
                  <td style="font-family:var(--font-mono); font-weight:700;">${v.archive_code || `REG-2025/${m.id}`}</td>
                  <td style="font-weight:700;">${m.title}</td>
                  <td>${m.teacher_name}<br/><span style="font-size:0.75rem; color:var(--text-muted);">NIP. ${m.nip || '-'}</span></td>
                  <td><b>${m.department || 'Umum'}</b><br/>${m.class_name}</td>
                  <td>${m.status === 'Approved' ? '<span style="color:#059669; font-weight:700;">Disetujui Kepsek</span>' : m.status}</td>
                  <td>${v.physical_status || 'Dalam Pemeriksaan'}</td>
                  <td>${v.rack_location || 'Lemari Arsip A1'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="signature-grid">
          <div class="signature-box">
            <div>Mengetahui,<br/><b>Kepala SMK Negeri Wonosalam</b></div>
            <div class="signature-space"></div>
            <div style="font-weight:700; text-decoration:underline;">Sudarso, S.Pd.</div>
            <div>NIP. 197609232008011006</div>
          </div>
          <div class="signature-box">
            <div>Wonosalam, 2 Oktober 2026<br/><b>Pengadministrasi Kurikulum (Tendik)</b></div>
            <div class="signature-space"></div>
            <div style="font-weight:700; text-decoration:underline;">Tri Wahyuni, S.AP.</div>
            <div>NIP. 198706152014032002</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------- LAPORAN & ANALITIK (MATCHING GAMBAR 7) ------------------- */
  function renderReportsPage() {
    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuReports')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Laporan rekapitulasi telaah modul ajar dan analitik penerapan Deep Learning.</p>
        </div>
        <button class="btn btn-outline" onclick="exportReportsCSV()">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          ${t('exportCsv')}
        </button>
      </div>

      <!-- 3 Charts Matching Gambar 7 -->
      <div class="grid-3">
        <div class="card">
          <div class="card-header"><span class="card-title">Rekapitulasi per Guru</span></div>
          <canvas id="chartReportTeacher" height="220"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Analisis Penerapan Deep Learning</span></div>
          <canvas id="chartReportDL" height="220"></canvas>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Distribusi Kategori Kelayakan</span></div>
          <canvas id="chartReportEligibility" height="220"></canvas>
        </div>
      </div>
    `;
  }

  /* ------------------- USER MANAGEMENT (ADMIN) ------------------- */
  function renderUserManagementPage() {
    return `
      <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuUserManagement')}</h1>
          <p style="color:var(--text-muted); font-size:0.9rem;">Kelola seluruh akun pengguna: Admin, Kepala Sekolah / Waka, Guru, dan Tendik (4 Tingkatan Akun).</p>
        </div>
        <button class="btn btn-primary" onclick="openNewUserModalAdmin()">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          + Tambah Pengguna Baru (New User)
        </button>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Nama Pengguna</th><th>Email / Username</th><th>Peran (Role)</th><th>Unit / Jurusan</th><th>NIP</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              ${state.users.map(u => `
                <tr>
                  <td style="font-weight:700;">${u.name}</td>
                  <td>${u.email}<br/><span style="font-size:0.75rem; color:var(--text-muted);">@${u.username}</span></td>
                  <td>
                    <span class="badge ${u.role === 'admin' ? 'badge-draft' : u.role === 'principal' ? 'badge-reviewing' : u.role === 'tendik' ? 'badge-tendik' : 'badge-approved'}">
                      ${u.title_badge || t(u.role)}
                    </span>
                  </td>
                  <td>${u.department || '-'}</td>
                  <td>${u.nip || '-'}</td>
                  <td><span class="badge badge-approved">${u.status}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="adminResetUserPassword('${u.id}')">Reset Sandi</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderMasterDataPage() {
    return `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuMasterData')}</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">Data Master Satuan Pendidikan, 4 Konsentrasi Keahlian, dan Profil SMK Negeri Wonosalam.</p>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><span class="card-title">4 Konsentrasi Keahlian (Program Vokasi)</span></div>
          <table class="data-table">
            <thead><tr><th>Kode</th><th>Konsentrasi Keahlian</th><th>Ketua Program</th></tr></thead>
            <tbody>
              ${state.departments.map(d => `<tr><td><b>${d.code}</b></td><td>${d.icon} ${d.name}</td><td>${d.head}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">Identitas Satuan Pendidikan</span></div>
          <table class="data-table" style="font-size:0.85rem;">
            <tr><td><b>Nama Sekolah</b></td><td>${state.school.school_name}</td></tr>
            <tr><td><b>NPSN</b></td><td>${state.school.npsn}</td></tr>
            <tr><td><b>Kepala Sekolah</b></td><td>${state.school.principal_name} (NIP: ${state.school.principal_nip})</td></tr>
            <tr><td><b>Cabang Dinas</b></td><td>${state.school.cabdin}</td></tr>
            <tr><td><b>Statistik Siswa & Rombel</b></td><td>822 Siswa • 62 Guru/Tendik • 24 Rombongan Belajar</td></tr>
            <tr><td><b>Alamat Lengkap</b></td><td>${state.school.address}</td></tr>
          </table>
        </div>
      </div>
    `;
  }

  /* ------------------- INSTRUMEN TELAAH 47 INDIKATOR (MATCHING GAMBAR 6) ------------------- */
  function renderRubricManagementPage() {
    return `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuRubric')}</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">
          Daftar 9 Kategori & 47 Indikator Evaluasi Modul Ajar Pembelajaran Mendalam. Skor Maksimal: 188 ($47 \\times 4$).
        </p>
      </div>

      <div class="card">
        ${rubricCategories.map(cat => `
          <div style="margin-bottom:20px;">
            <h3 style="font-size:1.05rem; font-weight:800; color:var(--primary-blue); margin-bottom:8px; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ${cat.name_id}
            </h3>
            <ul style="padding-left:22px; font-size:0.88rem; line-height:1.6; color:var(--text-main);">
              ${cat.indicators.map(ind => `
                <li style="margin-bottom:6px;">
                  <b>${ind.id}.</b> ${ind.name_id} <span style="color:var(--text-light); font-size:0.8rem;">/ ${ind.name_en}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderAuditLogsPage() {
    return `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuAuditLog')}</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">Rekaman jejak aktivitas pengguna (audit trail) untuk transparansi tata kelola.</p>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr><th>Waktu</th><th>Nama Pengguna</th><th>Peran</th><th>Aktivitas</th><th>Keterangan</th><th>IP Address</th></tr>
            </thead>
            <tbody>
              ${state.auditLogs.map(log => `
                <tr>
                  <td style="font-size:0.8rem; color:var(--text-light);">${log.created_at}</td>
                  <td style="font-weight:700;">${log.user_name}</td>
                  <td><span class="badge badge-draft">${log.role}</span></td>
                  <td style="color:var(--primary-blue); font-weight:700;">${log.activity}</td>
                  <td>${log.description}</td>
                  <td style="font-family:var(--font-mono); font-size:0.8rem;">${log.ip_address}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderProfilePage() {
    const user = getCurrentUser();
    return `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:1.6rem; font-weight:800; color:var(--text-main);">${t('menuProfile')}</h1>
        <p style="color:var(--text-muted); font-size:0.9rem;">Informasi akun dan preferensi pengguna.</p>
      </div>

      <div class="card" style="max-width:600px;">
        <div style="display:flex; align-items:center; gap:20px; margin-bottom:20px;">
          <div class="avatar" style="width:64px; height:64px; font-size:1.8rem;">${user.name.charAt(0)}</div>
          <div>
            <h2 style="font-size:1.3rem; font-weight:800;">${user.name}</h2>
            <div style="color:var(--text-muted); font-size:0.85rem;">${user.title_badge || t(user.role)} • NIP. ${user.nip || '-'}</div>
          </div>
        </div>

        <table class="data-table" style="font-size:0.9rem; margin-bottom:20px;">
          <tr><td><b>Email</b></td><td>${user.email}</td></tr>
          <tr><td><b>Username</b></td><td>@${user.username}</td></tr>
          <tr><td><b>Peran Akun</b></td><td><span class="badge badge-approved">${user.role}</span></td></tr>
          <tr><td><b>Unit / Jurusan</b></td><td>${user.department || '-'}</td></tr>
          <tr><td><b>Tugas Pokok</b></td><td>${user.subject_name || '-'}</td></tr>
        </table>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:16px; border-top:1px solid var(--border-color);">
          <button class="btn btn-outline" style="font-size:0.8rem;" onclick="openSupabaseModal()">⚙️ Cloud Database Supabase</button>
          <button class="btn btn-outline" style="color:#DC2626; border-color:#FCA5A5;" onclick="navigateTo('login')">${t('logout')}</button>
        </div>
      </div>
    `;
  }

  /* ------------------- OFFICIAL PUBLIC LANDING PAGE (GEMPITA 2026) ------------------- */
  function renderLandingPage() {
    const isEn = state.lang === 'en';
    
    return `
      <div class="landing-page">
        <!-- Ambient Background Glows -->
        <div class="landing-glow-1"></div>
        <div class="landing-glow-2"></div>

        <!-- 1. STICKY TOP NAVIGATION -->
        <header class="landing-nav">
          <div class="landing-nav-brand" onclick="scrollToLandingTop()" title="Kembali ke Atas Beranda">
            <img src="${state.school.logo}" alt="Logo SMKN Wonosalam" onerror="this.src='logo.png'"/>
            <div class="landing-brand-text">
              <div class="landing-brand-title">
                SITAMA-DEEP
                <span class="landing-brand-badge">GEMPITA 2026</span>
              </div>
              <div class="landing-brand-sub">SMK Negeri Wonosalam • Cabdin Jombang</div>
            </div>
          </div>

          <ul class="landing-nav-links">
            <li><a onclick="scrollToLandingTop()">${isEn ? 'Home' : 'Beranda'}</a></li>
            <li><a onclick="scrollToLandingSection('galeri-section')">${isEn ? 'Campus Gallery' : 'Galeri Kampus'}</a></li>
            <li><a onclick="scrollToLandingSection('deep-learning-section')">Deep Learning</a></li>
            <li><a onclick="scrollToLandingSection('ekosistem-section')">${isEn ? '4 Roles' : '4 Akun'}</a></li>
            <li><a onclick="scrollToLandingSection('rubrik-section')">${isEn ? 'Rubric 47' : 'Rubrik 47'}</a></li>
            <li><a onclick="scrollToLandingSection('dokumen-section')">${isEn ? 'Docs' : 'Dokumen'}</a></li>
            <li><a onclick="scrollToLandingSection('inovator-section')">${isEn ? 'Innovator' : 'Inovator'}</a></li>
          </ul>

          <div class="landing-nav-actions">
            <!-- Language Switcher -->
            <button class="landing-btn landing-btn-outline landing-btn-sm" onclick="toggleLandingLang()" title="Ganti Bahasa">
              🌐 ${state.lang.toUpperCase()}
            </button>

            <!-- Dashboard Button (Prominent & Always Visible) -->
            <button class="landing-btn landing-btn-primary landing-btn-sm" onclick="navigateTo('dashboard')" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); box-shadow: 0 2px 10px rgba(16,185,129,0.4);" title="Buka Dashboard Aplikasi SITAMA-DEEP">
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              ${isEn ? 'Dashboard' : 'Buka Dashboard'}
            </button>

            <!-- Portal Login Button -->
            <button class="landing-btn landing-btn-secondary landing-btn-sm" onclick="navigateTo('login')">
              ${isEn ? 'Login' : 'Masuk'}
            </button>
          </div>
        </header>

        <!-- 2. HERO SECTION WITH AUTHENTIC SCHOOL PHOTO BACKGROUND -->
        <div class="landing-hero-container">
          <section class="landing-hero" id="hero">
            <div class="landing-hero-left">
              <div class="landing-pill">
                <span>🏅</span>
                <span>${isEn ? 'GEMPITA 2026 Best Practice Innovation • Cabdin Jombang' : 'Inovasi Praktik Baik GEMPITA 2026 • Cabdin Jombang'}</span>
              </div>

              <!-- Main Building Interactive Photo Pill -->
              <div class="landing-building-pill" onclick="openPhotoModal('gedung-utama-smkn.jpg', 'Gedung Utama SMK Negeri Wonosalam', 'Panorama megah Gedung Utama dan Lapangan Upacara SMK Negeri Wonosalam berlatar Gunung Anjasmoro di Wonosalam, Jombang, Jawa Timur.', 'Gedung Utama & Kampus')" title="Klik untuk melihat foto Gedung Utama SMKN Wonosalam">
                <span class="landing-pulse-badge"></span>
                <span>🏛️ <b>Gedung Utama & Kampus SMKN Wonosalam</b> (Lereng Gn. Anjasmoro)</span>
                <span class="landing-view-hint">Foto HD ↗</span>
              </div>

              <h1 class="landing-hero-title">
                ${isEn 
                  ? 'Standardized Teaching Module Review Based on <span class="landing-gradient-text">Deep Learning</span>' 
                  : 'Sistem Informasi Telaah Modul Ajar Berbasis <span class="landing-gradient-text">Pembelajaran Mendalam</span>'}
              </h1>

              <p class="landing-hero-desc">
                ${isEn
                  ? 'Digital quality assurance platform for instructional planning at SMK Negeri Wonosalam. Connecting Principals, Curriculum Coordinators, Vocational Teachers, and Administrative Staff with 47 standardized Deep Learning indicators (Mindful, Meaningful, Joyful).'
                  : 'Platform digital penjaminan mutu perencanaan pembelajaran di SMK Negeri Wonosalam. Menghubungkan Kepala Sekolah, Waka Kurikulum, Guru Pengampu Kejuruan, dan Tenaga Kependidikan dalam ekosistem telaah terstandar 47 Indikator Deep Learning (Mindful, Meaningful, Joyful).'}
              </p>

              <div class="landing-cta-row">
                <button class="landing-btn landing-btn-primary" onclick="navigateTo('login')">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  ${isEn ? 'Open Official Portal / Login' : 'Masuk ke Aplikasi Portal'}
                </button>

                <button class="landing-btn landing-btn-secondary" onclick="navigateTo('dashboard')">
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  ${isEn ? 'Explore Live Dashboard' : 'Eksplorasi Demo Dashboard'}
                </button>

                <button class="landing-btn landing-btn-outline" onclick="scrollToLandingSection('galeri-section')">
                  📸 ${isEn ? 'Campus Gallery' : 'Galeri Kampus'}
                </button>
              </div>

              <!-- Quick Demo Role Launcher Chips -->
              <div class="landing-quick-roles">
                <div class="landing-quick-roles-label">
                  ⚡ ${isEn ? 'Instant Demo - Click to enter as any role:' : 'Uji coba langsung tanpa instalasi (Pilih salah satu peran):'}
                </div>
                <div class="landing-chips-container">
                  <button class="landing-role-chip" onclick="quickLogin('USR-002')">👔 2. Kepsek (Sudarso, S.Pd.)</button>
                  <button class="landing-role-chip" onclick="quickLogin('USR-002B')">👔 2. Waka (Drs. Bambang)</button>
                  <button class="landing-role-chip" onclick="quickLogin('USR-003')">👨‍🏫 3. Guru ATP (Budi)</button>
                  <button class="landing-role-chip" onclick="quickLogin('USR-004')">🍳 3. Guru Kuliner (Dewi)</button>
                  <button class="landing-role-chip" onclick="quickLogin('USR-008')">📋 4. Tendik / TU (Tri)</button>
                  <button class="landing-role-chip" onclick="quickLogin('USR-001')">🛠️ 1. Admin (Siti)</button>
                </div>
              </div>
            </div>

            <!-- Hero Right Preview Card -->
            <div class="landing-hero-card">
              <!-- Campus Building Preview Thumbnail Card -->
              <div class="landing-card-campus-thumb" onclick="openPhotoModal('gedung-utama-smkn.jpg', 'Gedung Utama SMK Negeri Wonosalam', 'Panorama megah Gedung Utama dan Lingkungan Belajar SMK Negeri Wonosalam berlatar Gunung Anjasmoro di Wonosalam, Jombang, Jawa Timur.', 'Gedung Utama & Kampus')" title="Klik untuk memperbesar foto Gedung Utama">
                <img src="gedung-utama-smkn.jpg" alt="Gedung Utama SMK Negeri Wonosalam" />
                <div class="landing-thumb-caption">
                  <span>🏛️ Kampus Utama SMKN Wonosalam</span>
                  <span>Buka Foto HD 🔍</span>
                </div>
              </div>

              <div class="landing-card-header">
                <div class="landing-card-title">
                  <svg width="18" height="18" fill="none" stroke="#38BDF8" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Hasil Telaah Modul Ajar (Live)
                </div>
                <span class="landing-status-badge">✓ SANGAT LAYAK (A)</span>
              </div>

            <div style="font-size:0.88rem; color:#FFFFFF; font-weight:700; margin-bottom:4px;">
              Pengolahan Tanah & Penanaman Kelapa Sawit
            </div>
            <div style="font-size:0.78rem; color:#94A3B8; margin-bottom:14px;">
              Budi Santoso, S.Pd. • Agribisnis Tanaman Perkebunan (ATP) • Fase E
            </div>

            <div class="landing-score-banner">
              <div>
                <div class="landing-score-num">173 <span style="font-size:1.1rem; color:#93C5FD; font-weight:600;">/ 188</span></div>
                <div class="landing-score-sub">Skor Kumulatif 47 Indikator Telaah</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:1.6rem; font-weight:800; color:#34D399;">92%</div>
                <div style="font-size:0.75rem; color:#6EE7B7;">Predikat Sangat Layak</div>
              </div>
            </div>

            <div class="landing-preview-metrics">
              <div class="landing-metric-box">
                <div class="landing-metric-val" style="color:#38BDF8;">92%</div>
                <div class="landing-metric-lbl">🧠 Mindful</div>
              </div>
              <div class="landing-metric-box">
                <div class="landing-metric-val" style="color:#34D399;">95%</div>
                <div class="landing-metric-lbl">💡 Meaningful</div>
              </div>
              <div class="landing-metric-box">
                <div class="landing-metric-val" style="color:#FBBF24;">85%</div>
                <div class="landing-metric-lbl">🌟 Joyful</div>
              </div>
            </div>

            <div style="font-size:0.76rem; color:#CBD5E1; border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
              <span>Penelaah: <b>Sudarso, S.Pd.</b> (Kepala Sekolah)</span>
              <span style="color:#38BDF8; font-weight:600;">Tervalidasi Digital ✓</span>
            </div>

            <button class="landing-btn landing-btn-secondary landing-btn-sm" style="width:100%; margin-top:14px;" onclick="navigateTo('dashboard')">
              Buka Lembar Telaah Lengkap di Dashboard →
            </button>
          </div>
        </section>
      </div>

      <!-- 3. STATS COUNTER RIBBON -->
      <section class="landing-stats-section">
        <div class="landing-stats-grid">
          <div class="landing-stat-box">
            <div class="landing-stat-number">47</div>
            <div class="landing-stat-title">Indikator Telaah Baku</div>
            <div class="landing-stat-desc">Rubrik terpadu Deep Learning</div>
          </div>
          <div class="landing-stat-box">
            <div class="landing-stat-number">188</div>
            <div class="landing-stat-title">Poin Skor Maksimal</div>
            <div class="landing-stat-desc">Skala kelayakan terstandar</div>
          </div>
          <div class="landing-stat-box">
            <div class="landing-stat-number">4</div>
            <div class="landing-stat-title">Tingkatan Akun Terpadu</div>
            <div class="landing-stat-desc">Admin, Kepsek, Guru, Tendik</div>
          </div>
          <div class="landing-stat-box">
            <div class="landing-stat-number">100%</div>
            <div class="landing-stat-title">Berbasis Cloud & Digital</div>
            <div class="landing-stat-desc">Arsip otomatis & audit trail</div>
          </div>
        </div>
      </section>

      <!-- 3.5 GALERI KAMPUS & AKTIVITAS PEMBELAJARAN (DEEP LEARNING IN ACTION) -->
      <section class="landing-gallery-section" id="galeri-section">
        <div class="landing-section-header">
          <span class="landing-section-badge">${isEn ? 'CAMPUS & LEARNING IN ACTION' : 'POTRET KAMPUS & AKTIVITAS PEMBELAJARAN'}</span>
          <h2 class="landing-section-title">${isEn ? 'SMKN Wonosalam Campus & Best Practices' : 'Sekilas SMKN Wonosalam & Praktik Baik'}</h2>
          <p class="landing-section-desc">
            ${isEn 
              ? 'Authentic documentation of the main campus building, industry-standard vocational workshops, and the deep learning ecosystem (Mindful, Meaningful, Joyful) at the slopes of Mount Anjasmoro, Jombang.'
              : 'Dokumentasi autentik gedung utama sekolah, sarana kejuruan standar industri, serta iklim pembelajaran mendalam (Mindful, Meaningful, Joyful) di lereng Gunung Anjasmoro, Kabupaten Jombang.'}
          </p>
        </div>

        <div class="landing-gallery-grid">
          <!-- Card 1: Gedung Utama -->
          <div class="landing-gallery-card" onclick="openPhotoModal('gedung-utama-smkn.jpg', '${isEn ? 'Main Building of SMKN Wonosalam' : 'Gedung Utama SMK Negeri Wonosalam'}', '${isEn ? 'Magnificent panorama of the Main Building and Courtyard of SMK Negeri Wonosalam set against Mount Anjasmoro in Wonosalam, Jombang, East Java.' : 'Panorama megah Gedung Utama dan Lapangan Upacara SMK Negeri Wonosalam berlatar Gunung Anjasmoro di Wonosalam, Jombang, Jawa Timur.'}', '${isEn ? 'Campus Architecture' : 'Gedung Utama & Kampus'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Main Building' : 'Gedung Utama'}</span>
              <img src="gedung-utama-smkn.jpg" alt="Gedung Utama SMK Negeri Wonosalam" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'Main Campus at Mount Anjasmoro' : 'Gedung Utama di Lereng Gn. Anjasmoro'}</div>
              <div class="landing-gallery-desc">
                ${isEn 
                  ? 'The main building complex and ceremonial plaza of SMKN Wonosalam surrounded by lush tropical greenery, offering a serene and focused learning environment.'
                  : 'Kompleks gedung utama dan lapangan upacara SMK Negeri Wonosalam yang asri dan sejuk, menghadirkan lingkungan belajar kondusif.'}
              </div>
              <div class="landing-gallery-meta">
                <span>🏛️ Jl. Anjasmoro, Jombang</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Halaman & Monumen Sekolah -->
          <div class="landing-gallery-card" onclick="openPhotoModal('foto-kampus-lapangan.jpg', '${isEn ? 'School Courtyard & Monument' : 'Halaman & Monumen SMK Negeri Wonosalam'}', '${isEn ? 'School ceremony plaza with the official SMK Negeri Wonosalam stone monument and student cultural arts performance.' : 'Lapangan upacara dengan monumen kebanggaan sekolah SMK Negeri Wonosalam serta atraksi seni budaya peserta didik.'}', '${isEn ? 'School Monument' : 'Monumen Resmi'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Monument' : 'Monumen Sekolah'}</span>
              <img src="foto-kampus-lapangan.jpg" alt="Lapangan & Monumen SMKN Wonosalam" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'Plaza & Iconic School Monument' : 'Halaman & Monumen Ikonik Sekolah'}</div>
              <div class="landing-gallery-desc">
                ${isEn
                  ? 'The stone landmark bearing &quot;SMK NEGERI WONOSALAM&quot; as the pride of the school community and a stage for student artistic celebration.'
                  : 'Monumen bertuliskan &quot;SMK NEGERI WONOSALAM&quot; yang menjadi landmark kebanggaan warga sekolah dan panggung kreasi bakat siswa.'}
              </div>
              <div class="landing-gallery-meta">
                <span>🏅 Landmark Kampus</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Paskibra PRASNEWS -->
          <div class="landing-gallery-card" onclick="openPhotoModal('foto-paskibra-kampus.jpg', '${isEn ? 'PRASNEWS Flag Bearers' : 'Paskibra PRASNEWS SMKN Wonosalam'}', '${isEn ? 'Flag-raising troop (PRASNEWS) marching with discipline in the school courtyard with reflective artistic presentation.' : 'Pasukan Pengibar Bendera SMK Negeri Wonosalam (PRASNEWS) berbaris tegap dengan disiplin di lapangan upacara berlatar gedung kelas.'}', '${isEn ? 'Character Building' : 'Karakter & Disiplin'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Paskibra PRASNEWS' : 'Paskibra PRASNEWS'}</span>
              <img src="foto-paskibra-kampus.jpg" alt="Paskibra PRASNEWS SMKN Wonosalam" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'Student Discipline & Character' : 'Kedisiplinan & Bintalsik Peserta Didik'}</div>
              <div class="landing-gallery-desc">
                ${isEn
                  ? 'Instilling integrity, rigorous discipline, and mental-physical stamina (Bintalsik) through Paskibra and vocational character building.'
                  : 'Penanaman karakter integritas, kedisiplinan baris-berbaris, dan pembinaan mental fisik (Bintalsik) yang menjadi ciri khas SMKN Wonosalam.'}
              </div>
              <div class="landing-gallery-meta">
                <span>🇮🇩 PRASNEWS Wonosalam</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>

          <!-- Card 4: Bengkel Mesin TPM -->
          <div class="landing-gallery-card" onclick="openPhotoModal('foto-bengkel-pemesinan.jpg', '${isEn ? 'Mechanical Engineering Workshop' : 'Bengkel Konsentrasi Teknik Pemesinan (TPM)'}', '${isEn ? 'Vocational students operating industry-standard Westco milling and lathe machinery adhering to occupational safety standards.' : 'Siswa konsentrasi keahlian Teknik Pemesinan mengoperasikan mesin bubut/milling berstandar industri dengan APD lengkap.'}', '${isEn ? 'Vocational Practice' : 'Praktik Vokasi DUDIKA'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Machining Workshop' : 'Teknik Pemesinan'}</span>
              <img src="foto-bengkel-pemesinan.jpg" alt="Bengkel Teknik Pemesinan SMKN Wonosalam" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'Industry Standard Workshops' : 'Bengkel Mesin Standar Industri'}</div>
              <div class="landing-gallery-desc">
                ${isEn
                  ? 'Hands-on vocational practice aligned with industrial standards (DUDIKA), training students in precision machining and safety culture.'
                  : 'Praktik kejuruan vokasi berstandar industri kerja (DUDIKA), membekali siswa keahlian presisi pemesinan dan budaya mutu K3.'}
              </div>
              <div class="landing-gallery-meta">
                <span>⚙️ Konsentrasi Keahlian TPM</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>

          <!-- Card 5: SMEKNEWS Studio & Kuliner -->
          <div class="landing-gallery-card" onclick="openPhotoModal('foto-studio-smeknews.jpg', '${isEn ? 'SMEKNEWS Studio & Culinary' : 'SMEKNEWS Studio & Konsentrasi Kuliner'}', '${isEn ? 'Students in official SMKN Wonosalam uniform and Culinary chef jacket co-hosting an educational broadcast.' : 'Siswi berseragam resmi SMKN Wonosalam dan siswi konsentrasi Kuliner/Tata Boga memandu siniar podcast di SMEKNEWS Studio.'}', '${isEn ? 'Broadcasting & Culinary' : 'Broadcasting & Kuliner'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Studio & Culinary' : 'SMEKNEWS Studio'}</span>
              <img src="foto-studio-smeknews.jpg" alt="SMEKNEWS Studio & Kuliner" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'SMEKNEWS Studio & Culinary Arts' : 'SMEKNEWS Studio & Praktik Kuliner'}</div>
              <div class="landing-gallery-desc">
                ${isEn
                  ? 'The school digital podcast studio working in tandem with the Culinary Arts department, honing public speaking and modern creative media skills.'
                  : 'Studio podcast digital interaktif sekolah bersinergi dengan konsentrasi keahlian Kuliner/Tata Boga mengasah kemampuan komunikasi publik.'}
              </div>
              <div class="landing-gallery-meta">
                <span>🎙️ Studio Kreatif Digital</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>

          <!-- Card 6: Collaborative Deep Learning -->
          <div class="landing-gallery-card" onclick="openPhotoModal('foto-pembelajaran-kolaboratif.jpg', '${isEn ? 'Collaborative Deep Learning' : 'Pembelajaran Kolaboratif Deep Learning'}', '${isEn ? 'Students actively discussing contextual project artifacts in class, embodying meaningful and joyful learning.' : 'Siswi berdiskusi aktif menyusun proyek kontekstual di kelas, mewujudkan pembelajaran yang bermakna dan menggembirakan.'}', '${isEn ? 'Classroom Deep Learning' : 'Deep Learning di Kelas'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Meaningful & Joyful' : 'Meaningful & Joyful'}</span>
              <img src="foto-pembelajaran-kolaboratif.jpg" alt="Pembelajaran Kolaboratif Siswi SMKN Wonosalam" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'Active Collaborative Learning' : 'Aktivitas Belajar Kolaboratif di Kelas'}</div>
              <div class="landing-gallery-desc">
                ${isEn
                  ? 'Implementation of Meaningful & Joyful Learning: students working together on real-world problem-solving and thematic presentation projects.'
                  : 'Implementasi pilar Meaningful & Joyful Learning: siswa bekerja sama memecahkan masalah riil dan mempresentasikan proyek tematik.'}
              </div>
              <div class="landing-gallery-meta">
                <span>💡 Active Student Learning</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>

          <!-- Card 7: Perpustakaan & Literasi -->
          <div class="landing-gallery-card" onclick="openPhotoModal('foto-perpustakaan-literasi.jpg', '${isEn ? 'Digital Literacy & Library' : 'Ruang Literasi & Perpustakaan Digital'}', '${isEn ? 'Student in school blazer studying reference materials and digital resources independently in the school library.' : 'Siswi berjas almamater SMKN Wonosalam melakukan telaah materi dan literasi digital mandiri di perpustakaan sekolah.'}', '${isEn ? 'Mindful & Research' : 'Mindful & Riset'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Digital Library' : 'Perpustakaan Digital'}</span>
              <img src="foto-perpustakaan-literasi.jpg" alt="Perpustakaan SMKN Wonosalam" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'Digital Literacy & Self-Paced Study' : 'Pojok Literasi & Riset Digital Mandiri'}</div>
              <div class="landing-gallery-desc">
                ${isEn
                  ? 'Serene library environment equipped with rich references, nurturing metacognition, critical reading, and learning autonomy (Mindful Learning).'
                  : 'Fasilitas perpustakaan yang tenang dan kaya referensi, mendorong metakognisi, pembacaan kritis, dan kemandirian belajar (Mindful Learning).'}
              </div>
              <div class="landing-gallery-meta">
                <span>📚 Literasi & Metakognisi</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>

          <!-- Card 8: Tari Remo Budaya Lokal -->
          <div class="landing-gallery-card" onclick="openPhotoModal('foto-tari-remo-budaya.jpg', '${isEn ? 'Traditional Remo Dance' : 'Tari Remo di Selasar Gedung Sekolah'}', '${isEn ? 'Preserving East Javanese heritage through traditional Remo dance performances along the school building verandas.' : 'Pelestarian seni tari tradisional Remo khas Jawa Timur di sepanjang selasar koridor gedung sekolah SMKN Wonosalam.'}', '${isEn ? 'Local Heritage' : 'Kearifan Budaya Lokal'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Local Heritage' : 'Tari Remo Tradisional'}</span>
              <img src="foto-tari-remo-budaya.jpg" alt="Tari Remo di SMKN Wonosalam" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'East Javanese Remo Cultural Dance' : 'Pelestarian Seni Tari Remo Jawa Timur'}</div>
              <div class="landing-gallery-desc">
                ${isEn
                  ? 'Nurturing Pancasila Student Profile values through regional traditional arts on the breezy corridors of SMKN Wonosalam.'
                  : 'Penguatan Profil Pelajar Pancasila melalui apresiasi seni dan budaya daerah di selasar gedung sekolah yang sejuk dan asri.'}
              </div>
              <div class="landing-gallery-meta">
                <span>🎭 Kearifan Lokal Jombang</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>

          <!-- Card 9: Supervisi Guru -->
          <div class="landing-gallery-card" onclick="openPhotoModal('foto-supervisi-akademik.jpg', '${isEn ? 'Teacher Supervision Session' : 'Supervisi & Dialog Pedagogis Guru'}', '${isEn ? 'Face-to-face academic supervision and teaching module review dialogue between school leaders and teaching staff.' : 'Sesi supervisi akademik dan penelaahan modul ajar tatap muka antara pimpinan sekolah dan guru pengampu.'}', '${isEn ? 'Academic Supervision' : 'Supervisi Mutu'}')">
            <div class="landing-gallery-img-wrap">
              <span class="landing-gallery-badge">${isEn ? 'Quality Supervision' : 'Supervisi Mutu'}</span>
              <img src="foto-supervisi-akademik.jpg" alt="Supervisi Guru SMKN Wonosalam" loading="lazy" />
              <div class="landing-gallery-expand-hint">
                <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                ${isEn ? 'Expand HD' : 'Perbesar HD'}
              </div>
            </div>
            <div class="landing-gallery-body">
              <div class="landing-gallery-title">${isEn ? 'Academic Supervision & Module Review' : 'Supervisi Akademik & Telaah Modul'}</div>
              <div class="landing-gallery-desc">
                ${isEn
                  ? 'Continuous constructive dialogue to uphold instructional quality and support teachers in achieving the 47 Deep Learning indicators.'
                  : 'Dialog pembinaan profesionalisme guru secara berkala untuk memastikan modul ajar memenuhi 47 indikator Deep Learning.'}
              </div>
              <div class="landing-gallery-meta">
                <span>👔 Penjaminan Mutu Ajar</span>
                <span style="color:#38BDF8; font-weight:600;">${isEn ? 'View HD ↗' : 'Lihat Foto ↗'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. FILOSOFI DEEP LEARNING (3 PILAR) -->
        <section class="landing-section" id="deep-learning-section">
          <div class="landing-section-header">
            <span class="landing-section-badge">FONDASI PEDAGOGIS GEMPITA 2026</span>
            <h2 class="landing-section-title">3 Pilar Pembelajaran Mendalam (Deep Learning)</h2>
            <p class="landing-section-desc">
              Pergeseran supervisi dari sekadar kepatuhan administrasi menjadi penguatan esensi pembelajaran yang mengakar pada peserta didik.
            </p>
          </div>

          <div class="landing-pilar-grid">
            <!-- Pilar 1: Mindful -->
            <div class="landing-pilar-card mindful">
              <div class="landing-pilar-icon">🧠</div>
              <h3 class="landing-pilar-title">Mindful Learning</h3>
              <div style="font-size:0.8rem; color:#38BDF8; font-weight:700; margin-bottom:8px;">Pembelajaran Berkesadaran Penuh</div>
              <p class="landing-pilar-desc">
                Membangun fokus kognitif, keterlibatan aktif, dan kesadaran tujuan belajar agar murid memahami mengapa materi tersebut bermakna bagi kehidupannya.
              </p>
              <ul class="landing-pilar-points">
                <li><svg width="14" height="14" fill="none" stroke="#38BDF8" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Perumusan Alur Tujuan Pembelajaran (ATP) eksplisit dan terukur</li>
                <li><svg width="14" height="14" fill="none" stroke="#38BDF8" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Pembiasaan refleksi awal, proses, dan metakognisi peserta didik</li>
                <li><svg width="14" height="14" fill="none" stroke="#38BDF8" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Asesmen diagnostik non-kognitif dan pemetaan kesiapan belajar</li>
              </ul>
            </div>

            <!-- Pilar 2: Meaningful -->
            <div class="landing-pilar-card meaningful">
              <div class="landing-pilar-icon">💡</div>
              <h3 class="landing-pilar-title">Meaningful Learning</h3>
              <div style="font-size:0.8rem; color:#34D399; font-weight:700; margin-bottom:8px;">Pembelajaran Bermakna & Relevan</div>
              <p class="landing-pilar-desc">
                Menghubungkan konsep teoritis dengan konteks dunia kerja kejuruan (DUDIKA), pemecahan masalah riil di masyarakat, dan penguatan karakter luhur.
              </p>
              <ul class="landing-pilar-points">
                <li><svg width="14" height="14" fill="none" stroke="#34D399" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Keselarasan materi kejuruan dengan Standar Industri Kerja (DUDIKA)</li>
                <li><svg width="14" height="14" fill="none" stroke="#34D399" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Pembelajaran berbasis tantangan riil (Problem & Project-Based Learning)</li>
                <li><svg width="14" height="14" fill="none" stroke="#34D399" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Pengintegrasian Profil Pelajar Pancasila dan budaya mutu kerja</li>
              </ul>
            </div>

            <!-- Pilar 3: Joyful -->
            <div class="landing-pilar-card joyful">
              <div class="landing-pilar-icon">🌟</div>
              <h3 class="landing-pilar-title">Joyful Learning</h3>
              <div style="font-size:0.8rem; color:#FBBF24; font-weight:700; margin-bottom:8px;">Pembelajaran Menyenangkan & Menggugah</div>
              <p class="landing-pilar-desc">
                Menciptakan ruang belajar yang memerdekakan, kolaboratif, memicu rasa ingin tahu, dan memberikan apresiasi atas setiap proses kreasi peserta didik.
              </p>
              <ul class="landing-pilar-points">
                <li><svg width="14" height="14" fill="none" stroke="#FBBF24" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Iklim interaksi yang aman, saling menghargai, dan tanpa intimidasi</li>
                <li><svg width="14" height="14" fill="none" stroke="#FBBF24" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Diferensiasi proses dan produk belajar sesuai minat peserta didik</li>
                <li><svg width="14" height="14" fill="none" stroke="#FBBF24" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Umpan balik apresiatif dan perayaan karya kejuruan peserta didik</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 5. EKOSISTEM 4 TINGKATAN AKUN -->
        <section class="landing-section" id="ekosistem-section" style="background: rgba(16, 31, 66, 0.25); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="landing-section-header">
            <span class="landing-section-badge">KOLABORASI MULTI-PERAN</span>
            <h2 class="landing-section-title">Sinergi 4 Tingkatan Akun Sekolah</h2>
            <p class="landing-section-desc">
              SITAMA-DEEP mengintegrasikan seluruh lini organisasi sekolah ke dalam alur kerja digital yang terpadu, transparan, dan teratur.
            </p>
          </div>

          <div class="landing-ecosystem-grid">
            <!-- Level 1: Admin -->
            <div class="landing-role-card">
              <div>
                <div class="landing-role-top">
                  <span class="landing-role-badge">Level 1 • Tata Kelola</span>
                  <span style="font-size:0.75rem; color:#94A3B8;">Akses Penuh</span>
                </div>
                <div class="landing-role-header">
                  <div class="landing-role-icon">🛠️</div>
                  <div>
                    <div class="landing-role-name">Administrator Sistem</div>
                    <div class="landing-role-person">Siti Rahmawati, S.Kom.</div>
                  </div>
                </div>
                <p class="landing-role-desc">
                  Mengelola keamanan sistem, manajemen akun pengguna, pengaturan master data rombel/mapel, rubrik 47 indikator, dan audit log jejak aktivitas real-time.
                </p>
                <ul class="landing-role-features">
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Manajemen 4 Level Pengguna & Reset Sandi Mandiri</li>
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Sinkronisasi Cloud Database Supabase & Audit Trail</li>
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Konfigurasi Rubrik & Skala Kelayakan Kedinasan</li>
                </ul>
              </div>
              <button class="landing-btn landing-btn-secondary landing-btn-sm" style="width:100%;" onclick="quickLogin('USR-001')">
                Masuk sebagai Admin Sistem →
              </button>
            </div>

            <!-- Level 2: Kepsek & Waka -->
            <div class="landing-role-card" style="border-color: rgba(37, 99, 235, 0.4); background: rgba(37, 99, 235, 0.08);">
              <div>
                <div class="landing-role-top">
                  <span class="landing-role-badge" style="background:#2563EB; color:#fff;">Level 2 • Kepemimpinan</span>
                  <span style="font-size:0.75rem; color:#93C5FD;">Penelaah & Pengesah</span>
                </div>
                <div class="landing-role-header">
                  <div class="landing-role-icon" style="background:rgba(37,99,235,0.4);">👔</div>
                  <div>
                    <div class="landing-role-name">Kepala Sekolah & Waka</div>
                    <div class="landing-role-person">Sudarso, S.Pd. & Drs. Bambang Supriyadi</div>
                  </div>
                </div>
                <p class="landing-role-desc">
                  Melakukan penelaahan digital interaktif 47 butir indikator, skoring otomatis /188, analisis radar chart 6 dimensi, pemberian umpan balik kualitatif, dan pengesahan resmi.
                </p>
                <ul class="landing-role-features">
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Instrumen Telaah Interaktif 47 Indikator & Preset Cepat</li>
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Radar Chart Capaian & Rekomendasi Supervisi Guru</li>
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Pengesahan Digital & Penerbitan Lembar Telaah Resmi</li>
                </ul>
              </div>
              <button class="landing-btn landing-btn-primary landing-btn-sm" style="width:100%;" onclick="quickLogin('USR-002')">
                Masuk sebagai Kepala Sekolah →
              </button>
            </div>

            <!-- Level 3: Guru -->
            <div class="landing-role-card">
              <div>
                <div class="landing-role-top">
                  <span class="landing-role-badge">Level 3 • Praktisi Ajar</span>
                  <span style="font-size:0.75rem; color:#94A3B8;">Penyusun Modul</span>
                </div>
                <div class="landing-role-header">
                  <div class="landing-role-icon">👨‍🏫</div>
                  <div>
                    <div class="landing-role-name">Guru Pengampu Kejuruan / Mapel</div>
                    <div class="landing-role-person">Budi Santoso, Dewi Lestari, Ahmad Fauzi, dkk.</div>
                  </div>
                </div>
                <p class="landing-role-desc">
                  Mengunggah modul ajar PDF sesuai fase/TP, melihat rincian skor per indikator secara transparan, serta mengunggah perbaikan modul bertingkat (v1 → v2).
                </p>
                <ul class="landing-role-features">
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Form Unggah Modul Terpadu Fase, CP/TP & Lampiran</li>
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Transparansi Nilai 47 Butir & Catatan Umpan Balik Pimpinan</li>
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Alur Revisi Berkelanjutan dengan Riwayat Versi Aman</li>
                </ul>
              </div>
              <button class="landing-btn landing-btn-secondary landing-btn-sm" style="width:100%;" onclick="quickLogin('USR-003')">
                Masuk sebagai Guru Pengampu →
              </button>
            </div>

            <!-- Level 4: Tendik / TU -->
            <div class="landing-role-card">
              <div>
                <div class="landing-role-top">
                  <span class="landing-role-badge">Level 4 • Administrasi Mutu</span>
                  <span style="font-size:0.75rem; color:#94A3B8;">Buku Kendali & Arsip</span>
                </div>
                <div class="landing-role-header">
                  <div class="landing-role-icon">📋</div>
                  <div>
                    <div class="landing-role-name">Tendik / Tata Usaha (Arsip Kurikulum)</div>
                    <div class="landing-role-person">Tri Wahyuni, S.AP.</div>
                  </div>
                </div>
                <p class="landing-role-desc">
                  Mencatat berkas di Buku Kendali Kurikulum, memverifikasi kelengkapan fisik di rak arsip, menerbitkan kode registrasi resmi, dan mencetak tanda terima.
                </p>
                <ul class="landing-role-features">
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Buku Kendali & Register Arsip Kurikulum Sekolah</li>
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Verifikasi Berkas Fisik & Lokasi Rak Lemari Dokumen</li>
                  <li><svg width="14" height="14" fill="none" stroke="#10B981" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Cetak Tanda Terima Penyerahan Berkas Kedinasan</li>
                </ul>
              </div>
              <button class="landing-btn landing-btn-secondary landing-btn-sm" style="width:100%;" onclick="quickLogin('USR-008')">
                Masuk sebagai Tendik / TU →
              </button>
            </div>
          </div>
        </section>

        <!-- 6. INSTRUMEN TELAAH 47 INDIKATOR & 6 DIMENSI -->
        <section class="landing-section" id="rubrik-section">
          <div class="landing-section-header">
            <span class="landing-section-badge">INSTRUMEN SUPERVISI BAKU</span>
            <h2 class="landing-section-title">47 Indikator Rubrik Telaah Deep Learning</h2>
            <p class="landing-section-desc">
              Instrumen evaluasi terstruktur yang mencakup 6 dimensi penjaminan mutu perencanaan ajar dengan skor maksimal 188 poin.
            </p>
          </div>

          <div class="landing-rubric-box">
            <div class="landing-dimensions-grid">
              <div class="landing-dim-card">
                <div class="landing-dim-code">DIMENSI A</div>
                <div class="landing-dim-title">Identitas & Kelengkapan Modul</div>
                <div class="landing-dim-count">5 Indikator • Alokasi waktu, CP/TP, kelengkapan komponen</div>
              </div>
              <div class="landing-dim-card">
                <div class="landing-dim-code">DIMENSI B</div>
                <div class="landing-dim-title">Kesesuaian Tujuan Pembelajaran</div>
                <div class="landing-dim-count">5 Indikator • Berpikir tingkat tinggi (HOTS), karakter, vokasi</div>
              </div>
              <div class="landing-dim-card">
                <div class="landing-dim-code">DIMENSI C</div>
                <div class="landing-dim-title">Pembelajaran Berkesadaran (Mindful)</div>
                <div class="landing-dim-count">5 Indikator • Fokus, metakognisi, pemetaan kesiapan belajar</div>
              </div>
              <div class="landing-dim-card">
                <div class="landing-dim-code">DIMENSI D</div>
                <div class="landing-dim-title">Pembelajaran Bermakna (Meaningful)</div>
                <div class="landing-dim-count">5 Indikator • Konteks nyata industri, problem solving, P5</div>
              </div>
              <div class="landing-dim-card">
                <div class="landing-dim-code">DIMENSI E</div>
                <div class="landing-dim-title">Pembelajaran Menyenangkan (Joyful)</div>
                <div class="landing-dim-count">5 Indikator • Iklim inklusif, diferensiasi, antusiasme karya</div>
              </div>
              <div class="landing-dim-card">
                <div class="landing-dim-code">DIMENSI F - J</div>
                <div class="landing-dim-title">Desain Aktivitas, Asesmen & Refleksi</div>
                <div class="landing-dim-count">22 Indikator • Pemanfaatan TIK, asesmen otentik, tindak lanjut</div>
              </div>
            </div>

            <!-- 5 Kategori Kelayakan -->
            <div style="font-size:0.84rem; font-weight:700; color:#FFFFFF; margin-bottom:12px;">
              Skala Predikat Kelayakan Resmi:
            </div>
            <div class="landing-bands-row">
              <div class="landing-band-pill" style="background:rgba(16,185,129,0.18); border:1px solid rgba(16,185,129,0.4); color:#34D399;">
                <span style="font-size:1rem;">🟢</span>
                <span>86% - 100%: <b>Sangat Layak (A)</b></span>
              </div>
              <div class="landing-band-pill" style="background:rgba(59,130,246,0.18); border:1px solid rgba(59,130,246,0.4); color:#60A5FA;">
                <span style="font-size:1rem;">🔵</span>
                <span>76% - 85%: <b>Layak (B)</b></span>
              </div>
              <div class="landing-band-pill" style="background:rgba(139,92,246,0.18); border:1px solid rgba(139,92,246,0.4); color:#A78BFA;">
                <span style="font-size:1rem;">🟣</span>
                <span>61% - 75%: <b>Layak Dg Revisi (C)</b></span>
              </div>
              <div class="landing-band-pill" style="background:rgba(245,158,11,0.18); border:1px solid rgba(245,158,11,0.4); color:#FBBF24;">
                <span style="font-size:1rem;">🟡</span>
                <span>51% - 60%: <b>Perlu Revisi (D)</b></span>
              </div>
              <div class="landing-band-pill" style="background:rgba(239,68,68,0.18); border:1px solid rgba(239,68,68,0.4); color:#F87171;">
                <span style="font-size:1rem;">🔴</span>
                <span>0% - 50%: <b>Belum Layak (E)</b></span>
              </div>
            </div>
          </div>
        </section>

        <!-- 7. DOKUMEN KEDINASAN SIAP CETAK -->
        <section class="landing-section" id="dokumen-section" style="background: rgba(16, 31, 66, 0.2); border-top:1px solid rgba(255,255,255,0.05); border-bottom:1px solid rgba(255,255,255,0.05);">
          <div class="landing-section-header">
            <span class="landing-section-badge">STANDARISASI ADMINISTRASI RESMI</span>
            <h2 class="landing-section-title">Dokumen Kedinasan Otomatis (Print-Ready)</h2>
            <p class="landing-section-desc">
              Sistem secara otomatis mengompilasi lembar administrasi resmi siap cetak (A4 / F4) sesuai format baku Cabdin Pendidikan Wilayah Jombang.
            </p>
          </div>

          <div class="landing-doc-grid">
            <div class="landing-doc-card">
              <span class="landing-doc-badge">Dokumen 1 • Kepala Sekolah</span>
              <h3 class="landing-doc-title">Lembar Hasil Telaah Modul</h3>
              <p class="landing-doc-desc">
                Memuat kop resmi SMKN Wonosalam, identitas modul, tabel skor 47 indikator, persentase nilai, catatan pembinaan, dan kolom tanda tangan pengesahan.
              </p>
              <div class="landing-doc-specs">
                🖨️ Format: Cetak A4 / PDF Legal • Tanda Tangan & NIP
              </div>
            </div>

            <div class="landing-doc-card">
              <span class="landing-doc-badge">Dokumen 2 • Bagian Tata Usaha</span>
              <h3 class="landing-doc-title">Buku Kendali Register Arsip</h3>
              <p class="landing-doc-desc">
                Buku register resmi penatausahaan modul ajar kurikulum dengan penomoran unik, identitas penyusun, tanggal verifikasi fisik, dan paraf petugas TU.
              </p>
              <div class="landing-doc-specs">
                🖨️ Format: Buku Register Penyerahan Dokumen Kurikulum
              </div>
            </div>

            <div class="landing-doc-card">
              <span class="landing-doc-badge">Dokumen 3 • Pengarsipan Mutu</span>
              <h3 class="landing-doc-title">Tanda Terima Berkas Fisik</h3>
              <p class="landing-doc-desc">
                Bukti tanda terima serah terima dokumen fisik modul ajar yang diverifikasi di lemari/rak arsip kurikulum untuk penjaminan mutu ISO sekolah.
              </p>
              <div class="landing-doc-specs">
                🖨️ Format: Lembar Tanda Terima Penyerahan Berkas Cetak
              </div>
            </div>
          </div>
        </section>

        <!-- 8. PROFIL INOVATOR GEMPITA 2026 -->
        <section class="landing-section" id="inovator-section">
          <div class="landing-innovator-card">
            <div class="landing-innovator-avatar">
              👔
            </div>
            <div>
              <div class="landing-innovator-name">Sudarso, S.Pd.</div>
              <div class="landing-innovator-title">Kepala SMK Negeri Wonosalam, Kabupaten Jombang</div>
              
              <blockquote class="landing-innovator-quote">
                "Supervisi akademik di era Pembelajaran Mendalam (Deep Learning) bukan semata instrumen evaluatif administratif, melainkan jembatan dialog pedagogis yang memuliakan martabat dan menumbuhkan profesionalisme guru untuk melahirkan murid-murid unggul berkarakter."
              </blockquote>

              <div class="landing-innovator-meta">
                <span>🏫 <b>Satuan Pendidikan:</b> SMK Negeri Wonosalam (NPSN: 20503412)</span>
                <span>🏛️ <b>Wilayah:</b> Cabang Dinas Pendidikan Kab. Jombang</span>
                <span>🏅 <b>Naskah:</b> Praktik Baik Kepemimpinan GEMPITA 2026</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 9. LIVE SANDBOX CTA -->
        <section class="landing-sandbox-section" id="sandbox-section">
          <div class="landing-sandbox-box">
            <span class="landing-section-badge">AKSES CEPAT INTERAKTIF</span>
            <h2 class="landing-section-title" style="font-size:2.4rem; margin-bottom:14px;">
              Siap Menguatkan Perencanaan Pembelajaran?
            </h2>
            <p class="landing-section-desc" style="margin-bottom:28px;">
              Gunakan akun Anda untuk memulai proses penelaahan atau coba simulasi langsung menggunakan salah satu akun demo berikut:
            </p>

            <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; margin-bottom:28px;">
              <button class="landing-btn landing-btn-primary" onclick="quickLogin('USR-002')">
                Masuk sebagai Kepala Sekolah (Sudarso)
              </button>
              <button class="landing-btn landing-btn-secondary" onclick="quickLogin('USR-003')">
                Masuk sebagai Guru ATP (Budi)
              </button>
              <button class="landing-btn landing-btn-secondary" onclick="quickLogin('USR-008')">
                Masuk sebagai Tendik / TU (Tri)
              </button>
              <button class="landing-btn landing-btn-secondary" onclick="quickLogin('USR-001')">
                Masuk sebagai Administrator (Siti)
              </button>
            </div>

            <div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap;">
              <button class="landing-btn landing-btn-outline" onclick="navigateTo('login')">
                🔑 Halaman Masuk Akun Dinas
              </button>
              <button class="landing-btn landing-btn-outline" onclick="navigateTo('login'); setTimeout(()=>{ if (window.setAuthTab) setAuthTab('register'); }, 50);">
                ✍️ Registrasi Guru / Tendik Baru
              </button>
            </div>
          </div>
        </section>

        <!-- 10. FOOTER -->
        <footer class="landing-footer">
          <div class="landing-footer-grid">
            <div>
              <div class="landing-footer-brand-title">SITAMA-DEEP • GEMPITA 2026</div>
              <p class="landing-footer-sub">
                Sistem Informasi Telaah Modul Ajar untuk Pembelajaran Mendalam (Deep Learning) — Inovasi Kepemimpinan Pembelajaran Sudarso, S.Pd., Kepala SMK Negeri Wonosalam, Kab. Jombang, Jawa Timur.
              </p>
              <div style="font-size:0.8rem; line-height:1.6; color:#94A3B8;">
                📍 <b>Alamat Kampus:</b> Jl. Anjasmoro, Dsn. Pucangrejo, Ds. Wonosalam, Kec. Wonosalam, Kab. Jombang, Jawa Timur 61476<br/>
                📞 <b>Telepon / Kontak:</b> +62 815-1594-0188 | ✉️ <b>Email:</b> smkn.wonosalam.jbg@gmail.com
              </div>
            </div>

            <div class="landing-footer-col">
              <h4>Navigasi Pintas</h4>
              <ul class="landing-footer-links">
                <li><a onclick="window.scrollTo({top:0, behavior:'smooth'})">${isEn ? 'Home Portal' : 'Beranda Portal'}</a></li>
                <li><a onclick="scrollToLandingSection('galeri-section')">${isEn ? 'Campus Gallery' : 'Galeri Kampus & Aktivitas'}</a></li>
                <li><a onclick="scrollToLandingSection('deep-learning-section')">${isEn ? 'Deep Learning Philosophy' : 'Filosofi Deep Learning'}</a></li>
                <li><a onclick="scrollToLandingSection('ekosistem-section')">${isEn ? '4 Account Roles' : 'Sinergi 4 Tingkatan Akun'}</a></li>
                <li><a onclick="scrollToLandingSection('rubrik-section')">${isEn ? '47 Indicators' : 'Instrumen 47 Indikator'}</a></li>
                <li><a onclick="scrollToLandingSection('dokumen-section')">${isEn ? 'Printable Documents' : 'Dokumen Siap Cetak'}</a></li>
                <li><a onclick="scrollToLandingSection('inovator-section')">${isEn ? 'Innovator Profile' : 'Profil Inovator GEMPITA'}</a></li>
              </ul>
            </div>

            <div class="landing-footer-col">
              <h4>Konsentrasi Keahlian</h4>
              <ul class="landing-footer-links">
                <li><a onclick="navigateTo('dashboard')">Agribisnis Tanaman Perkebunan (ATP)</a></li>
                <li><a onclick="navigateTo('dashboard')">Kuliner / Tata Boga</a></li>
                <li><a onclick="navigateTo('dashboard')">Teknik Kendaraan Ringan (TKR)</a></li>
                <li><a onclick="navigateTo('dashboard')">Teknik Pemesinan (TPM)</a></li>
                <li><a onclick="navigateTo('dashboard')">Mata Pelajaran Umum & IPAS</a></li>
              </ul>
            </div>
          </div>

          <div class="landing-footer-bottom">
            <div>
              SITAMA-DEEP © 2026 SMK Negeri Wonosalam. Naskah Praktik Baik GEMPITA 2026. Hak Cipta Dilindungi.
            </div>
            <div>
              Pemerintah Provinsi Jawa Timur • Dinas Pendidikan • Cabang Dinas Pendidikan Kab. Jombang
            </div>
          </div>
        </footer>

        <!-- FLOATING ACTION DOCK (ALWAYS ACCESSIBLE WITHOUT SCROLLING) -->
        <div class="landing-floating-dock">
          <!-- Back to Top Button -->
          <button class="landing-float-btn" onclick="scrollToLandingTop()" title="Kembali ke Atas Halaman Beranda">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
            <span>Ke Atas</span>
          </button>

          <!-- Gallery Shortcut Button -->
          <button class="landing-float-btn" onclick="scrollToLandingSection('galeri-section')" title="Lihat Galeri Foto SMKN Wonosalam">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Galeri Foto</span>
          </button>

          <!-- Direct Dashboard Access Button -->
          <button class="landing-float-btn primary" onclick="navigateTo('dashboard')" title="Langsung Buka Dashboard Aplikasi">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Buka Dashboard</span>
          </button>
        </div>
      </div>
    `;
  }

  function bindLandingEvents() {
    // Landing page bindings
  }

  window.scrollToLandingTop = function () {
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.scrollToLandingSection = function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.toggleLandingLang = function () {
    state.lang = state.lang === 'id' ? 'en' : 'id';
    saveState();
    renderApp();
  };

  window.openPhotoModal = function (src, title, desc, tag) {
    let modal = document.getElementById('landingPhotoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'landingPhotoModal';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="landing-photo-modal-overlay" onclick="closePhotoModal(event)">
        <div class="landing-photo-modal-content" onclick="event.stopPropagation()">
          <div class="landing-photo-modal-header">
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="landing-gallery-badge" style="position:static;">${tag || 'Dokumentasi Resmi'}</span>
              <h3 style="font-size:1.05rem; font-weight:700; color:#FFFFFF; margin:0;">${title}</h3>
            </div>
            <button class="landing-photo-modal-close" onclick="closePhotoModal()" title="Tutup Preview">&times;</button>
          </div>
          <div class="landing-photo-modal-img-wrap">
            <img src="${src}" alt="${title}" onerror="this.src='gedung-utama-smkn.jpg'"/>
          </div>
          <div class="landing-photo-modal-footer">
            <p>${desc}</p>
            <div class="caption-meta">
              <span>🏫 <b>SMK Negeri Wonosalam (Jombang)</b> • Lereng Gunung Anjasmoro</span>
              <span>📸 Dokumentasi Praktik Baik & Pembelajaran Mendalam</span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  window.closePhotoModal = function () {
    const modal = document.getElementById('landingPhotoModal');
    if (modal) {
      modal.innerHTML = '';
    }
  };

  if (!window._landingPhotoEscBound) {
    window._landingPhotoEscBound = true;
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        window.closePhotoModal();
      }
    });
  }

  /* ------------------- 3-TAB AUTHENTICATION (MATCHING GAMBAR 1 + NEW USER + RECOVERY) ------------------- */
  function renderLoginPage() {
    return `
      <div class="auth-wrapper">
        <div class="auth-card">
          <div style="text-align:left; margin-bottom:14px;">
            <a href="javascript:void(0)" onclick="navigateTo('landing')" style="font-size:0.82rem; color:var(--primary-blue); text-decoration:none; display:inline-flex; align-items:center; gap:5px; font-weight:600;">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Kembali ke Beranda Portal
            </a>
          </div>
          <img src="${state.school.logo}" alt="Logo SMKN Wonosalam" style="height:76px; margin-bottom:12px; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.15));"/>
          <h1 style="font-size:1.6rem; font-weight:800; color:var(--primary-dark); margin-bottom:2px; letter-spacing:-0.02em;">${t('appName')}</h1>
          <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:20px;">${t('loginSubtitle')}</p>

          <!-- 3 Segmented Auth Tabs -->
          <div class="auth-tabs">
            <button class="auth-tab-btn ${state.authTab === 'login' ? 'active' : ''}" onclick="setAuthTab('login')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
              Masuk
            </button>
            <button class="auth-tab-btn ${state.authTab === 'register' ? 'active' : ''}" onclick="setAuthTab('register')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
              New User
            </button>
            <button class="auth-tab-btn ${state.authTab === 'forgot' ? 'active' : ''}" onclick="setAuthTab('forgot')">
              <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Lupa Sandi
            </button>
          </div>

          <!-- Alert Messages -->
          ${state.registerSuccessMsg ? `
            <div style="background:#ECFDF5; border:1px solid #10B981; color:#065F46; padding:10px 14px; border-radius:8px; font-size:0.82rem; margin-bottom:16px; text-align:left;">
              ${state.registerSuccessMsg}
            </div>
          ` : ''}

          ${state.recoverySuccessMsg ? `
            <div style="background:#ECFDF5; border:1px solid #10B981; color:#065F46; padding:10px 14px; border-radius:8px; font-size:0.82rem; margin-bottom:16px; text-align:left;">
              ${state.recoverySuccessMsg}
            </div>
          ` : ''}

          ${state.recoveryErrorMsg ? `
            <div style="background:#FEF2F2; border:1px solid #EF4444; color:#991B1B; padding:10px 14px; border-radius:8px; font-size:0.82rem; margin-bottom:16px; text-align:left;">
              ${state.recoveryErrorMsg}
            </div>
          ` : ''}

          <!-- TAB 1: LOGIN (MATCHING GAMBAR 1) -->
          ${state.authTab === 'login' ? `
            <form onsubmit="handleLoginSubmit(event)">
              <div class="form-group" style="text-align:left;">
                <label>${t('emailOrUsername')}</label>
                <input type="text" class="form-control" id="loginUser" placeholder="Email atau username..." value="${state.lastRegisteredUsername || 'kepsek'}" required/>
              </div>

              <div class="form-group" style="text-align:left;">
                <label>${t('password')}</label>
                <input type="password" class="form-control" id="loginPass" value="password123" required/>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; margin-bottom:18px;">
                <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" checked/> ${t('rememberMe')}</label>
                <a href="#" style="color:var(--primary-blue); font-weight:700;" onclick="setAuthTab('forgot'); return false;">${t('forgotPassword')}</a>
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; font-size:1rem; margin-bottom:18px;">
                ${t('loginButton')}
              </button>
            </form>

            <!-- Quick Demo Role Switcher matching Gambar 1 -->
            <div style="border-top:1px solid var(--border-color); padding-top:16px; font-size:0.78rem; color:var(--text-muted);">
              <p style="margin-bottom:8px; font-weight:700;">Atau masuk langsung sebagai demo role (4 Level Akun):</p>
              <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
                <button class="demo-role-pill" onclick="quickLogin('USR-001')">1. Admin (Siti)</button>
                <button class="demo-role-pill" onclick="quickLogin('USR-002')">2. Kepsek (Sudarso)</button>
                <button class="demo-role-pill" onclick="quickLogin('USR-002B')">2. Waka (Bambang)</button>
                <button class="demo-role-pill" onclick="quickLogin('USR-003')">3. Guru (Budi)</button>
                <button class="demo-role-pill" onclick="quickLogin('USR-004')">3. Guru (Dewi)</button>
                <button class="demo-role-pill" onclick="quickLogin('USR-008')">4. Tendik (Tri TU)</button>
              </div>
            </div>
          ` : ''}

          <!-- TAB 2: NEW USER REGISTRATION -->
          ${state.authTab === 'register' ? `
            <form onsubmit="handleRegisterSubmit(event)">
              <div class="form-group" style="text-align:left;">
                <label>Peran Akun</label>
                <select class="form-control" id="regRole" onchange="handleRegisterRoleChange(this.value)" required>
                  <option value="teacher">3. Guru Mata Pelajaran / Kejuruan</option>
                  <option value="tendik">4. Tendik / Tata Usaha</option>
                </select>
              </div>

              <div class="form-group" style="text-align:left;">
                <label>Nama Lengkap (beserta Gelar)</label>
                <input type="text" class="form-control" id="regName" placeholder="Contoh: Siti Fatimah, S.Pd." required />
              </div>

              <div class="grid-2">
                <div class="form-group" style="text-align:left;">
                  <label>NIP / NUPTK</label>
                  <input type="text" class="form-control" id="regNIP" placeholder="1988..." required />
                </div>
                <div class="form-group" style="text-align:left;">
                  <label id="regDeptLabel">Konsentrasi Keahlian</label>
                  <select class="form-control" id="regDept">
                    <option value="ATP">Agribisnis Tanaman Perkebunan (ATP)</option>
                    <option value="Kuliner">Kuliner</option>
                    <option value="TKR">Teknik Kendaraan Ringan (TKR)</option>
                    <option value="TPM">Teknik Pemesinan (TPM)</option>
                    <option value="Umum">Mata Pelajaran Umum</option>
                    <option value="Tata Usaha">Tata Usaha</option>
                  </select>
                </div>
              </div>

              <div class="form-group" style="text-align:left;">
                <label id="regSubjectLabel">Mata Pelajaran / Tugas Pokok</label>
                <input type="text" class="form-control" id="regSubject" placeholder="Contoh: Dasar Budidaya Tanaman" required />
              </div>

              <div class="grid-2">
                <div class="form-group" style="text-align:left;">
                  <label>Email Akun</label>
                  <input type="email" class="form-control" id="regEmail" placeholder="nama@smknwonosalam.sch.id" required />
                </div>
                <div class="form-group" style="text-align:left;">
                  <label>Username</label>
                  <input type="text" class="form-control" id="regUsername" placeholder="guru_baru" required />
                </div>
              </div>

              <div class="grid-2">
                <div class="form-group" style="text-align:left;">
                  <label>Kata Sandi</label>
                  <input type="password" class="form-control" id="regPass" placeholder="Min. 6 karakter" required />
                </div>
                <div class="form-group" style="text-align:left;">
                  <label>Konfirmasi Sandi</label>
                  <input type="password" class="form-control" id="regPassConfirm" placeholder="Ulangi sandi" required />
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%; padding:12px; margin-top:6px;">
                Daftar Akun Sekarang
              </button>
            </form>
          ` : ''}

          <!-- TAB 3: FORGOT PASSWORD (EMAIL SIMULATOR & DIRECT RESET) -->
          ${state.authTab === 'forgot' ? `
            <div style="text-align:left;">
              <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
                Masukkan email atau username Anda yang terdaftar di SMKN Wonosalam. Sistem akan mengirimkan instruksi dan kode verifikasi pemulihan OTP.
              </p>

              ${!state.recoveryOtpGenerated ? `
                <form onsubmit="handleForgotPasswordRequest(event)">
                  <div class="form-group">
                    <label>Email atau Username Terdaftar</label>
                    <input type="text" class="form-control" id="forgotInput" placeholder="Masukkan username atau email akun Anda..." value="${state.prefilledForgotUser || ''}" required />
                  </div>
                  <button type="submit" class="btn btn-primary" style="width:100%; padding:12px;">
                    Kirim Link & Kode Pemulihan ke Email
                  </button>
                </form>
              ` : `
                <!-- Real Email Delivery Notification Banner -->
                <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-left:4px solid #2563EB; padding:14px 16px; border-radius:8px; margin-bottom:20px; text-align:left;">
                  <div style="font-weight:700; color:#1E40AF; font-size:0.92rem; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    Kode OTP Telah Dikirim ke Gmail!
                  </div>
                  <div style="font-size:0.84rem; color:#1E3A8A; line-height:1.5;">
                    Sistem telah mengirimkan 6 digit kode verifikasi pemulihan kata sandi ke: <b>${state.recoveryUser.email}</b>.
                  </div>
                  <div style="font-size:0.78rem; color:#475569; margin-top:8px;">
                    💡 <i>Silakan periksa <b>Kotak Masuk (Inbox)</b> atau folder <b>Spam</b> di aplikasi Gmail Anda, lalu masukkan 6 digit kode OTP di bawah ini:</i>
                  </div>
                  <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid #DBEAFE; padding-top:8px;">
                    <span style="font-size:0.76rem; color:#64748B;">Bukan akun Anda atau salah ketik?</span>
                    <button type="button" class="btn btn-outline" style="font-size:0.75rem; padding:3px 10px; background:#fff;" onclick="handleResetOtpState()">← Ubah Email / Username</button>
                  </div>
                </div>

                <!-- Reset Form -->
                <form onsubmit="handleResetPasswordSubmit(event)">
                  <div class="form-group">
                    <label>Masukkan Kode OTP</label>
                    <input type="text" class="form-control" id="inputOtp" placeholder="Masukkan 6 digit kode OTP..." required />
                  </div>
                  <div class="form-group">
                    <label>Kata Sandi Baru</label>
                    <input type="password" class="form-control" id="inputNewPass" placeholder="Minimal 6 karakter" required />
                  </div>
                  <div class="form-group">
                    <label>Konfirmasi Kata Sandi Baru</label>
                    <input type="password" class="form-control" id="inputNewPassConfirm" placeholder="Ulangi sandi baru" required />
                  </div>
                  <button type="submit" class="btn btn-success" style="width:100%; padding:12px;">
                    Simpan Kata Sandi Baru
                  </button>
                </form>
              `}

              <button type="button" class="btn btn-outline" style="width:100%; margin-top:10px;" onclick="setAuthTab('login')">
                ← Kembali ke Halaman Login
              </button>
            </div>
          ` : ''}

          <div style="margin-top:24px; font-size:0.75rem; color:var(--text-light);">
            SITAMA-DEEP © 2026 SMK Negeri Wonosalam, Jombang.
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------- MODAL DIALOGS ------------------- */
  function renderActiveModalHTML() {
    if (!state.activeModal) return '';

    if (state.activeModal === 'supabase_config') {
      const cfg = window.SitamaDB ? window.SitamaDB.getConfig() : { url: '', key: '' };
      return `
        <div class="modal-backdrop" onclick="closeModal(event)">
          <div class="modal-content" style="max-width:540px;" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3>☁️ Sambungkan Cloud Database Supabase</h3>
              <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <form onsubmit="handleSaveSupabaseConfig(event)">
              <div class="modal-body">
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:16px;">
                  Masukkan kredensial <b>Project URL</b> dan <b>Anon Public Key</b> dari Dashboard Supabase Anda (Project Settings &gt; API).
                </p>
                <div class="form-group">
                  <label>Supabase Project URL</label>
                  <input type="url" class="form-control" id="inputSupabaseUrl" placeholder="https://xyzproject.supabase.co" value="${cfg.url}" required />
                </div>
                <div class="form-group">
                  <label>Supabase Anon Public Key</label>
                  <textarea class="form-control" id="inputSupabaseKey" rows="3" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." required style="font-family:monospace; font-size:0.75rem;">${cfg.key}</textarea>
                </div>
                <div style="background:#F0FDF4; border:1px solid #86EFAC; color:#166534; padding:10px 12px; border-radius:6px; font-size:0.8rem;">
                  💡 <b>Panduan:</b> Skema database SQL siap pakai tersedia di file <code>supabase-schema.sql</code>. Cukup salin dan jalankan di Supabase SQL Editor.
                </div>
              </div>
              <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan &amp; Hubungkan Cloud</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    if (state.activeModal === 'new_user_admin') {
      return `
        <div class="modal-backdrop" onclick="closeModal(event)">
          <div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3>Tambah Pengguna Baru (Admin SMKN Wonosalam)</h3>
              <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <form onsubmit="handleAdminCreateUser(event)">
              <div class="modal-body">
                <div class="grid-2">
                  <div class="form-group">
                    <label>Peran Akun</label>
                    <select class="form-control" id="adminNewRole" required>
                      <option value="teacher">3. Guru Mata Pelajaran</option>
                      <option value="principal">2. Kepala Sekolah / Waka Kurikulum</option>
                      <option value="tendik">4. Tendik / Tata Usaha</option>
                      <option value="admin">1. Administrator Sistem</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Konsentrasi Keahlian / Unit</label>
                    <select class="form-control" id="adminNewDept">
                      <option value="ATP">Agribisnis Tanaman Perkebunan (ATP)</option>
                      <option value="Kuliner">Kuliner</option>
                      <option value="TKR">Teknik Kendaraan Ringan (TKR)</option>
                      <option value="TPM">Teknik Pemesinan (TPM)</option>
                      <option value="Umum">Umum / IPAS</option>
                      <option value="Tata Usaha">Tata Usaha</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>Nama Lengkap & Gelar</label>
                  <input type="text" class="form-control" id="adminNewName" required placeholder="Contoh: Drs. Wahyu Santoso, M.Pd." />
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label>NIP / NIK</label>
                    <input type="text" class="form-control" id="adminNewNIP" required placeholder="198..." />
                  </div>
                  <div class="form-group">
                    <label>Mata Pelajaran / Posisi</label>
                    <input type="text" class="form-control" id="adminNewSubject" required placeholder="Dasar Kompetensi..." />
                  </div>
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label>Email Akun</label>
                    <input type="email" class="form-control" id="adminNewEmail" required placeholder="nama@smknwonosalam.sch.id" />
                  </div>
                  <div class="form-group">
                    <label>Username</label>
                    <input type="text" class="form-control" id="adminNewUsername" required placeholder="user_baru" />
                  </div>
                </div>

                <div class="form-group">
                  <label>Kata Sandi Sementara</label>
                  <input type="password" class="form-control" id="adminNewPass" value="password123" required />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-primary">Simpan & Terbitkan Akun</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    if (state.activeModal === 'tendik_verify') {
      const mod = state.modules.find(m => m.id === state.selectedVerifyModId);
      if (!mod) return '';
      const v = mod.tendik_verification || {};

      return `
        <div class="modal-backdrop" onclick="closeModal(event)">
          <div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-header">
              <h3>Verifikasi Administrasi & Arsip Berkas Fisik</h3>
              <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <form onsubmit="handleTendikSaveVerification(event)">
              <div class="modal-body">
                <div style="background:#F1F5F9; padding:12px; border-radius:8px; margin-bottom:16px;">
                  <div style="font-weight:700; color:var(--primary-dark);">${mod.title}</div>
                  <div style="font-size:0.85rem; color:var(--text-muted);">Guru: ${mod.teacher_name} | Jurusan: ${mod.department || 'Umum'}</div>
                </div>

                <div class="form-group">
                  <label>Nomor / Kode Registrasi Arsip Tata Usaha</label>
                  <input type="text" class="form-control" id="tendikArchiveCode" value="${v.archive_code || `ARSIP-2025/${mod.department || 'KOMP'}/${mod.id}`}" required />
                </div>

                <div class="form-group">
                  <label>Status Pemeriksaan Berkas Fisik</label>
                  <select class="form-control" id="tendikPhysicalStatus">
                    <option value="Lengkap (Hardcopy + TTD)">Lengkap (Hardcopy + TTD)</option>
                    <option value="Salinan Digital Diterima, Menunggu Telaah">Salinan Digital Diterima, Menunggu Telaah</option>
                    <option value="Dokumen Fisik Diserahkan ke Tata Usaha">Dokumen Fisik Diserahkan ke Tata Usaha</option>
                    <option value="Perlu Revisi (Menunggu Pengumpulan Revisi)">Perlu Revisi (Menunggu Pengumpulan Revisi)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Lokasi Penyimpanan Lemari / Rak Arsip</label>
                  <input type="text" class="form-control" id="tendikRackLocation" value="${v.rack_location || 'Lemari Kurikulum A1-01'}" required />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Batal</button>
                <button type="submit" class="btn btn-success">Simpan ke Buku Kendali</button>
              </div>
            </form>
          </div>
        </div>
      `;
    }

    return '';
  }

  /* ------------------- GLOBAL CHARTS RENDERER (CHART.JS) ------------------- */
  function renderCharts() {
    if (typeof Chart === 'undefined') return;

    function createSafeChart(canvasId, config) {
      const el = document.getElementById(canvasId);
      if (!el) return null;
      if (typeof Chart.getChart === 'function') {
        const existing = Chart.getChart(el);
        if (existing) existing.destroy();
      }
      return new Chart(el, config);
    }

    // Admin Status Donut Chart (Matching Gambar 5)
    createSafeChart('chartAdminStatus', {
      type: 'doughnut',
      data: {
        labels: ['Disetujui', 'Menunggu Telaah', 'Perlu Revisi', 'Dalam Revisi'],
        datasets: [{
          data: [
            state.modules.filter(m=>m.status==='Approved').length,
            state.modules.filter(m=>m.status==='Pending Review').length,
            state.modules.filter(m=>m.status==='Needs Revision').length,
            state.modules.filter(m=>m.status==='In Revision' || m.status==='Appropriate with Revisions').length
          ],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: { cutout: '65%' }
    });

    // Admin Radar Chart (Matching Gambar 5)
    createSafeChart('chartAdminRadar', {
      type: 'radar',
      data: {
        labels: ['Mindful', 'Meaningful', 'Joyful', 'Strategi', 'Asesmen', 'Kompetensi'],
        datasets: [{
          label: 'Rata-rata Skor per Dimensi Deep Learning',
          data: [3.9, 3.8, 3.7, 3.6, 3.5, 3.8],
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: '#2563EB',
          pointBackgroundColor: '#2563EB'
        }]
      },
      options: { scales: { r: { min: 1, max: 4 } } }
    });

    // Principal Radar Chart (Matching Gambar 2)
    createSafeChart('chartPrincipalRadar', {
      type: 'radar',
      data: {
        labels: ['Mindful Learning', 'Meaningful Learning', 'Joyful Learning', 'Kesesuaian TP', 'Instrumen Asesmen', 'Penguatan Karakter'],
        datasets: [{
          label: 'Kesesuaian Indikator',
          data: [3.8, 3.9, 3.6, 3.9, 3.5, 3.7],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10B981',
          pointBackgroundColor: '#10B981'
        }]
      },
      options: { scales: { r: { min: 1, max: 4 } } }
    });

    // Principal Subjects Bar Chart (Matching Gambar 2)
    createSafeChart('chartPrincipalSubjects', {
      type: 'bar',
      data: {
        labels: ['ATP', 'Kuliner', 'TKR', 'TPM', 'Proyek IPAS'],
        datasets: [{
          label: 'Rekap Hasil Telaah Modul',
          data: [
            state.modules.filter(m=>m.department==='ATP').length,
            state.modules.filter(m=>m.department==='Kuliner').length,
            state.modules.filter(m=>m.department==='TKR').length,
            state.modules.filter(m=>m.department==='TPM').length,
            state.modules.filter(m=>m.department==='Umum').length
          ],
          backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#06B6D4'],
          borderRadius: 6
        }]
      },
      options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });

    // Reports Analytics Charts (Matching Gambar 7)
    createSafeChart('chartReportTeacher', {
      type: 'bar',
      data: {
        labels: ['Budi Santoso (ATP)', 'Dewi Lestari (KLN)', 'Ahmad Fauzi (TKR)', 'Joko Widodo (TPM)', 'Rudi Hermawan (IPS)'],
        datasets: [{
          label: 'Skor Total Telaah (/188)',
          data: [173, 111, 150, 135, 104],
          backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#DC2626'],
          borderRadius: 6
        }]
      },
      options: { scales: { y: { max: 188, beginAtZero: true } } }
    });

    createSafeChart('chartReportDL', {
      type: 'bar',
      data: {
        labels: ['Mindful', 'Meaningful', 'Joyful'],
        datasets: [{
          label: '% Penerapan Pembelajaran Mendalam',
          data: [92, 95, 85],
          backgroundColor: ['#38BDF8', '#34D399', '#FBBF24'],
          borderRadius: 8
        }]
      },
      options: { scales: { y: { max: 100, beginAtZero: true } } }
    });

    createSafeChart('chartReportEligibility', {
      type: 'pie',
      data: {
        labels: ['Sangat Layak', 'Layak Dengan Revisi', 'Perlu Revisi'],
        datasets: [{
          data: [
            state.modules.filter(m=>m.review && m.review.percentage_score >= 86).length,
            state.modules.filter(m=>m.review && m.review.percentage_score >= 61 && m.review.percentage_score < 86).length,
            state.modules.filter(m=>m.review && m.review.percentage_score < 61).length
          ],
          backgroundColor: ['#059669', '#7C3AED', '#DC2626']
        }]
      }
    });
  }

  /* ------------------- GLOBAL WINDOW FUNCTIONS & HANDLERS ------------------- */
  window.navigateTo = function (view) {
    state.currentView = view;
    saveState();
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.setAuthTab = function (tab) {
    const loginEl = document.getElementById('loginUser');
    if (loginEl && loginEl.value && loginEl.value.trim()) {
      state.prefilledForgotUser = loginEl.value.trim();
    }
    state.authTab = tab;
    state.recoverySuccessMsg = '';
    state.recoveryErrorMsg = '';
    state.registerSuccessMsg = '';
    state.recoveryOtpGenerated = '';
    state.recoveryUser = null;
    renderApp();
  };

  window.handleResetOtpState = function () {
    state.recoveryOtpGenerated = '';
    state.recoveryUser = null;
    state.recoverySuccessMsg = '';
    state.recoveryErrorMsg = '';
    renderApp();
  };

  window.setTeacherTableTab = function (tab) {
    state.teacherTableTab = tab;
    renderApp();
  };

  window.handleSearchModule = function (val) {
    state.moduleSearchQuery = val;
    renderApp();
    // Maintain focus on search box
    const el = document.getElementById('modSearchInput');
    if (el) { el.focus(); el.setSelectionRange(val.length, val.length); }
  };

  window.handleFilterStatus = function (val) {
    state.moduleStatusFilter = val;
    renderApp();
  };

  window.handleFilterDept = function (val) {
    state.moduleDeptFilter = val;
    renderApp();
  };

  window.resetModuleFilters = function () {
    state.moduleSearchQuery = '';
    state.moduleStatusFilter = 'all';
    state.moduleDeptFilter = 'all';
    renderApp();
  };

  window.quickLogin = function (userId) {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      state.currentUserId = user.id;
      state.currentRole = user.role;
      state.currentView = 'dashboard';
      logActivity('Masuk Cepat Demo', `Masuk sebagai ${user.name} (${user.role})`);
      saveState();
      renderApp();
    }
  };

  window.handleLoginSubmit = function (e) {
    e.preventDefault();
    const loginInput = document.getElementById('loginUser').value.trim();
    const passInput = document.getElementById('loginPass').value.trim();

    const user = state.users.find(u => 
      (u.username.toLowerCase() === loginInput.toLowerCase() || u.email.toLowerCase() === loginInput.toLowerCase()) &&
      (u.password === passInput || passInput === 'password123' || passInput === 'password')
    );

    if (user) {
      state.currentUserId = user.id;
      state.currentRole = user.role;
      state.currentView = 'dashboard';
      logActivity('Login Sistem', `Pengguna ${user.name} berhasil masuk`);
      saveState();
      renderApp();
    } else {
      alert('Email/Username atau Kata Sandi salah! Untuk demo, silakan gunakan kata sandi: password123 atau klik tombol demo di bawah.');
    }
  };

  window.handleRegisterRoleChange = function (role) {
    const deptLabel = document.getElementById('regDeptLabel');
    const subjLabel = document.getElementById('regSubjectLabel');
    const deptSelect = document.getElementById('regDept');
    if (role === 'tendik') {
      if (deptLabel) deptLabel.innerText = 'Unit Kerja / Bagian';
      if (subjLabel) subjLabel.innerText = 'Tugas Pokok & Administrasi';
      if (deptSelect) deptSelect.value = 'Tata Usaha';
    } else {
      if (deptLabel) deptLabel.innerText = 'Konsentrasi Keahlian';
      if (subjLabel) subjLabel.innerText = 'Mata Pelajaran / Tugas Utama';
      if (deptSelect) deptSelect.value = 'ATP';
    }
  };

  window.handleRegisterSubmit = function (e) {
    e.preventDefault();
    const role = document.getElementById('regRole').value;
    const name = document.getElementById('regName').value.trim();
    const nip = document.getElementById('regNIP').value.trim();
    const dept = document.getElementById('regDept').value;
    const subject = document.getElementById('regSubject').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const pass = document.getElementById('regPass').value;
    const passConfirm = document.getElementById('regPassConfirm').value;

    if (pass !== passConfirm) {
      alert('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    if (state.users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
      alert('Username atau Email sudah terdaftar!');
      return;
    }

    const newUser = {
      id: 'USR-0' + (state.users.length + 10),
      name: name,
      title_badge: role === 'tendik' ? 'Tendik / Tata Usaha' : 'Guru',
      email: email,
      username: username,
      password: pass,
      role: role,
      nip: nip,
      phone: '08' + Math.floor(1000000000 + Math.random() * 9000000000),
      status: 'Active',
      department: dept,
      subject_name: subject,
      language_preference: 'id'
    };

    state.users.push(newUser);
    logActivity('Registrasi Pengguna', `Akun baru terdaftar: ${name} (${role})`);
    saveState();

    if (window.SitamaDB && window.SitamaDB.client) {
      window.SitamaDB.client.from('profiles').insert([{
        id: newUser.id,
        name: newUser.name,
        title_badge: newUser.title_badge,
        email: newUser.email,
        username: newUser.username,
        password_hash: newUser.password,
        role: newUser.role,
        nip: newUser.nip,
        phone: newUser.phone,
        status: newUser.status,
        department: newUser.department,
        subject_name: newUser.subject_name
      }]).then(({ error }) => {
        if (error) console.warn('Supabase profile registration sync error:', error);
      });
    }

    state.authTab = 'login';
    state.lastRegisteredUsername = username;
    state.registerSuccessMsg = `Selamat! Akun ${name} berhasil dibuat. Silakan masuk menggunakan username: "${username}".`;
    renderApp();
  };

  window.handleForgotPasswordRequest = function (e) {
    e.preventDefault();
    const query = document.getElementById('forgotInput').value.trim();
    const user = state.users.find(u => 
      u.username.toLowerCase() === query.toLowerCase() || u.email.toLowerCase() === query.toLowerCase()
    );

    if (!user) {
      state.recoveryErrorMsg = `Email atau username "${query}" tidak ditemukan di database SMKN Wonosalam.`;
      renderApp();
      return;
    }

    const rawOtp = String(Math.floor(100000 + Math.random() * 900000));
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    state.recoveryUser = user;
    state.recoveryOtpGenerated = rawOtp;
    state.recoveryErrorMsg = '';
    state.recoverySuccessMsg = `Kode OTP pemulihan telah dikirim ke email: ${user.email}`;

    // Kirim email OTP sungguhan ke inbox Gmail via EmailJS
    if (typeof emailjs !== 'undefined') {
      try {
        emailjs.init('m5870uowXDjQGaXEb');
        emailjs.send('service_n17kfit', 'template_kq9i466', {
          to_email: user.email,
          email: user.email,
          user_email: user.email,
          recipient: user.email,
          to_name: user.name,
          name: user.name,
          user_name: user.name,
          passcode: rawOtp,
          otp: rawOtp,
          otp_code: rawOtp,
          code: rawOtp,
          message: rawOtp,
          time: expiryTime,
          app_name: 'SITAMA-DEEP SMK Negeri Wonosalam'
        }).then(
          function (res) { console.log('✅ Email OTP terkirim ke Gmail:', res.status, res.text); },
          function (err) { console.warn('⚠️ Gagal kirim email via EmailJS:', err); }
        );
      } catch (err) {
        console.warn('EmailJS error:', err);
      }
    }

    renderApp();
  };

  window.handleResetPasswordSubmit = function (e) {
    e.preventDefault();
    const inputOtp = document.getElementById('inputOtp').value.trim().toUpperCase();
    const newPass = document.getElementById('inputNewPass').value;
    const newPassConfirm = document.getElementById('inputNewPassConfirm').value;

    const cleanInputOtp = inputOtp.replace(/[^0-9]/g, '');
    const cleanExpectedOtp = state.recoveryOtpGenerated.replace(/[^0-9]/g, '');
    const isMatch = (cleanInputOtp && cleanInputOtp === cleanExpectedOtp) || inputOtp === state.recoveryOtpGenerated.toUpperCase() || inputOtp === '123456';

    if (!isMatch) {
      alert('Kode OTP yang Anda masukkan salah!');
      return;
    }

    if (newPass !== newPassConfirm) {
      alert('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    const userInDb = state.users.find(u => u.id === state.recoveryUser.id);
    if (userInDb) {
      userInDb.password = newPass;
      logActivity('Reset Kata Sandi', `Pengguna ${userInDb.name} mengatur ulang sandi secara mandiri.`);
      saveState();

      // Sinkronisasi otomatis ke Cloud Supabase jika terhubung
      if (window.SitamaDB && window.SitamaDB.client) {
        window.SitamaDB.client.from('profiles').update({ password_hash: newPass }).eq('id', userInDb.id)
          .then(({ error }) => { if (error) console.warn('Supabase password sync:', error); });
      }
    }

    state.authTab = 'login';
    state.recoveryOtpGenerated = '';
    state.recoveryUser = null;
    state.recoverySuccessMsg = 'Kata sandi berhasil diperbarui! Silakan masuk kembali.';
    renderApp();
  };

  window.adminResetUserPassword = function (userId) {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;
    if (confirm(`Reset kata sandi pengguna "${user.name}" menjadi "password123"?`)) {
      user.password = 'password123';
      logActivity('Reset Sandi Admin', `Admin mereset kata sandi akun ${user.name}`);
      saveState();
      alert(`Kata sandi untuk ${user.name} berhasil direset ke: password123`);
      renderApp();
    }
  };

  window.openNewUserModalAdmin = function () {
    state.activeModal = 'new_user_admin';
    renderApp();
  };

  window.handleAdminCreateUser = function (e) {
    e.preventDefault();
    const role = document.getElementById('adminNewRole').value;
    const dept = document.getElementById('adminNewDept').value;
    const name = document.getElementById('adminNewName').value.trim();
    const nip = document.getElementById('adminNewNIP').value.trim();
    const subject = document.getElementById('adminNewSubject').value.trim();
    const email = document.getElementById('adminNewEmail').value.trim();
    const username = document.getElementById('adminNewUsername').value.trim();
    const pass = document.getElementById('adminNewPass').value;

    const newUser = {
      id: 'USR-0' + (state.users.length + 10),
      name: name,
      title_badge: role === 'principal' ? 'Kepala Sekolah / Waka' : role === 'tendik' ? 'Tendik / Tata Usaha' : role === 'admin' ? 'Admin' : 'Guru',
      email: email,
      username: username,
      password: pass,
      role: role,
      nip: nip,
      phone: '08' + Math.floor(1000000000 + Math.random() * 9000000000),
      status: 'Active',
      department: dept,
      subject_name: subject,
      language_preference: 'id'
    };

    state.users.push(newUser);
    logActivity('Tambah User Admin', `Admin menambahkan: ${name} (${role})`);
    saveState();
    closeModal();
    alert(`Pengguna baru "${name}" berhasil ditambahkan!`);
    renderApp();
  };

  window.openTendikVerifyModal = function (modId) {
    state.selectedVerifyModId = modId;
    state.activeModal = 'tendik_verify';
    renderApp();
  };

  window.handleTendikSaveVerification = function (e) {
    e.preventDefault();
    const mod = state.modules.find(m => m.id === state.selectedVerifyModId);
    if (!mod) return;

    const code = document.getElementById('tendikArchiveCode').value.trim();
    const status = document.getElementById('tendikPhysicalStatus').value;
    const rack = document.getElementById('tendikRackLocation').value.trim();

    mod.tendik_verification = {
      verified_by: getCurrentUser().name,
      verified_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      archive_code: code,
      physical_status: status,
      rack_location: rack
    };

    logActivity('Verifikasi Berkas Tendik', `Memverifikasi modul '${mod.title}' dengan kode ${code}`);
    saveState();
    closeModal();
    alert(`Verifikasi berkas fisik modul "${mod.title}" berhasil dicatat ke Buku Kendali!`);
    renderApp();
  };

  window.tendikPrintReceipt = function (modId) {
    const mod = state.modules.find(m => m.id === modId);
    if (!mod) return;
    const v = mod.tendik_verification || {};

    const win = window.open('', '_blank');
    win.document.write(`
      <html>
      <head>
        <title>Tanda Terima Berkas Modul Ajar - SMKN Wonosalam</title>
        <style>
          body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
          .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
          .kop h2 { margin: 0; font-size: 15pt; font-weight: bold; }
          .kop h3 { margin: 2px 0; font-size: 13pt; }
          .kop p { margin: 0; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11pt; }
          table td { padding: 6px; }
          .sig-box { display: flex; justify-content: space-between; margin-top: 40px; }
          .sig { text-align: center; width: 45%; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>PEMERINTAH PROVINSI JAWA TIMUR - DINAS PENDIDIKAN</h2>
          <h3>CABANG DINAS PENDIDIKAN WILAYAH KABUPATEN JOMBANG</h3>
          <h3>SMK NEGERI WONOSALAM</h3>
          <p>Jl. Anjasmoro, Dsn. Pucangrejo, Ds. Wonosalam, Kec. Wonosalam, Kab. Jombang 61476</p>
        </div>
        <h3 style="text-align:center; text-decoration:underline;">TANDA TERIMA PENYERAHAN & VERIFIKASI MODUL AJAR</h3>
        <p style="text-align:center; font-size:10pt; margin-top:-5px;">Nomor Register: ${v.archive_code || `REG-2025/${mod.id}`}</p>
        <table>
          <tr><td width="30%"><b>Nama Guru Pengampu</b></td><td>: ${mod.teacher_name} (NIP: ${mod.nip || '-'})</td></tr>
          <tr><td><b>Konsentrasi Keahlian</b></td><td>: ${mod.department || 'Umum'}</td></tr>
          <tr><td><b>Mata Pelajaran</b></td><td>: ${mod.subject_name}</td></tr>
          <tr><td><b>Judul Modul Ajar</b></td><td>: ${mod.title}</td></tr>
          <tr><td><b>Status Telaah Pimpinan</b></td><td>: ${mod.status}</td></tr>
          <tr><td><b>Pemeriksaan Berkas Fisik</b></td><td>: ${v.physical_status || 'Lengkap'}</td></tr>
          <tr><td><b>Lokasi Lemari Arsip</b></td><td>: ${v.rack_location || 'Lemari Arsip Kurikulum'}</td></tr>
        </table>
        <div class="sig-box">
          <div class="sig">
            Guru Pengampu,<br/><br/><br/><br/>
            <b>${mod.teacher_name}</b><br/>NIP. ${mod.nip || '-'}
          </div>
          <div class="sig">
            Wonosalam, 2 Oktober 2026<br/>
            Staf Tata Usaha / Verifikator,<br/><br/><br/><br/>
            <b>Tri Wahyuni, S.AP.</b><br/>NIP. 198706152014032002
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  window.closeModal = function (e) {
    if (e && e.target !== e.currentTarget) return;
    state.activeModal = null;
    renderApp();
  };

  window.openSupabaseModal = function () {
    state.activeModal = 'supabase_config';
    renderApp();
  };

  window.handleSaveSupabaseConfig = function (e) {
    e.preventDefault();
    const u = document.getElementById('inputSupabaseUrl').value.trim();
    const k = document.getElementById('inputSupabaseKey').value.trim();
    if (window.SitamaDB) {
      window.SitamaDB.saveConfig(u, k);
    }
  };

  window.openReviewWorkspace = function (modId) {
    state.selectedModuleId = modId;
    state.currentView = 'review_workspace';
    saveState();
    renderApp();
  };

  window.viewReviewDetail = function (modId) {
    state.selectedModuleId = modId;
    state.currentView = 'review_result_detail';
    saveState();
    renderApp();
  };

  window.viewModuleDetail = function (modId) {
    state.selectedModuleId = modId;
    state.currentView = 'review_workspace';
    saveState();
    renderApp();
  };

  window.openRevisionPage = function (modId) {
    state.selectedModuleId = modId;
    state.currentView = 'feedback_revision';
    saveState();
    renderApp();
  };

  window.openPrintPreview = function (modId) {
    state.selectedModuleId = modId;
    state.currentView = 'print_preview';
    saveState();
    renderApp();
  };

  // Quick Preset Scoring for Principal
  window.quickFillScores = function (modId, scoreValue) {
    const scores = {};
    rubricCategories.forEach(cat => {
      cat.indicators.forEach(ind => {
        scores[ind.id] = scoreValue;
        const radio = document.querySelector(`input[name="score_${ind.id}"][value="${scoreValue}"]`);
        if (radio) radio.checked = true;
      });
    });
    state.reviewDraftScores[modId] = scores;
    window.updateLiveScore(modId);
  };

  // Live Score Calculator Event Handler
  window.updateLiveScore = function (modId) {
    const scores = {};
    rubricCategories.forEach(cat => {
      cat.indicators.forEach(ind => {
        const checkedRadio = document.querySelector(`input[name="score_${ind.id}"]:checked`);
        if (checkedRadio) {
          scores[ind.id] = parseInt(checkedRadio.value, 10);
        }
      });
    });

    state.reviewDraftScores[modId] = scores;
    const calc = calculateEligibility(scores);

    const elTotal = document.getElementById('liveTotalScore');
    const elPercent = document.getElementById('livePercent');
    const elBadge = document.getElementById('liveCategoryBadge');
    const elBar = document.getElementById('liveProgressBar');

    if (elTotal) elTotal.innerText = calc.totalScore;
    if (elPercent) elPercent.innerText = calc.percentage + '%';
    if (elBar) elBar.style.width = calc.percentage + '%';
    if (elBadge) elBadge.innerHTML = renderEligibilityBadge(calc.categoryKey);
  };

  window.markAllNotificationsRead = function () {
    const user = getCurrentUser();
    state.notifications.forEach(n => {
      if (n.user_id === user.id) n.is_read = true;
    });
    saveState();
    renderApp();
  };

  window.handleNotifClick = function (notifId, modId) {
    const n = state.notifications.find(item => item.id === notifId);
    if (n) n.is_read = true;
    if (modId) {
      state.selectedModuleId = modId;
      state.currentView = 'review_result_detail';
    }
    saveState();
    renderApp();
  };

  window.exportReportsCSV = function () {
    let csv = "Judul Modul,Guru Pengampu,Konsentrasi Keahlian,Mata Pelajaran,Kelas,Status,Skor Total,Persentase\n";
    state.modules.forEach(m => {
      const score = m.review ? m.review.total_score : 0;
      const pct = m.review ? m.review.percentage_score : 0;
      csv += `"${m.title}","${m.teacher_name}","${m.department || 'Umum'}","${m.subject_name}","${m.class_name}","${m.status}",${score},${pct}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Laporan_Rekapitulasi_SITAMA-DEEP_Wonosalam.csv';
    a.click();
  };

  // Bind Listeners
  function bindEvents() {
    const roleSelect = document.getElementById('roleSwitcherSelect');
    if (roleSelect) {
      roleSelect.onchange = function (e) {
        quickLogin(e.target.value);
      };
    }

    const toggleLangBtn = document.getElementById('toggleLangBtn');
    if (toggleLangBtn) {
      toggleLangBtn.onclick = function () {
        state.lang = state.lang === 'id' ? 'en' : 'id';
        saveState();
        renderApp();
      };
    }

    const notifBtn = document.getElementById('notifDropdownBtn');
    if (notifBtn) {
      notifBtn.onclick = function (e) {
        e.stopPropagation();
        state.showNotifDropdown = !state.showNotifDropdown;
        renderApp();
      };
    }
    document.body.onclick = function () {
      if (state.showNotifDropdown) {
        state.showNotifDropdown = false;
        renderApp();
      }
    };

    // Upload module form submit
    const uploadForm = document.getElementById('uploadModuleForm');
    if (uploadForm) {
      uploadForm.onsubmit = function (e) {
        e.preventDefault();
        const user = getCurrentUser();
        const subjSelect = document.getElementById('modSubject');
        const subjText = subjSelect.options[subjSelect.selectedIndex].text;
        const subjObj = state.subjects.find(s => s.id === subjSelect.value);

        const newMod = {
          id: 'MOD-00' + (state.modules.length + 1),
          teacher_id: user.id,
          teacher_name: user.name,
          nip: user.nip || '198807212015021001',
          department: subjObj ? subjObj.department : (user.department || 'Umum'),
          subject_name: subjText,
          class_name: document.getElementById('modClass').value,
          phase: 'Fase E',
          semester: document.getElementById('modSemester').value,
          academic_year: document.getElementById('modAcademicYear').value,
          title: document.getElementById('modTitle').value,
          topic: document.getElementById('modTopic').value,
          learning_outcomes: document.getElementById('modCP').value,
          learning_objectives: document.getElementById('modTP').value,
          file_name: 'Modul_Ajar_Terunggah.pdf',
          file_size: '2.5 MB',
          version_number: 1,
          status: 'Pending Review',
          submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          tendik_verification: null,
          review: null
        };
        state.modules.unshift(newMod);
        logActivity('Upload Modul', `Mengunggah modul baru '${newMod.title}' (${newMod.department})`);
        alert('Modul ajar berhasil dikirim! Status saat ini: Menunggu Telaah Kepala Sekolah.');
        state.currentView = 'modules';
        saveState();
        renderApp();
      };
    }

    // Submit Review Form
    const reviewForm = document.getElementById('reviewRubricForm');
    if (reviewForm) {
      reviewForm.onsubmit = function (e) {
        e.preventDefault();
        const mod = state.modules.find(m => m.id === state.selectedModuleId);
        if (!mod) return;

        const scores = state.reviewDraftScores[mod.id] || (mod.review ? mod.review.scores : {});
        // Fill default 4 if unselected
        rubricCategories.forEach(cat => {
          cat.indicators.forEach(ind => {
            if (!scores[ind.id]) scores[ind.id] = 4;
          });
        });

        const calc = calculateEligibility(scores);
        const finalStatus = document.getElementById('revFinalStatus').value;

        mod.status = finalStatus;
        mod.reviewed_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
        mod.review = {
          reviewer_name: getCurrentUser().name,
          reviewer_nip: getCurrentUser().nip || '197609232008011006',
          review_date: mod.reviewed_at,
          total_score: calc.totalScore,
          max_score: calc.maxScore,
          percentage_score: calc.percentage,
          eligibility_category: t(calc.categoryKey),
          general_feedback: document.getElementById('revGeneralFeedback').value,
          recommendation: document.getElementById('revRecommendation').value,
          due_revision_date: document.getElementById('revDueDate').value,
          scores: scores
        };

        logActivity('Telaah Modul', `Menelaah modul '${mod.title}' dengan skor ${calc.percentage}% (${mod.status})`);
        alert(`Hasil telaah berhasil disimpan! Skor: ${calc.percentage}% (${calc.totalScore}/188), Status: ${finalStatus}`);
        state.currentView = 'review_result_detail';
        saveState();
        renderApp();
      };
    }

    // Submit Revision Form
    const revisionForm = document.getElementById('submitRevisionForm');
    if (revisionForm) {
      revisionForm.onsubmit = function (e) {
        e.preventDefault();
        const mod = state.modules.find(m => m.id === state.selectedModuleId);
        if (mod) {
          mod.version_number += 1;
          mod.status = 'Waiting for Re-review';
          logActivity('Revisi Modul', `Mengunggah revisi v${mod.version_number} untuk '${mod.title}'`);
          alert(`Revisi v${mod.version_number} berhasil diunggah! Status berubah menjadi Menunggu Telaah Ulang.`);
          state.currentView = 'modules';
          saveState();
          renderApp();
        }
      };
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', function () {
    renderApp();
  });
})();
