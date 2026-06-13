import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import History from '@tiptap/extension-history';

// ── API helpers ───────────────────────────────────────────────────────────────

const API = {
  token: localStorage.getItem('token'),

  headers() {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` };
  },

  async request(method, path, body) {
    const res = await fetch(`/api${path}`, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) { logout(); return; }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  get:    (path)        => API.request('GET', path),
  post:   (path, body)  => API.request('POST', path, body),
  patch:  (path, body)  => API.request('PATCH', path, body),
  delete: (path)        => API.request('DELETE', path),
};

// ── State ─────────────────────────────────────────────────────────────────────
let currentParentId = null; // null = root
let breadcrumb = []; // [{ id, title, type }]
let activeEditor = null;

// ── Auth ──────────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  API.token = null;
  document.getElementById('app').hidden = true;
  document.getElementById('login-screen').hidden = false;
}

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = document.getElementById('login-error');
  err.hidden = true;
  try {
    const data = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
      }),
    }).then(r => r.json());
    if (data.error) throw new Error(data.error);
    API.token = data.token;
    localStorage.setItem('token', data.token);
    startApp();
  } catch (ex) {
    err.textContent = ex.message;
    err.hidden = false;
  }
});

document.getElementById('logout-btn').addEventListener('click', logout);

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  if (!API.token) return;
  try {
    await API.get('/auth/verify');
    startApp();
  } catch {
    logout();
  }
}

function startApp() {
  document.getElementById('login-screen').hidden = true;
  document.getElementById('app').hidden = false;
  navigate(null);
}

// ── Navigation ────────────────────────────────────────────────────────────────
async function navigate(parentId, nodeInfo = null) {
  currentParentId = parentId;

  // Build breadcrumb
  if (parentId === null) {
    breadcrumb = [];
  } else {
    try {
      const ancestors = await API.get(`/nodes/${parentId}/breadcrumb`);
      breadcrumb = ancestors.map(n => ({ id: n.id, title: n.title, type: n.type }));
    } catch {
      breadcrumb = nodeInfo ? [nodeInfo] : [];
    }
  }

  renderBreadcrumb();
  await renderMain();
}

function renderBreadcrumb() {
  const nav = document.getElementById('breadcrumb-nav');
  nav.innerHTML = '';

  // Home
  const home = document.createElement('button');
  home.className = 'breadcrumb-item' + (currentParentId === null ? ' active' : '');
  home.dataset.id = '';
  home.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Home`;
  home.addEventListener('click', () => navigate(null));
  nav.appendChild(home);

  breadcrumb.forEach((node, i) => {
    const btn = document.createElement('button');
    btn.className = 'breadcrumb-item' + (i === breadcrumb.length - 1 ? ' active' : '');
    btn.style.paddingLeft = `${(i + 1) * 10 + 6}px`;
    btn.textContent = node.title || 'Untitled';
    btn.addEventListener('click', () => navigate(node.id, node));
    nav.appendChild(btn);
  });

  // Sidebar children
  renderSidebarChildren();
}

async function renderSidebarChildren() {
  const container = document.getElementById('sidebar-children');
  container.innerHTML = '';
  const parentId = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].id : null;
  const items = await API.get(`/nodes${parentId ? `?parent_id=${parentId}` : ''}`);
  items.filter(n => n.type !== 'fragment').forEach(node => {
    const el = document.createElement('div');
    el.className = 'sidebar-node' + (node.id === currentParentId ? ' active' : '');
    el.innerHTML = `<span class="sidebar-node-dot" style="background:${node.color}"></span><span>${node.title || 'Untitled'}</span>`;
    el.addEventListener('click', () => navigate(node.id, node));
    container.appendChild(el);
  });
}

// ── Main render ───────────────────────────────────────────────────────────────
async function renderMain() {
  const nodes = await API.get(`/nodes${currentParentId ? `?parent_id=${currentParentId}` : ''}`);

  const currentNode = breadcrumb[breadcrumb.length - 1];
  document.getElementById('current-title').textContent = currentNode ? (currentNode.title || 'Untitled') : 'Home';
  document.getElementById('current-subtitle').textContent = currentNode
    ? `${currentNode.type === 'category' ? 'Category' : 'Subcategory'} · ${nodes.length} item${nodes.length !== 1 ? 's' : ''}`
    : `${nodes.length} categor${nodes.length !== 1 ? 'ies' : 'y'}`;

  // Update header button label
  const addBtn = document.getElementById('add-category-btn');
  if (currentParentId === null) {
    addBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Category`;
    addBtn.onclick = () => openNodeModal('category', null);
  } else {
    addBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add`;
    addBtn.onclick = () => openAddChildMenu();
  }

  const subcategories = nodes.filter(n => n.type !== 'fragment');
  const fragments = nodes.filter(n => n.type === 'fragment');

  renderGrid(subcategories);
  renderFragments(fragments);
}

function renderGrid(nodes) {
  const grid = document.getElementById('node-grid');
  grid.innerHTML = '';

  nodes.forEach(node => {
    const card = document.createElement('div');
    card.className = 'node-card';
    const colorBg = hexToRgba(node.color, 0.1);
    card.innerHTML = `
      <div class="node-card-color-bar" style="background:${node.color}"></div>
      <div class="node-card-icon" style="background:${colorBg}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${node.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${node.type === 'category'
            ? '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'
            : '<path d="M3 3h18v18H3z M9 3v18 M3 9h6 M3 15h6"/>'}
        </svg>
      </div>
      <div class="node-card-title">${esc(node.title) || 'Untitled'}</div>
      <div class="node-card-meta">${node.type === 'category' ? 'Category' : 'Subcategory'}</div>
      <div class="node-card-actions">
        <button class="btn-icon edit-btn" title="Edit" data-id="${node.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon delete-btn" title="Delete" data-id="${node.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    `;

    card.addEventListener('click', e => {
      if (e.target.closest('.node-card-actions')) return;
      navigate(node.id, node);
    });

    card.querySelector('.edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      openNodeModal(node.type, node.parent_id, node);
    });

    card.querySelector('.delete-btn').addEventListener('click', e => {
      e.stopPropagation();
      confirmDelete(node);
    });

    grid.appendChild(card);
  });
}

function renderFragments(fragments) {
  const list = document.getElementById('fragment-list');
  list.innerHTML = '';

  fragments.forEach(frag => {
    const card = document.createElement('div');
    card.className = 'fragment-card';
    card.style.borderLeftColor = frag.color || '#94a3b8';
    card.innerHTML = `
      ${frag.title ? `<div class="fragment-title">${esc(frag.title)}</div>` : ''}
      <div class="fragment-content">${frag.content || ''}</div>
      <div class="fragment-actions">
        <button class="btn-icon edit-frag-btn" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon delete-frag-btn" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>
    `;

    card.querySelector('.edit-frag-btn').addEventListener('click', () => openFragmentModal(frag));
    card.querySelector('.delete-frag-btn').addEventListener('click', () => confirmDelete(frag));
    list.appendChild(card);
  });
}

// ── Add-child menu (inline choice) ───────────────────────────────────────────
function openAddChildMenu() {
  openModal('Add to this section', `
    <p style="color:var(--gray-500);font-size:13px;margin-bottom:1rem;">What would you like to add?</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
      <button class="node-card-add" id="choice-sub" style="min-height:100px;font-size:13px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3z"/></svg>
        Subcategory
      </button>
      <button class="node-card-add" id="choice-frag" style="min-height:100px;font-size:13px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        Text Fragment
      </button>
    </div>
  `, null, false);

  document.getElementById('choice-sub').addEventListener('click', () => {
    closeModal();
    openNodeModal('subcategory', currentParentId);
  });
  document.getElementById('choice-frag').addEventListener('click', () => {
    closeModal();
    openFragmentModal(null);
  });
}

// ── Node modal (category / subcategory) ──────────────────────────────────────
const PRESET_COLORS = [
  '#2563eb','#7c3aed','#db2777','#dc2626','#ea580c',
  '#ca8a04','#16a34a','#0891b2','#475569',
];

function colorPickerHTML(selected = '#2563eb') {
  const swatches = PRESET_COLORS.map(c => `
    <button type="button" class="color-swatch${c === selected ? ' selected' : ''}" style="background:${c}" data-color="${c}" title="${c}"></button>
  `).join('');
  return `
    <div class="color-picker-row" id="color-picker-row">
      ${swatches}
      <input type="color" class="color-custom" id="color-custom" value="${selected}" title="Custom colour" />
    </div>
    <input type="hidden" id="selected-color" value="${selected}" />
  `;
}

function attachColorPickerEvents() {
  const row = document.getElementById('color-picker-row');
  const hidden = document.getElementById('selected-color');
  const custom = document.getElementById('color-custom');

  row.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      row.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      hidden.value = sw.dataset.color;
      custom.value = sw.dataset.color;
    });
  });

  custom.addEventListener('input', () => {
    hidden.value = custom.value;
    row.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  });
}

function openNodeModal(type, parentId, existing = null) {
  const label = type === 'category' ? 'Category' : 'Subcategory';
  const title = existing ? `Edit ${label}` : `New ${label}`;
  const color = existing?.color || '#2563eb';

  openModal(title, `
    <div class="field">
      <label for="node-title">Name</label>
      <input type="text" id="node-title" value="${esc(existing?.title || '')}" placeholder="${label} name" />
    </div>
    <div class="field">
      <label>Colour</label>
      ${colorPickerHTML(color)}
    </div>
  `, async () => {
    const title = document.getElementById('node-title').value.trim();
    const color = document.getElementById('selected-color').value;
    if (!title) { alert('Please enter a name.'); return false; }

    if (existing) {
      await API.patch(`/nodes/${existing.id}`, { title, color });
    } else {
      await API.post('/nodes', { parent_id: parentId, type, title, color });
    }
    await renderMain();
    renderBreadcrumb();
  });

  attachColorPickerEvents();
  setTimeout(() => document.getElementById('node-title')?.focus(), 50);
}

// ── Fragment modal ────────────────────────────────────────────────────────────
function openFragmentModal(existing = null) {
  const title = existing ? 'Edit Fragment' : 'New Text Fragment';
  const color = existing?.color || '#2563eb';

  openModal(title, `
    <div class="field">
      <label for="frag-title">Title <span style="color:var(--gray-400);font-weight:400">(optional)</span></label>
      <input type="text" id="frag-title" value="${esc(existing?.title || '')}" placeholder="Fragment title…" />
    </div>
    <div class="field">
      <label>Colour accent</label>
      ${colorPickerHTML(color)}
    </div>
    <div class="field mt-2">
      <label>Content</label>
      <div class="editor-wrapper">
        <div class="editor-toolbar" id="editor-toolbar"></div>
        <div id="editor-mount"></div>
      </div>
    </div>
  `, async () => {
    const fragTitle = document.getElementById('frag-title').value.trim();
    const color = document.getElementById('selected-color').value;
    const content = activeEditor ? activeEditor.getHTML() : '';

    if (existing) {
      await API.patch(`/nodes/${existing.id}`, { title: fragTitle, color, content });
    } else {
      await API.post('/nodes', { parent_id: currentParentId, type: 'fragment', title: fragTitle, color, content });
    }
    await renderMain();
  });

  attachColorPickerEvents();
  // Init editor after modal DOM is in place
  setTimeout(() => initEditor(existing?.content || ''), 50);
}

// ── Tiptap editor setup ───────────────────────────────────────────────────────
function initEditor(initialContent = '') {
  if (activeEditor) { activeEditor.destroy(); activeEditor = null; }

  activeEditor = new Editor({
    element: document.getElementById('editor-mount'),
    extensions: [
      Document, Paragraph, Text, Bold, Italic, Underline, Strike,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList, OrderedList, ListItem,
      Blockquote, CodeBlock, HorizontalRule,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle, Color,
      Placeholder.configure({ placeholder: 'Paste or type your content here…' }),
      History,
    ],
    content: initialContent,
    onUpdate: () => {},
  });

  // Paste images as base64
  document.getElementById('editor-mount').addEventListener('paste', e => {
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find(i => i.type.startsWith('image/'));
    if (!imgItem) return;
    e.preventDefault();
    const file = imgItem.getAsFile();
    const reader = new FileReader();
    reader.onload = ev => activeEditor.chain().focus().setImage({ src: ev.target.result }).run();
    reader.readAsDataURL(file);
  });

  buildToolbar();
}

function buildToolbar() {
  const toolbar = document.getElementById('editor-toolbar');
  if (!toolbar) return;

  const btn = (label, action, isActive) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = label;
    b.innerHTML = label;
    b.addEventListener('click', action);
    if (isActive) {
      activeEditor.on('transaction', () => {
        b.classList.toggle('is-active', isActive());
      });
    }
    return b;
  };

  const sep = () => { const d = document.createElement('div'); d.className = 'sep'; return d; };

  const svgBtn = (title, svgPath, action, isActive) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = title;
    b.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`;
    b.addEventListener('click', action);
    if (isActive) {
      activeEditor.on('transaction', () => b.classList.toggle('is-active', isActive()));
    }
    return b;
  };

  const tools = [
    svgBtn('Bold', '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>',
      () => activeEditor.chain().focus().toggleBold().run(),
      () => activeEditor.isActive('bold')),
    svgBtn('Italic', '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
      () => activeEditor.chain().focus().toggleItalic().run(),
      () => activeEditor.isActive('italic')),
    svgBtn('Underline', '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
      () => activeEditor.chain().focus().toggleUnderline().run(),
      () => activeEditor.isActive('underline')),
    svgBtn('Strikethrough', '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      () => activeEditor.chain().focus().toggleStrike().run(),
      () => activeEditor.isActive('strike')),
    sep(),
    btn('H1', () => activeEditor.chain().focus().toggleHeading({ level: 1 }).run(), () => activeEditor.isActive('heading', { level: 1 })),
    btn('H2', () => activeEditor.chain().focus().toggleHeading({ level: 2 }).run(), () => activeEditor.isActive('heading', { level: 2 })),
    btn('H3', () => activeEditor.chain().focus().toggleHeading({ level: 3 }).run(), () => activeEditor.isActive('heading', { level: 3 })),
    sep(),
    svgBtn('Bullet list', '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
      () => activeEditor.chain().focus().toggleBulletList().run(),
      () => activeEditor.isActive('bulletList')),
    svgBtn('Ordered list', '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
      () => activeEditor.chain().focus().toggleOrderedList().run(),
      () => activeEditor.isActive('orderedList')),
    svgBtn('Blockquote', '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
      () => activeEditor.chain().focus().toggleBlockquote().run(),
      () => activeEditor.isActive('blockquote')),
    sep(),
    svgBtn('Align left', '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
      () => activeEditor.chain().focus().setTextAlign('left').run()),
    svgBtn('Align center', '<line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/>',
      () => activeEditor.chain().focus().setTextAlign('center').run()),
    svgBtn('Align right', '<line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>',
      () => activeEditor.chain().focus().setTextAlign('right').run()),
    sep(),
  ];

  // Link button
  const linkBtn = svgBtn('Insert link', '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    () => {
      const url = prompt('Enter URL:');
      if (url) activeEditor.chain().focus().setLink({ href: url }).run();
    },
    () => activeEditor.isActive('link'));
  tools.push(linkBtn);

  // Image upload button
  const imgBtn = svgBtn('Insert image', '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    () => {
      const url = prompt('Image URL (or paste an image directly in the editor):');
      if (url) activeEditor.chain().focus().setImage({ src: url }).run();
    });
  tools.push(imgBtn);

  // Horizontal rule
  tools.push(svgBtn('Horizontal rule', '<line x1="5" y1="12" x2="19" y2="12"/>',
    () => activeEditor.chain().focus().setHorizontalRule().run()));

  tools.forEach(t => toolbar.appendChild(t));
}

// ── Delete confirmation ───────────────────────────────────────────────────────
function confirmDelete(node) {
  const label = node.type === 'fragment' ? 'this text fragment' : `"${node.title}"`;
  const warn = node.type !== 'fragment' ? ' This will also delete all subcategories and fragments inside it.' : '';
  openModal('Confirm delete', `
    <p style="color:var(--gray-700)">Are you sure you want to delete ${label}?${warn}</p>
  `, async () => {
    await API.delete(`/nodes/${node.id}`);
    // If we deleted the current node, navigate up
    if (node.id === currentParentId) {
      const parent = breadcrumb[breadcrumb.length - 2] || null;
      await navigate(parent ? parent.id : null, parent);
    } else {
      await renderMain();
      renderBreadcrumb();
    }
  }, true);
}

// ── Modal engine ──────────────────────────────────────────────────────────────
let modalConfirmCallback = null;

function openModal(title, bodyHTML, onConfirm, isDanger = false) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').hidden = false;
  modalConfirmCallback = onConfirm;

  const confirmBtn = document.getElementById('modal-confirm');
  if (onConfirm === null) {
    confirmBtn.hidden = true;
    document.getElementById('modal-cancel').textContent = 'Close';
  } else {
    confirmBtn.hidden = false;
    confirmBtn.textContent = isDanger ? 'Delete' : 'Save';
    confirmBtn.className = isDanger ? 'btn btn-danger' : 'btn btn-primary';
    document.getElementById('modal-cancel').textContent = 'Cancel';
  }
}

function closeModal() {
  document.getElementById('modal-overlay').hidden = true;
  if (activeEditor) { activeEditor.destroy(); activeEditor = null; }
  modalConfirmCallback = null;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

document.getElementById('modal-confirm').addEventListener('click', async () => {
  if (!modalConfirmCallback) return;
  const result = await modalConfirmCallback();
  if (result !== false) closeModal();
});

// ── Utility ───────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
boot();
