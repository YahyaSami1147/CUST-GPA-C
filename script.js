/* ── Theme ───────────────────────────────────────────────── */
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('cust-theme', next);
  }

  (function () {
    const saved = localStorage.getItem('cust-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  })();

  /* ── State ───────────────────────────────────────────────── */
  let subjectCount = 0;
  let subjects     = [];
  let currentMode  = 'letter';

  /* ── Grading Table ───────────────────────────────────────── */
  function toggleGradingTable() {
    document.getElementById('grading-body').classList.toggle('open');
    document.getElementById('grading-chevron').classList.toggle('open');
  }

  /* ── Mode ────────────────────────────────────────────────── */
  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    rebuildAllSubjects();
  }

  /* ── Subject Management ──────────────────────────────────── */
  function addSubject() {
    const id = subjectCount++;
    subjects.push({ id, categoryCount: 0 });
    renderSubject(id);
  }

  function removeSubject(id) {
    subjects = subjects.filter(s => s.id !== id);
    const el = document.getElementById(`subject-card-${id}`);
    if (el) {
      el.style.transition = 'all 0.24s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(22px)';
      setTimeout(() => el.remove(), 240);
    }
  }

  function renderSubject(id) {
    const container = document.getElementById('subject-container');
    const div = document.createElement('div');
    div.className = 'glass-card subject-card';
    div.id = `subject-card-${id}`;
    div.innerHTML = buildSubjectHTML(id);
    container.appendChild(div);
  }

  function rebuildAllSubjects() {
    const container = document.getElementById('subject-container');
    container.innerHTML = '';
    subjects.forEach(s => {
      const div = document.createElement('div');
      div.className = 'glass-card subject-card';
      div.id = `subject-card-${s.id}`;
      div.innerHTML = buildSubjectHTML(s.id);
      container.appendChild(div);
    });
  }

  function buildSubjectHTML(id) {
    const subj  = subjects.find(s => s.id === id);
    const index = subjects.findIndex(s => s.id === id) + 1;
    let inputHTML = '';

    if (currentMode === 'marks') {
      inputHTML = `
        <div class="field-wrap">
          <div class="field-label">Marks %</div>
          <input type="number" placeholder="0–100" min="0" max="100" id="marks-${id}">
        </div>`;
    } else if (currentMode === 'letter') {
      inputHTML = `
        <div class="field-wrap">
          <div class="field-label">Grade</div>
          <select id="grade-${id}">
            <option>A</option><option>A-</option>
            <option>B+</option><option>B</option><option>B-</option>
            <option>C+</option><option>C</option><option>C-</option>
            <option>D+</option><option>D</option><option>F</option>
          </select>
        </div>`;
    } else {
      let catRows = '';
      for (let j = 0; j < (subj ? subj.categoryCount : 0); j++) {
        catRows += buildCategoryRow(id, j);
      }
      inputHTML = `
        <div class="category-section" id="cat-section-${id}" style="width:100%">
          <div id="cat-rows-${id}">${catRows}</div>
          <div class="cat-actions">
            <button class="cat-add-btn" onclick="addCategory(${id})">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Category
            </button>
            <button class="cat-remove-btn" onclick="removeLastCategory(${id})" id="cat-remove-btn-${id}" style="display:none">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Remove Last
            </button>
          </div>
        </div>`;
    }

    return `
      <div class="subject-header">
        <span class="subject-num">S${String(index).padStart(2,'0')}</span>
        <div class="subject-fields">
          <div class="field-wrap">
            <div class="field-label">Subject Name</div>
            <input type="text" placeholder="e.g. Data Structures" id="name-${id}">
          </div>
          <div class="field-wrap">
            <div class="field-label">Credit Hours</div>
            <input type="number" placeholder="CH" min="1" max="6" id="credits-${id}">
          </div>
          ${inputHTML}
        </div>
        <button class="remove-subject-btn" onclick="removeSubject(${id})" title="Remove subject">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
  }

  /* ── Category Management ─────────────────────────────────── */
  function buildCategoryRow(subjectId, catIndex) {
    return `
      <div class="category-row" id="cat-row-${subjectId}-${catIndex}">
        <div class="field-wrap">
          <div class="field-label">Category</div>
          <input type="text" placeholder="e.g. Quiz" id="catName-${subjectId}-${catIndex}">
        </div>
        <div class="field-wrap">
          <div class="field-label">Score %</div>
          <input type="number" placeholder="0–100" min="0" max="100" id="catPercent-${subjectId}-${catIndex}">
        </div>
        <div class="field-wrap">
          <div class="field-label">Weight %</div>
          <input type="number" placeholder="0–100" min="0" max="100" id="catWeight-${subjectId}-${catIndex}">
        </div>
      </div>`;
  }

  function addCategory(subjectId) {
    const subj = subjects.find(s => s.id === subjectId);
    if (!subj) return;
    const ci = subj.categoryCount;
    const rowsDiv = document.getElementById(`cat-rows-${subjectId}`);
    if (!rowsDiv) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = buildCategoryRow(subjectId, ci);
    rowsDiv.appendChild(tmp.firstElementChild);
    subj.categoryCount++;
    const btn = document.getElementById(`cat-remove-btn-${subjectId}`);
    if (btn) btn.style.display = 'flex';
  }

  function removeLastCategory(subjectId) {
    const subj = subjects.find(s => s.id === subjectId);
    if (!subj || subj.categoryCount === 0) return;
    subj.categoryCount--;
    const row = document.getElementById(`cat-row-${subjectId}-${subj.categoryCount}`);
    if (row) { row.style.opacity='0'; row.style.transition='opacity 0.2s'; setTimeout(()=>row.remove(),200); }
    if (subj.categoryCount === 0) {
      const btn = document.getElementById(`cat-remove-btn-${subjectId}`);
      if (btn) btn.style.display = 'none';
    }
  }

  /* ── Grade Logic ─────────────────────────────────────────── */
  function gradeFromMarks(m) {
    if (m >= 86) return 4.00;
    if (m >= 82) return 3.67;
    if (m >= 78) return 3.33;
    if (m >= 74) return 3.00;
    if (m >= 70) return 2.67;
    if (m >= 66) return 2.33;
    if (m >= 62) return 2.00;
    if (m >= 58) return 1.67;
    if (m >= 54) return 1.33;
    if (m >= 50) return 1.00;
    return 0.00;
  }

  function gradeFromLetter(g) {
    const map = { 'A':4.00,'A-':3.67,'B+':3.33,'B':3.00,'B-':2.67,
                  'C+':2.33,'C':2.00,'C-':1.67,'D+':1.33,'D':1.00,'F':0.00 };
    return map[g] ?? 0.00;
  }

  function letterFromPoints(pts) {
    if (pts >= 4.00) return 'A';
    if (pts >= 3.67) return 'A-';
    if (pts >= 3.33) return 'B+';
    if (pts >= 3.00) return 'B';
    if (pts >= 2.67) return 'B-';
    if (pts >= 2.33) return 'C+';
    if (pts >= 2.00) return 'C';
    if (pts >= 1.67) return 'C-';
    if (pts >= 1.33) return 'D+';
    if (pts >= 1.00) return 'D';
    return 'F';
  }

  function ptsClass(pts) {
    if (pts >= 3.67) return 'pts-a';
    if (pts >= 2.67) return 'pts-b';
    if (pts >= 2.00) return 'pts-c';
    if (pts >= 1.00) return 'pts-d';
    return 'pts-f';
  }

  function standingLabel(gpa) {
    if (gpa >= 3.5) return '🏆 Excellent - Dean\'s List Territory';
    if (gpa >= 3.00) return '⭐ Good Standing';
    if (gpa >= 2.33) return '📘 Satisfactory';
    if (gpa >= 1.00) return '⚠️ Poor but Passing';
    if (gpa > 0)    return '❌ Failing';
    return '—';
  }

  /* ── Calculate ───────────────────────────────────────────── */
  function calculateGPA() {
    if (subjects.length === 0) { showToast('Add at least one subject first.'); return; }

    let totalPoints = 0, totalCredits = 0;
    const breakdown = [];
    let failCount = 0;

    for (const subj of subjects) {
      const id      = subj.id;
      const credits = parseFloat(document.getElementById(`credits-${id}`)?.value) || 0;
      const name    = document.getElementById(`name-${id}`)?.value.trim() || `Subject ${id+1}`;
      if (credits <= 0) continue;

      let pts = 0;

      if (currentMode === 'marks') {
        const m = parseFloat(document.getElementById(`marks-${id}`)?.value) || 0;
        pts = gradeFromMarks(m);
      } else if (currentMode === 'letter') {
        const g = document.getElementById(`grade-${id}`)?.value || 'F';
        pts = gradeFromLetter(g);
      } else {
        let totalW = 0, totalM = 0;
        for (let j = 0; j < subj.categoryCount; j++) {
          const pct = parseFloat(document.getElementById(`catPercent-${id}-${j}`)?.value) || 0;
          const wgt = parseFloat(document.getElementById(`catWeight-${id}-${j}`)?.value) || 0;
          totalM += (pct / 100) * wgt;
          totalW += wgt;
        }
        if (subj.categoryCount > 0 && Math.abs(totalW - 100) > 0.5) {
          showToast(`"${name}": Category weights must add up to 100% (currently ${totalW}%).`);
          return;
        }
        pts = gradeFromMarks(totalM);
      }

      if (pts === 0) failCount++;
      totalPoints  += pts * credits;
      totalCredits += credits;
      breakdown.push({ name, credits, pts });
    }

    if (totalCredits === 0) { showToast('Enter credit hours for your subjects.'); return; }

    const gpa = totalPoints / totalCredits;
    openModal(gpa, breakdown, failCount);
  }

  /* ── Modal ───────────────────────────────────────────────── */
  function openModal(gpa, breakdown, failCount) {
    document.getElementById('modal-gpa').textContent      = gpa.toFixed(2);
    document.getElementById('modal-standing').textContent = standingLabel(gpa);

    const bar = document.getElementById('modal-bar');
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = Math.min((gpa / 4) * 100, 100) + '%'; }, 80);

    const list = document.getElementById('breakdown-list');
    list.innerHTML = '';
    breakdown.forEach((item, i) => {
      const letter = letterFromPoints(item.pts);
      const cls    = ptsClass(item.pts);
      const div    = document.createElement('div');
      div.className = 'breakdown-item';
      div.style.animationDelay = `${i * 0.05}s`;
      div.innerHTML = `
        <span class="breakdown-name">${escHtml(item.name)}</span>
        <div class="breakdown-meta">
          <span class="breakdown-ch">${item.credits} CH</span>
          <span class="breakdown-pts ${cls}">${item.pts.toFixed(2)} · ${letter}</span>
        </div>`;
      list.appendChild(div);
    });

    const note = document.getElementById('modal-retake-note');
    if (failCount > 0) {
      note.style.display = 'block';
      note.textContent = `⚠️ You have ${failCount} failing subject${failCount>1?'s':''}. Consider speaking with your academic advisor about retake options.`;
    } else if (gpa < 2.00) {
      note.style.display = 'block';
      note.textContent = '💡 Your GPA is below the passing threshold. Early academic support can make a big difference.';
    } else {
      note.style.display = 'none';
    }

    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function handleOverlayClick(e) {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ── Toast ───────────────────────────────────────────────── */
  function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => {
      t.style.transform = 'translateX(-50%) translateY(0)';
      t.style.opacity   = '1';
    });
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.transform = 'translateX(-50%) translateY(70px)';
      t.style.opacity   = '0';
    }, 3200);
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Init ────────────────────────────────────────────────── */
  window.onload = () => {
    addSubject();
    addSubject();
    addSubject();
  };