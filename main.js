// ============ STATE ============
let DB = {
  companies: [],   // GST Companies (seller)
  clients: [],
  products: [],
  invoices: [],
  fleet: [],
  drivers: [],
  renewals: [],
  fuel: [],
  expenses: [],
  settings: { prefix: 'INV', nextNum: 1 }
};
let gstMode = 'exclusive';
let editingClientId = null;
let editingProductId = null;
let editingGcoId = null;
let viewingInvId = null;

// ============ PERSISTENCE ============
function saveDB() { localStorage.setItem('sk_billing_v3', JSON.stringify(DB)); }
function loadDB() {
  const s = localStorage.getItem('sk_billing_v3');
  if (s) { try { const loaded = JSON.parse(s); DB = Object.assign({fleet:[],drivers:[],renewals:[],fuel:[],expenses:[]}, loaded); } catch(e){} }
}

// ============ UID ============
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ============ INIT ============
// ============ THEME ============
function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('sk_theme', next);
  updateThemeBtn();
}
function updateThemeBtn() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

// ============ NAV ============
function nav(page, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    // Find and mark the correct nav item
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'"+page+"'")) n.classList.add('active');
    });
  }
  const titles = { dashboard:'Dashboard', invoice:'New Invoice', history:'Invoice History', clients:'Clients', products:'Product Master', company:'GST Companies', fleet:'Fleet Management', drivers:'Drivers', renewals:'Renewals', fuel:'Fuel Tracker', expense:'Expense Tracker', reports:'Reports', customers:'Customers' };
  document.getElementById('pageTitle').textContent = titles[page] || page;
  if (page === 'invoice') { initInvoice(); populateSellerSelect(); }
  if (page === 'history') renderHistory();
  if (page === 'fleet') renderFleet();
  if (page === 'drivers') renderDrivers();
  if (page === 'renewals') renderRenewals();
  if (page === 'fuel') { renderFuel(); renderFuelStats(); }
  if (page === 'expense') { renderExpenses(); renderExpenseStats(); }
  if (page === 'reports') renderReports();
  if (page === 'customers') renderCustomers();
  closeSidebar();
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); }
function checkMobile() {
  const btn = document.getElementById('menuBtn');
  if (window.innerWidth <= 768) { btn.style.display = 'flex'; } else { btn.style.display = 'none'; closeSidebar(); }
}
window.addEventListener('resize', checkMobile);

// ============ MODAL ============
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ============ TOAST ============
function toast(msg, type = 'success') {
  const icons = { success:'✅', error:'❌', info:'ℹ️', warn:'⚠️' };
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${icons[type]||'✅'}</span><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ============ SELLER SELECT ============
function populateSellerSelect() {
  const sel = document.getElementById('inv-seller');
  const cur = sel.value;
  sel.innerHTML = '<option value="">-- Select GST Company --</option>';
  DB.companies.forEach(c => { sel.innerHTML += `<option value="${c.id}">${c.name} — ${c.gstin}</option>`; });
  if (cur && DB.companies.find(c => c.id === cur)) sel.value = cur;
  else if (DB.companies.length) { sel.value = DB.companies[0].id; onSellerChange(); }
}

function onSellerChange() {
  const id = document.getElementById('inv-seller').value;
  const box = document.getElementById('sellerInfoBox');
  if (!id) { box.style.display = 'none'; return; }
  const c = DB.companies.find(x => x.id === id);
  if (!c) return;
  document.getElementById('sellerNameLbl').textContent = c.name;
  document.getElementById('sellerStateLbl').textContent = c.addr || c.state;
  document.getElementById('sellerGstinChip').textContent = 'GSTIN: ' + c.gstin;
  document.getElementById('sellerStateCodeChip').textContent = 'State Code: ' + c.scode;
  box.style.display = 'block';
}

// ============ CLIENT DROPDOWN ============
function populateClientDropdown() {
  const sel = document.getElementById('inv-client-select');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">-- Select Client --</option>';
  DB.clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name + (c.mobile ? ' | ' + c.mobile : '');
    sel.appendChild(opt);
  });
  if (current) sel.value = current;
}

function selectClientFromDropdown(id) {
  if (!id) {
    document.getElementById('inv-custname').value = '';
    document.getElementById('inv-custmobile').value = '';
    document.getElementById('inv-custgst').value = '';
    document.getElementById('inv-custaddr').value = '';
    return;
  }
  const c = DB.clients.find(x => x.id === id);
  if (!c) return;
  document.getElementById('inv-custname').value = c.name;
  document.getElementById('inv-custmobile').value = c.mobile || '';
  document.getElementById('inv-custgst').value = c.gstin || '';
  document.getElementById('inv-custaddr').value = c.addr || '';
}

// ============ GST MODE ============
function setGSTMode(mode) {
  gstMode = mode;
  document.getElementById('gst-excl').classList.toggle('on', mode === 'exclusive');
  document.getElementById('gst-incl').classList.toggle('on', mode === 'inclusive');
  document.getElementById('gstModeHint').innerHTML = mode === 'exclusive'
    ? '💡 <strong>Excl. GST:</strong> Enter base rate — GST will be added on top. Total = Rate + Tax.'
    : '💡 <strong>Incl. GST:</strong> Enter rate with tax already included. Taxable = Rate ÷ (1 + GST%). Total = Rate × Qty.';
  calcTotals();
}

// ============ INVOICE INIT ============
function setDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('inv-date').value = today;
}

function initInvoice() {
  setDate();
  document.getElementById('inv-no').value = DB.settings.prefix + '-' + String(DB.settings.nextNum).padStart(3, '0');
  if (!document.getElementById('itemsBody').children.length) addItemRow();
  populateClientDropdown();
}

function resetInvoice() {
  document.getElementById('inv-seller').value = '';
  document.getElementById('sellerInfoBox').style.display = 'none';
  const clientSel = document.getElementById('inv-client-select');
  if (clientSel) clientSel.value = '';
  ['inv-custname','inv-custmobile','inv-custgst','inv-custaddr','inv-vehicle','inv-driver','inv-notes','inv-paid'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('inv-status').value = 'Paid';
  document.getElementById('itemsBody').innerHTML = '';
  initInvoice();
  calcTotals();
  setGSTMode('exclusive');
  populateSellerSelect();
  toast('Form reset', 'info');
}

// ============ ITEM ROWS ============
let rowCount = 0;
function getCatIcon(cat) {
  return { Transport:'🚛', Cement:'🏗️', Sand:'🏖️', Bricks:'🧱', Jelly:'⛏️' }[cat] || '📦';
}

function buildProductOptions(cat) {
  const filtered = cat ? DB.products.filter(p=>(p.category||'Other')===cat) : DB.products;
  if (!cat) {
    // Grouped by category
    const cats = [...new Set(DB.products.map(p=>p.category||'Other'))];
    return cats.map(c => {
      const prods = DB.products.filter(p=>(p.category||'Other')===c);
      return `<optgroup label="${getCatIcon(c)} ${c}">${prods.map(p=>`<option value="${p.id}">${p.name} — ₹${p.rate}/${p.unit}</option>`).join('')}</optgroup>`;
    }).join('');
  }
  return filtered.map(p=>`<option value="${p.id}">${p.icon||''} ${p.name} — ₹${p.rate}/${p.unit}</option>`).join('');
}

function addItemRow(item = {}) {
  rowCount++;
  const rId = 'row-' + rowCount;
  const tbody = document.getElementById('itemsBody');
  const tr = document.createElement('tr');
  tr.id = rId;
  const cats = [...new Set(DB.products.map(p=>p.category||'Other'))];
  tr.innerHTML = `
    <td style="text-align:center;color:var(--text3);font-size:11px;">${tbody.children.length + 1}</td>
    <td>
      <div style="display:flex;gap:4px;flex-direction:column;">
        <div style="display:flex;gap:4px;">
          <select id="catsel-${rId}" onchange="filterProductDropdown('${rId}')" style="background:var(--inp-bg);border:1px solid var(--accent);border-radius:5px;color:var(--accent);font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:600;padding:4px 5px;flex-shrink:0;width:100px;cursor:pointer;">
            <option value="">All Types</option>
            ${cats.map(c=>`<option value="${c}">${getCatIcon(c)} ${c}</option>`).join('')}
          </select>
          <select id="prodsel-${rId}" onchange="loadProduct(this,'${rId}')" style="background:var(--inp-bg);border:1px solid var(--border);border-radius:5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;padding:4px 5px;flex-shrink:0;width:175px;">
            <option value="">-- Pick Product --</option>
            ${buildProductOptions('')}
          </select>
        </div>
        <input value="${item.name||''}" placeholder="Description" oninput="calcTotals()" style="background:var(--inp-bg);border:1px solid var(--border);border-radius:5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;padding:5px 7px;width:100%;">
      </div>
    </td>
    <td><input value="${item.hsn||''}" placeholder="HSN" style="width:82px;background:var(--inp-bg);border:1px solid var(--border);border-radius:5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;padding:5px 7px;"></td>
    <td>
      <select style="width:60px;background:var(--inp-bg);border:1px solid var(--border);border-radius:5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;padding:5px 4px;">
        ${['Bag','Kg','Ton','Litre','Nos','Box','Pcs','MT','Trip','Load'].map(u => `<option${u===(item.unit||'Nos')?' selected':''}>${u}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" class="qty" value="${item.qty||1}" min="0" oninput="calcTotals()" style="width:55px;background:var(--inp-bg);border:1px solid var(--border);border-radius:5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;padding:5px 7px;"></td>
    <td><input type="number" class="rate" value="${item.rate||''}" min="0" placeholder="0.00" oninput="calcTotals()" style="width:82px;background:var(--inp-bg);border:1px solid var(--border);border-radius:5px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;padding:5px 7px;"></td>
    <td style="text-align:center;">
      <select class="gst-pct" id="gstval-${rId}" onchange="calcTotals()" style="width:68px;background:var(--inp-bg);border:1px solid var(--border);border-radius:5px;color:var(--green);font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;padding:5px 4px;cursor:pointer;text-align:center;">
        ${[0,5,12,18,28].map(g=>`<option value="${g}"${g===(item.gst||18)?' selected':''}>${g}%</option>`).join('')}
      </select>
    </td>
    <td class="td-total taxable">0.00</td>
    <td class="td-total cgst">0.00</td>
    <td class="td-total sgst">0.00</td>
    <td class="td-total rowtotal" style="font-weight:700;color:var(--accent);">0.00</td>
    <td><button class="del-row" onclick="delRow('${rId}')">✕</button></td>`;
  tbody.appendChild(tr);
  calcTotals();
}

function filterProductDropdown(rId) {
  const cat = document.getElementById('catsel-' + rId)?.value || '';
  const prodSel = document.getElementById('prodsel-' + rId);
  if (!prodSel) return;
  prodSel.innerHTML = '<option value="">-- Pick Product --</option>' + buildProductOptions(cat);
}


function loadProduct(sel, rId) {
  const id = sel.value;
  if (!id) return;
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  const row = document.getElementById(rId);
  // description — last text input in the product cell
  const descInput = row.querySelector('input:not([type="number"]):not([type="hidden"])');
  if (descInput) descInput.value = p.name;
  // hsn — td index 2
  const hsnInput = row.querySelectorAll('td')[2]?.querySelector('input');
  if (hsnInput) hsnInput.value = p.hsn || '';
  // unit — 3rd select in row (0=catsel, 1=prodsel, 2=unitsel)
  const unitSel = row.querySelectorAll('select')[2];
  if (unitSel) Array.from(unitSel.options).forEach(o => o.selected = o.text === p.unit);
  // rate
  const rateInput = row.querySelector('.rate');
  if (rateInput) rateInput.value = p.rate;
  // gst — set dropdown value
  const gstVal = document.getElementById('gstval-' + rId);
  if (gstVal) gstVal.value = p.gst;
  calcTotals();
}

function delRow(rId) {
  document.getElementById(rId)?.remove();
  document.querySelectorAll('#itemsBody tr').forEach((r, i) => {
    if (r.cells[0]) r.cells[0].textContent = i + 1;
  });
  calcTotals();
}

// ============ CALCULATE TOTALS ============
function calcTotals() {
  let totalTaxable = 0, totalCGST = 0, totalSGST = 0;
  document.querySelectorAll('#itemsBody tr').forEach(row => {
    const qty = parseFloat(row.querySelector('.qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.rate')?.value) || 0;
    const rId = row.id;
    const gstPct = parseFloat(document.getElementById('gstval-' + rId)?.value) || 0;
    let taxable = 0, cgst = 0, sgst = 0, rowTotal = 0;
    if (gstMode === 'exclusive') {
      taxable = qty * rate;
      cgst = taxable * (gstPct / 2) / 100;
      sgst = cgst;
      rowTotal = taxable + cgst + sgst;
    } else {
      rowTotal = qty * rate;
      taxable = rowTotal / (1 + gstPct / 100);
      cgst = taxable * (gstPct / 2) / 100;
      sgst = cgst;
    }
    totalTaxable += taxable;
    totalCGST += cgst;
    totalSGST += sgst;
    if (row.querySelector('.taxable')) row.querySelector('.taxable').textContent = taxable.toFixed(2);
    if (row.querySelector('.cgst')) row.querySelector('.cgst').textContent = cgst.toFixed(2);
    if (row.querySelector('.sgst')) row.querySelector('.sgst').textContent = sgst.toFixed(2);
    if (row.querySelector('.rowtotal')) row.querySelector('.rowtotal').textContent = rowTotal.toFixed(2);
  });
  const gross = totalTaxable + totalCGST + totalSGST;
  const rounded = Math.round(gross);
  const roundOff = rounded - gross;
  document.getElementById('t-taxable').textContent = '₹' + totalTaxable.toFixed(2);
  document.getElementById('t-cgst').textContent = '₹' + totalCGST.toFixed(2);
  document.getElementById('t-sgst').textContent = '₹' + totalSGST.toFixed(2);
  document.getElementById('t-totalgst').textContent = '₹' + (totalCGST + totalSGST).toFixed(2);
  document.getElementById('t-round').textContent = (roundOff >= 0 ? '+' : '') + roundOff.toFixed(2);
  document.getElementById('t-grand').textContent = '₹' + rounded.toLocaleString('en-IN');
  calcPaidBalance(rounded);
}

function calcPaidBalance(grand) {
  if (grand === undefined) {
    const txt = document.getElementById('t-grand').textContent.replace('₹','').replace(/,/g,'');
    grand = parseFloat(txt) || 0;
  }
  const paid = parseFloat(document.getElementById('inv-paid')?.value) || 0;
  const balance = grand - paid;
  document.getElementById('t-paid').textContent = '₹' + paid.toLocaleString('en-IN', {minimumFractionDigits:2});
  const balEl = document.getElementById('t-balance');
  balEl.textContent = '₹' + Math.abs(balance).toLocaleString('en-IN', {minimumFractionDigits:2}) + (balance < 0 ? ' (Overpaid)' : '');
  balEl.style.color = balance > 0 ? 'var(--red)' : 'var(--green)';
}

// ============ SAVE INVOICE ============
function saveInvoice() {
  const sellerId = document.getElementById('inv-seller').value;
  const custName = document.getElementById('inv-custname').value.trim();
  const custMobile = document.getElementById('inv-custmobile').value.trim();
  if (!sellerId) { toast('Please select a GST Company (Seller)', 'error'); return; }
  if (!custName) { toast('Customer name required', 'error'); return; }
  if (!custMobile) { toast('Customer mobile required', 'error'); return; }
  const items = [];
  let hasProd = false;
  document.querySelectorAll('#itemsBody tr').forEach(row => {
    const inputs = row.querySelectorAll('td');
    const desc = row.querySelector('input:not([type="number"]):not([type="hidden"])')?.value?.trim();
    const hsnInp = inputs[2]?.querySelector('input');
    const unitSel = row.querySelectorAll('select')[2];
    const qty = parseFloat(row.querySelector('.qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.rate')?.value) || 0;
    const gstPct = parseFloat(document.getElementById('gstval-' + row.id)?.value) || 0;
    if (!desc || qty <= 0 || rate <= 0) return;
    hasProd = true;
    let taxable, cgst, sgst, rowTotal;
    if (gstMode === 'exclusive') {
      taxable = qty * rate; cgst = taxable * (gstPct/2)/100; sgst = cgst; rowTotal = taxable + cgst + sgst;
    } else {
      rowTotal = qty * rate; taxable = rowTotal / (1 + gstPct/100); cgst = taxable*(gstPct/2)/100; sgst = cgst;
    }
    items.push({ desc, hsn: hsnInp?.value||'', unit: unitSel?.value||'Nos', qty, rate, gstPct, taxable, cgst, sgst, total: rowTotal });
  });
  if (!hasProd) { toast('Add at least one product row with price', 'error'); return; }
  const totTaxable = items.reduce((a,b) => a+b.taxable, 0);
  const totCGST = items.reduce((a,b) => a+b.cgst, 0);
  const totSGST = items.reduce((a,b) => a+b.sgst, 0);
  const gross = totTaxable + totCGST + totSGST;
  const grandTotal = Math.round(gross);
  const paidAmt = parseFloat(document.getElementById('inv-paid').value) || 0;
  const seller = DB.companies.find(x => x.id === sellerId) || {};
  const inv = {
    id: uid(),
    invoiceNo: document.getElementById('inv-no').value,
    date: document.getElementById('inv-date').value,
    sellerId,
    sellerSnap: { name: seller.name, gstin: seller.gstin, state: seller.state, scode: seller.scode, addr: seller.addr, bank: seller.bank, acno: seller.acno, ifsc: seller.ifsc, branch: seller.branch, holder: seller.holder },
    custName, custMobile,
    custGst: document.getElementById('inv-custgst').value.trim().toUpperCase(),
    custAddr: document.getElementById('inv-custaddr').value.trim(),
    vehicleNo: document.getElementById('inv-vehicle').value.trim().toUpperCase(),
    driverName: document.getElementById('inv-driver').value.trim(),
    gstMode,
    payMethod: document.getElementById('inv-pay').value,
    status: document.getElementById('inv-status').value,
    notes: document.getElementById('inv-notes').value.trim(),
    items, totTaxable, totCGST, totSGST,
    totalGST: totCGST + totSGST,
    roundOff: grandTotal - gross,
    grandTotal, paidAmt,
    balanceAmt: grandTotal - paidAmt
  };
  DB.invoices.push(inv);
  DB.settings.nextNum++;
  saveDB();
  toast('Invoice ' + inv.invoiceNo + ' saved! 🎉', 'success');
  resetInvoice();
  renderDashboard();
}

// ============ BUILD PRINT HTML ============
// ============ PRINT INVOICE ============
function buildInvoiceHTML(inv) {
  const seller = inv.sellerSnap || {};
  const client = {
    name: inv.custName || '',
    gstin: inv.custGst || '',
    addr: inv.custAddr || '',
    mobile: inv.custMobile || '',
    state: '',
    scode: ''
  };
  const rows = inv.items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${it.desc}</td>
      <td>${it.hsn || ''}</td>
      <td>${it.qty}</td>
      <td>${it.unit || ''}</td>
      <td class="r">₹${it.rate.toFixed(2)}</td>
      <td class="r">₹${it.taxable.toFixed(2)}</td>
      <td class="r">${it.gstPct}%</td>
      <td class="r">₹${it.cgst.toFixed(2)}</td>
      <td class="r">₹${it.sgst.toFixed(2)}</td>
      <td class="r" style="font-weight:700;">₹${it.total.toFixed(2)}</td>
    </tr>`).join('');
  const gstRows = [...new Set(inv.items.map(i => i.gstPct))].map(pct => {
    const iis = inv.items.filter(i => i.gstPct === pct);
    const tx = iis.reduce((a, b) => a + b.taxable, 0);
    const cg = iis.reduce((a, b) => a + b.cgst, 0);
    const sg = iis.reduce((a, b) => a + b.sgst, 0);
    return `<tr><td>${pct}%</td><td class="r">₹${tx.toFixed(2)}</td><td class="r">${pct / 2}%</td><td class="r">₹${cg.toFixed(2)}</td><td class="r">${pct / 2}%</td><td class="r">₹${sg.toFixed(2)}</td><td class="r">₹${(cg+sg).toFixed(2)}</td></tr>`;
  }).join('');
  function numWords(n) {
    const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '');
    if (n < 1000) return a[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + numWords(n%100) : '');
    if (n < 100000) return numWords(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + numWords(n%1000) : '');
    if (n < 10000000) return numWords(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + numWords(n%100000) : '');
    return numWords(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' ' + numWords(n%10000000) : '');
  }
  const grandWords = 'INR ' + numWords(inv.grandTotal) + ' Only';
  const gstWords = 'INR ' + numWords(Math.round(inv.totalGST)) + ' Only';
  const invHtml = `<div class="inv">
    <div class="inv-title-bar">TAX INVOICE</div>
    <div class="inv-top">
      <div class="inv-seller">
        <div class="inv-seller-name">${seller.name || ''}</div>
        <div class="inv-seller-gstin">GSTIN: ${seller.gstin || ''}</div>
        <div class="inv-seller-addr">${seller.addr || ''}<br>${seller.phone ? 'Ph: ' + seller.phone : ''}${seller.email ? ' | ' + seller.email : ''}</div>
        <div style="font-size:10.5px;margin-top:4px;">State: ${seller.state || ''} | Code: ${seller.scode || ''}</div>
      </div>
      <div class="inv-meta">
        <table class="inv-meta-table">
          <tr><td>Invoice No.</td><td><strong>${inv.invoiceNo}</strong></td></tr>
          <tr><td>Date</td><td>${inv.date}</td></tr>
          <tr><td>Payment</td><td>${inv.payMethod}</td></tr>
          <tr><td>Status</td><td><span style="font-weight:700;color:${inv.status==='Paid'?'#059669':inv.status==='Unpaid'?'#dc2626':'#d97706'}">${inv.status}</span></td></tr>
          <tr><td>GST Type</td><td>${inv.gstMode === 'exclusive' ? 'Exclusive (+ GST)' : 'Inclusive (GST included)'}</td></tr>
        </table>
      </div>
    </div>
    <div class="inv-parties">
      <div class="inv-party">
        <div class="inv-party-lbl">Consignee (Ship To)</div>
        <div class="inv-party-name">${client.name || ''}</div>
        <div class="inv-party-gstin">${client.gstin ? 'GSTIN: ' + client.gstin : ''}</div>
        <div class="inv-party-addr">${client.addr || ''}</div>
        <div style="font-size:10px;margin-top:3px;">State: ${client.state || ''} | Code: ${client.scode || ''}</div>
      </div>
      <div class="inv-party">
        <div class="inv-party-lbl">Buyer (Bill To)</div>
        <div class="inv-party-name">${client.name || ''}</div>
        <div class="inv-party-gstin">${client.gstin ? 'GSTIN: ' + client.gstin : ''}</div>
        <div class="inv-party-addr">${client.addr || ''}</div>
        <div style="font-size:10px;margin-top:3px;">Mobile: ${client.mobile || ''}</div>
      </div>
    </div>
    <table class="inv-items-tbl">
      <thead><tr><th>#</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Unit</th><th class="r">Rate (₹)</th><th class="r">Taxable (₹)</th><th>GST%</th><th class="r">CGST (₹)</th><th class="r">SGST (₹)</th><th class="r">Total (₹)</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="6" style="font-weight:700;background:#f9fafb;">Total</td><td class="r" style="font-weight:700;">₹${inv.totTaxable.toFixed(2)}</td><td></td><td class="r" style="font-weight:700;">₹${inv.totCGST.toFixed(2)}</td><td class="r" style="font-weight:700;">₹${inv.totSGST.toFixed(2)}</td><td class="r" style="font-weight:800;">₹${(inv.grandTotal).toLocaleString('en-IN')}</td></tr></tfoot>
    </table>
    <div class="inv-words-box">Amount: <strong>${grandWords}</strong></div>
    <div style="display:flex;gap:12px;margin-top:6px;">
      <div style="flex:1;">
        <table class="inv-gst-tbl">
          <thead><tr><th>GST %</th><th class="r">Taxable</th><th>CGST %</th><th class="r">CGST</th><th>SGST %</th><th class="r">SGST</th><th class="r">Total Tax</th></tr></thead>
          <tbody>${gstRows}</tbody>
          <tfoot><tr><td colspan="3" style="font-weight:700;background:#f9fafb;">Total Tax</td><td class="r" style="font-weight:700;">₹${inv.totCGST.toFixed(2)}</td><td></td><td class="r" style="font-weight:700;">₹${inv.totSGST.toFixed(2)}</td><td class="r" style="font-weight:700;">₹${inv.totalGST.toFixed(2)}</td></tr></tfoot>
        </table>
        <div style="font-size:10.5px;color:#555;margin-top:4px;">Tax Amount: <strong>${gstWords}</strong></div>
      </div>
      <div style="min-width:230px;">
        <div class="inv-totals-row"><span>Taxable Amount</span><span>₹${inv.totTaxable.toFixed(2)}</span></div>
        <div class="inv-totals-row"><span>CGST</span><span>₹${inv.totCGST.toFixed(2)}</span></div>
        <div class="inv-totals-row"><span>SGST</span><span>₹${inv.totSGST.toFixed(2)}</span></div>
        <div class="inv-totals-row"><span>Round Off</span><span>${inv.roundOff >= 0 ? '+' : ''}${inv.roundOff.toFixed(2)}</span></div>
        <div class="inv-totals-row grand-row"><span>Grand Total</span><span>₹${inv.grandTotal.toLocaleString('en-IN')}</span></div>
      </div>
    </div>
    <div class="inv-footer-grid">
      <div class="inv-bank-box">
        <strong>Company Bank Details</strong>
        <div class="inv-bank-row"><span>A/C Holder</span><span>${seller.holder || seller.name || ''}</span></div>
        <div class="inv-bank-row"><span>Bank Name</span><span>${seller.bank || ''}</span></div>
        <div class="inv-bank-row"><span>A/C Number</span><span>${seller.acno || ''}</span></div>
        <div class="inv-bank-row"><span>IFSC Code</span><span>${seller.ifsc || ''}</span></div>
        <div class="inv-bank-row" style="border:none;"><span>Branch</span><span>${seller.branch || ''}</span></div>
      </div>
      <div class="inv-sign-box">
        <p>For <strong>${seller.name || ''}</strong></p>
        <strong>Authorised Signatory</strong>
        <div class="inv-declare">This is a Computer Generated Invoice. We declare that this invoice shows the actual price of the goods described and all particulars are true and correct.</div>
      </div>
    </div>
    ${inv.notes ? `<div style="margin-top:10px;padding:6px 10px;background:#f9fafb;border-radius:4px;font-size:11px;"><strong>Notes:</strong> ${inv.notes}</div>` : ''}
  </div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${inv.invoiceNo}</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Plus Jakarta Sans',Arial,sans-serif;background:#f0f4f8;display:flex;justify-content:center;padding:20px;max-width:210mm;margin:0 auto;}@media print{body{background:#fff;padding:0;max-width:100%;margin:0;}}@page{size:A4;margin:10mm 12mm}.inv{font-family:'Plus Jakarta Sans',sans-serif;font-size:11.5px;color:#111;background:#fff;}
.inv-title-bar{background:#f59e0b;color:#000;text-align:center;padding:8px;font-size:16px;font-weight:800;font-family:'Syne',sans-serif;border-radius:4px 4px 0 0;letter-spacing:.5px;}
.inv-top{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #d1d5db;border-top:none;}
.inv-seller{padding:12px;border-right:1px solid #d1d5db;}
.inv-seller-name{font-size:15px;font-weight:800;color:#000;}
.inv-seller-gstin{font-size:11px;font-weight:700;color:#b45309;margin-top:2px;}
.inv-seller-addr{font-size:11px;color:#555;margin-top:4px;line-height:1.6;}
.inv-meta{padding:10px 12px;}
.inv-meta-table{width:100%;border-collapse:collapse;}
.inv-meta-table td{padding:3px 5px;font-size:11px;border:1px solid #e5e7eb;}
.inv-meta-table td:first-child{font-weight:600;background:#f9fafb;width:45%;}
.inv-parties{display:grid;grid-template-columns:1fr 1fr;border:1px solid #d1d5db;border-top:none;}
.inv-party{padding:10px 12px;}
.inv-party:first-child{border-right:1px solid #d1d5db;}
.inv-party-lbl{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;margin-bottom:5px;}
.inv-party-name{font-size:13px;font-weight:700;}
.inv-party-gstin{font-size:10.5px;font-weight:700;color:#b45309;margin-top:2px;}
.inv-party-addr{font-size:10.5px;color:#555;margin-top:3px;line-height:1.5;}
.inv-items-tbl{width:100%;border-collapse:collapse;margin-top:0;}
.inv-items-tbl th{background:#f1f5f9;border:1px solid #d1d5db;padding:6px 8px;font-size:10px;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:.4px;}
.inv-items-tbl td{border:1px solid #d1d5db;padding:5px 8px;font-size:11px;}
.inv-items-tbl .r{text-align:right;}
.inv-gst-tbl{width:100%;border-collapse:collapse;margin-top:0;}
.inv-gst-tbl th{background:#fef3c7;border:1px solid #d1d5db;padding:5px 8px;font-size:10px;font-weight:700;text-transform:uppercase;}
.inv-gst-tbl td{border:1px solid #d1d5db;padding:4px 8px;font-size:11px;}
.inv-gst-tbl .r{text-align:right;}
.inv-totals-row{display:flex;justify-content:space-between;padding:3px 0;font-size:11.5px;}
.inv-totals-row.grand-row{font-size:14px;font-weight:800;border-top:2px solid #000;padding-top:6px;margin-top:4px;}
.inv-words-box{background:#fffbeb;border:1px solid #fcd34d;border-radius:4px;padding:7px 10px;font-size:11px;font-weight:700;margin:8px 0;}
.inv-footer-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;}
.inv-bank-box{border:1px solid #d1d5db;border-radius:4px;padding:10px;font-size:11px;}
.inv-bank-box strong{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;margin-bottom:5px;}
.inv-bank-row{display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid #f3f4f6;}
.inv-sign-box{text-align:right;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;min-width:0;}
.inv-sign-box p{font-size:10.5px;color:#555;margin-bottom:40px;}
.inv-sign-box strong{font-size:12px;font-weight:700;}
.inv-declare{font-size:10px;color:#777;font-style:italic;margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;word-wrap:break-word;overflow-wrap:break-word;white-space:normal;}</style></head><body>${invHtml}</body></html>`;
}

function printInvoice() {
  const sellerId = document.getElementById('inv-seller').value;
  const custName = document.getElementById('inv-custname').value.trim();
  if (!sellerId || !custName) { toast('Fill seller and customer before printing', 'warn'); return; }
  const items = [];
  document.querySelectorAll('#itemsBody tr').forEach(row => {
    const desc = row.querySelector('input:not([type="number"]):not([type="hidden"])')?.value?.trim();
    const qty = parseFloat(row.querySelector('.qty')?.value) || 0;
    const rate = parseFloat(row.querySelector('.rate')?.value) || 0;
    const gstPct = parseFloat(document.getElementById('gstval-' + row.id)?.value) || 0;
    const hsnInp = row.querySelectorAll('td')[2]?.querySelector('input');
    const unitSel = row.querySelectorAll('select')[2];
    if (!desc) return;
    let taxable, cgst, sgst, rowTotal;
    if (gstMode === 'exclusive') {
      taxable = qty*rate; cgst=taxable*(gstPct/2)/100; sgst=cgst; rowTotal=taxable+cgst+sgst;
    } else {
      rowTotal=qty*rate; taxable=rowTotal/(1+gstPct/100); cgst=taxable*(gstPct/2)/100; sgst=cgst;
    }
    items.push({ desc, hsn:hsnInp?.value||'', unit:unitSel?.value||'Nos', qty, rate, gstPct, taxable, cgst, sgst, total:rowTotal });
  });
  const totTaxable=items.reduce((a,b)=>a+b.taxable,0);
  const totCGST=items.reduce((a,b)=>a+b.cgst,0);
  const totSGST=items.reduce((a,b)=>a+b.sgst,0);
  const gross=totTaxable+totCGST+totSGST;
  const grandTotal=Math.round(gross);
  const paidAmt=parseFloat(document.getElementById('inv-paid').value)||0;
  const seller=DB.companies.find(x=>x.id===sellerId)||{};
  const tempInv={
    invoiceNo:document.getElementById('inv-no').value, date:document.getElementById('inv-date').value,
    sellerSnap:{name:seller.name,gstin:seller.gstin,state:seller.state,scode:seller.scode,addr:seller.addr,bank:seller.bank,acno:seller.acno,ifsc:seller.ifsc,branch:seller.branch,holder:seller.holder},
    custName, custMobile:document.getElementById('inv-custmobile').value,
    custGst:document.getElementById('inv-custgst').value.toUpperCase(),
    custAddr:document.getElementById('inv-custaddr').value,
    vehicleNo:document.getElementById('inv-vehicle').value.toUpperCase(),
    driverName:document.getElementById('inv-driver').value,
    gstMode, payMethod:document.getElementById('inv-pay').value,
    status:document.getElementById('inv-status').value,
    notes:document.getElementById('inv-notes').value,
    items, totTaxable, totCGST, totSGST, totalGST:totCGST+totSGST,
    roundOff:grandTotal-gross, grandTotal, paidAmt, balanceAmt:grandTotal-paidAmt
  };
  const win = window.open('','_blank');
  win.document.write(buildInvoiceHTML(tempInv));
  win.document.close();
  setTimeout(() => win.print(), 400);
}

// ============ DASHBOARD ============
function renderDashboard() {
  const total = DB.invoices.length;
  const revenue = DB.invoices.filter(i => i.status === 'Paid').reduce((a,b) => a+b.grandTotal, 0);
  const pending = DB.invoices.filter(i => i.status === 'Unpaid' || i.status === 'Partial').reduce((a,b) => a+b.grandTotal, 0);
  document.getElementById('s-total').textContent = total;
  document.getElementById('s-revenue').textContent = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('s-clients').textContent = DB.clients.length;
  document.getElementById('s-pending').textContent = '₹' + pending.toLocaleString('en-IN');
  const recent = [...DB.invoices].reverse().slice(0, 8);
  const el = document.getElementById('recentInvList');
  if (!recent.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">🧾</div><h3>No Invoices Yet</h3><p>Create your first invoice!</p></div>'; return; }
  const sc = { Paid:'b-green', Unpaid:'b-red', Partial:'b-amber', Draft:'b-gray' };
  el.innerHTML = `<div class="tbl-wrap"><table>
    <thead><tr><th>Invoice No</th><th>Date</th><th>Customer</th><th>Vehicle</th><th>Seller GSTIN</th><th class="td-r">Grand Total</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${recent.map(inv => `<tr>
      <td><strong style="color:var(--accent)">${inv.invoiceNo}</strong></td>
      <td>${inv.date}</td>
      <td>${inv.custName}</td>
      <td>${inv.vehicleNo ? `<span class="vehicle-badge">🚛 ${inv.vehicleNo}</span>` : '<span style="color:var(--text3)">—</span>'}</td>
      <td style="font-size:10px;font-family:monospace;color:var(--accent)">${inv.sellerSnap?.gstin||'—'}</td>
      <td class="td-r"><strong>₹${inv.grandTotal.toLocaleString('en-IN')}</strong></td>
      <td>${inv.balanceAmt > 0 ? `<span style="color:var(--red);font-weight:700;font-size:11px;">₹${inv.balanceAmt.toLocaleString('en-IN')}</span>` : '<span style="color:var(--green);font-size:11px;">Settled</span>'}</td>
      <td><span class="badge ${sc[inv.status]||'b-gray'}">${inv.status}</span></td>
      <td><button class="btn btn-ghost btn-xs" onclick="viewInvoice('${inv.id}')">👁 View</button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

// ============ HISTORY ============
function renderHistory() {
  const search = document.getElementById('histSearch')?.value?.toLowerCase() || '';
  const statusFilter = document.getElementById('histStatus')?.value || '';
  let invs = [...DB.invoices].reverse();
  if (search) invs = invs.filter(i => i.invoiceNo.toLowerCase().includes(search) || i.custName.toLowerCase().includes(search) || (i.vehicleNo||'').toLowerCase().includes(search));
  if (statusFilter) invs = invs.filter(i => i.status === statusFilter);
  const el = document.getElementById('histList');
  if (!invs.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">📋</div><h3>No invoices found</h3></div>'; return; }
  const sc = { Paid:'b-green', Unpaid:'b-red', Partial:'b-amber', Draft:'b-gray' };
  el.innerHTML = `<div class="tbl-wrap"><table>
    <thead><tr><th>Invoice No</th><th>Date</th><th>Customer</th><th>Vehicle</th><th>Seller GSTIN</th><th class="td-r">Grand Total</th><th>Balance</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${invs.map(inv => `<tr>
      <td><strong style="color:var(--accent)">${inv.invoiceNo}</strong></td>
      <td>${inv.date}</td>
      <td><div style="font-weight:600">${inv.custName}</div><div style="font-size:10px;color:var(--text3)">${inv.custMobile}</div></td>
      <td>${inv.vehicleNo ? `<span class="vehicle-badge" style="font-size:10px;">🚛 ${inv.vehicleNo}</span>` : '—'}</td>
      <td style="font-size:10px;font-family:monospace;color:var(--accent)">${inv.sellerSnap?.gstin||'—'}</td>
      <td class="td-r"><strong>₹${inv.grandTotal.toLocaleString('en-IN')}</strong></td>
      <td>${inv.balanceAmt > 0 ? `<span style="color:var(--red);font-weight:700;font-size:11px;">₹${inv.balanceAmt.toLocaleString('en-IN')}</span>` : '<span style="color:var(--green);font-size:11px;">✓ Settled</span>'}</td>
      <td>${inv.payMethod}</td>
      <td><span class="badge ${sc[inv.status]||'b-gray'}">${inv.status}</span></td>
      <td style="display:flex;gap:4px;">
        <button class="btn btn-ghost btn-xs" onclick="viewInvoice('${inv.id}')">👁</button>
        <button class="btn btn-primary btn-xs" onclick="printFromHistory('${inv.id}')">🖨</button>
        <button class="btn btn-danger btn-xs" onclick="deleteInvoice('${inv.id}')">✕</button>
      </td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function viewInvoice(id) {
  viewingInvId = id;
  const inv = DB.invoices.find(x => x.id === id);
  if (!inv) return;
  // Show a summary in modal
  const seller = inv.sellerSnap || {};
  const sc = { Paid:'b-green', Unpaid:'b-red', Partial:'b-amber', Draft:'b-gray' };
  document.getElementById('invViewBody').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
      <div class="info-box" style="border-left:3px solid var(--accent);">
        <strong>Invoice Details</strong>
        <div style="font-size:12px;line-height:1.8;margin-top:5px;">
          <div><b>No:</b> ${inv.invoiceNo}</div>
          <div><b>Date:</b> ${inv.date}</div>
          <div><b>Payment:</b> ${inv.payMethod}</div>
          <div><b>Status:</b> <span class="badge ${sc[inv.status]||'b-gray'}">${inv.status}</span></div>
        </div>
      </div>
      <div class="info-box" style="border-left:3px solid var(--blue);">
        <strong>Customer</strong>
        <div style="font-size:12px;line-height:1.8;margin-top:5px;">
          <div><b>${inv.custName}</b></div>
          <div>${inv.custMobile}</div>
          ${inv.custGst?`<div style="font-family:monospace;font-size:11px;">GSTIN: ${inv.custGst}</div>`:''}
          ${inv.custAddr?`<div>${inv.custAddr}</div>`:''}
        </div>
      </div>
    </div>
    ${inv.vehicleNo?`<div class="info-box" style="border-left:3px solid var(--green);margin-bottom:12px;">
      <strong>Vehicle & Driver</strong>
      <div style="font-size:12px;margin-top:5px;display:flex;gap:20px;">
        <span>🚛 <b>${inv.vehicleNo}</b></span>
        ${inv.driverName?`<span>👨‍✈️ ${inv.driverName}</span>`:''}
      </div>
    </div>`:''}
    <div class="tbl-wrap" style="margin-bottom:12px;">
      <table>
        <thead><tr><th>#</th><th>Product</th><th>HSN</th><th>Unit</th><th>Qty</th><th class="td-r">Rate</th><th class="td-r">Taxable</th><th class="td-c">GST%</th><th class="td-r">Total</th></tr></thead>
        <tbody>${inv.items.map((it,i)=>`<tr><td>${i+1}</td><td>${it.desc}</td><td>${it.hsn||'—'}</td><td>${it.unit}</td><td>${it.qty}</td><td class="td-r">₹${it.rate.toFixed(2)}</td><td class="td-r">₹${it.taxable.toFixed(2)}</td><td class="td-c">${it.gstPct}%</td><td class="td-r" style="font-weight:700;">₹${it.total.toFixed(2)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:flex-end;">
      <div class="totals-box" style="min-width:260px;">
        <div class="tot-row"><span style="color:var(--text2)">Taxable</span><span>₹${inv.totTaxable.toFixed(2)}</span></div>
        <div class="tot-row"><span style="color:var(--text2)">CGST+SGST</span><span>₹${inv.totalGST.toFixed(2)}</span></div>
        <hr class="tot-sep">
        <div class="tot-row grand"><span>Grand Total</span><span>₹${inv.grandTotal.toLocaleString('en-IN')}</span></div>
        <div class="tot-row paid-row"><span>Paid</span><span>₹${(inv.paidAmt||0).toFixed(2)}</span></div>
        <div class="tot-row balance-row"><span>Balance Due</span><span>₹${(inv.balanceAmt||0).toFixed(2)}</span></div>
      </div>
    </div>`;
  openModal('invViewModal');
}

function printFromView() {
  if (!viewingInvId) return;
  const inv = DB.invoices.find(x => x.id === viewingInvId);
  if (inv) { const w=window.open('','_blank'); w.document.write(buildInvoiceHTML(inv)); w.document.close(); setTimeout(()=>w.print(),400); }
}

function printFromHistory(id) {
  const inv = DB.invoices.find(x => x.id === id);
  if (inv) { const w=window.open('','_blank'); w.document.write(buildInvoiceHTML(inv)); w.document.close(); setTimeout(()=>w.print(),400); }
}

function deleteInvoice(id) {
  document.getElementById('deleteMsg').textContent = 'Are you sure you want to delete this invoice? This cannot be undone.';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.invoices = DB.invoices.filter(x => x.id !== id);
    saveDB(); toast('Invoice deleted', 'info'); closeModal('deleteModal');
    renderHistory(); renderDashboard();
  };
  openModal('deleteModal');
}

// ============ CLIENTS ============
function renderClients() {
  const el = document.getElementById('clientGrid');
  const search = (document.getElementById('clientSearch')?.value || '').toLowerCase();
  const typeF  = document.getElementById('clientTypeFilter')?.value || '';
  let list = DB.clients;
  if (search) list = list.filter(c => c.name.toLowerCase().includes(search) || (c.mobile||'').includes(search) || (c.gstin||'').toLowerCase().includes(search));
  if (typeF)  list = list.filter(c => c.type === typeF);
  if (!list.length) { el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ico">👥</div><h3>No clients found</h3><p>' + (search||typeF ? 'Try a different filter.' : 'Add your first client!') + '</p></div>'; return; }
  const typeColors = { Regular:'b-blue', VIP:'b-amber', Corporate:'b-purple', 'One-time':'b-gray' };
  el.innerHTML = list.map(c => {
    const invs = DB.invoices.filter(i => i.custName === c.name || i.custMobile === c.mobile);
    const total = invs.reduce((a,b) => a+b.grandTotal, 0);
    return `<div class="client-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div class="client-name">${c.name}</div>
        <span class="badge ${typeColors[c.type]||'b-gray'}">${c.type}</span>
      </div>
      ${c.gstin?`<div class="client-gstin">GSTIN: ${c.gstin}</div>`:''}
      <div class="client-info">${c.addr}<br>📞 ${c.mobile}${c.email?'<br>✉ '+c.email:''}</div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
        <div><div style="font-size:11px;color:var(--text2);">Total</div><div style="font-size:14px;font-weight:700;">${invs.length} | ₹${total.toLocaleString('en-IN')}</div></div>
        <div style="display:flex;gap:5px;">
          <button class="btn btn-ghost btn-xs" onclick="clientHistory('${c.id}')">📋</button>
          <button class="btn btn-ghost btn-xs" onclick="editClient('${c.id}')">✏️</button>
          <button class="btn btn-danger btn-xs" onclick="deleteClient('${c.id}')">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function clientHistory(id) {
  const cl = DB.clients.find(x => x.id === id);
  if (!cl) return;
  document.getElementById('clientHistTitle').textContent = cl.name + ' — Purchase History';
  const invs = DB.invoices.filter(i => i.custName === cl.name || i.custMobile === cl.mobile);
  const el = document.getElementById('clientHistBody');
  if (!invs.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">📋</div><h3>No purchases yet</h3></div>'; openModal('clientHistModal'); return; }
  const totalSpend = invs.reduce((a,b) => a+b.grandTotal, 0);
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
      <div class="stat"><div class="stat-icon">🧾</div><div class="stat-val">${invs.length}</div><div class="stat-lbl">Invoices</div></div>
      <div class="stat"><div class="stat-icon">💰</div><div class="stat-val">₹${totalSpend.toLocaleString('en-IN')}</div><div class="stat-lbl">Total Spent</div></div>
      <div class="stat"><div class="stat-icon">⏳</div><div class="stat-val">₹${invs.filter(i=>i.balanceAmt>0).reduce((a,b)=>a+b.balanceAmt,0).toLocaleString('en-IN')}</div><div class="stat-lbl">Balance Due</div></div>
    </div>
    <div class="card"><div class="card-title" style="margin-bottom:10px;">Invoice History</div>
      <div class="tbl-wrap"><table>
        <thead><tr><th>Invoice No</th><th>Date</th><th>Vehicle</th><th class="td-r">Grand Total</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${[...invs].reverse().map(inv => {
          const sc={Paid:'b-green',Unpaid:'b-red',Partial:'b-amber',Draft:'b-gray'};
          return `<tr><td><strong>${inv.invoiceNo}</strong></td><td>${inv.date}</td>
            <td>${inv.vehicleNo||'—'}</td>
            <td class="td-r">₹${inv.grandTotal.toLocaleString('en-IN')}</td>
            <td>${inv.balanceAmt>0?`<span style="color:var(--red);font-weight:700;">₹${inv.balanceAmt.toLocaleString('en-IN')}</span>`:'<span style="color:var(--green)">Settled</span>'}</td>
            <td><span class="badge ${sc[inv.status]||'b-gray'}">${inv.status}</span></td>
            <td><button class="btn btn-primary btn-xs" onclick="printFromHistory('${inv.id}')">🖨</button></td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`;
  openModal('clientHistModal');
}

function saveClient() {
  const name = document.getElementById('cm-name').value.trim();
  const mobile = document.getElementById('cm-mobile').value.trim();
  const addr = document.getElementById('cm-addr').value.trim();
  if (!name || !mobile || !addr) { toast('Name, mobile & address required', 'error'); return; }
  const obj = {
    id: editingClientId || uid(), name, mobile,
    gstin: document.getElementById('cm-gstin').value.trim().toUpperCase(),
    email: document.getElementById('cm-email').value.trim(),
    addr,
    state: document.getElementById('cm-state').value.trim(),
    scode: document.getElementById('cm-scode').value.trim(),
    type: document.getElementById('cm-type').value
  };
  if (editingClientId) {
    const idx = DB.clients.findIndex(x => x.id === editingClientId);
    if (idx > -1) DB.clients[idx] = obj;
    toast('Client updated!', 'success');
  } else {
    DB.clients.push(obj);
    toast('Client added!', 'success');
  }
  saveDB(); renderClients(); populateClientDropdown();
  closeModal('clientModal'); clearClientForm();
}

function editClient(id) {
  editingClientId = id;
  const c = DB.clients.find(x => x.id === id);
  if (!c) return;
  document.getElementById('clientModalTitle').textContent = 'Edit Client';
  document.getElementById('cm-name').value = c.name;
  document.getElementById('cm-mobile').value = c.mobile;
  document.getElementById('cm-gstin').value = c.gstin || '';
  document.getElementById('cm-email').value = c.email || '';
  document.getElementById('cm-addr').value = c.addr;
  document.getElementById('cm-state').value = c.state || '';
  document.getElementById('cm-scode').value = c.scode || '';
  document.getElementById('cm-type').value = c.type || 'Regular';
  openModal('clientModal');
}

function deleteClient(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this client? Their invoices will remain.';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.clients = DB.clients.filter(x => x.id !== id);
    saveDB(); renderClients(); toast('Client deleted', 'info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
}

function clearClientForm() {
  editingClientId = null;
  document.getElementById('clientModalTitle').textContent = 'Add Client';
  ['cm-name','cm-mobile','cm-gstin','cm-email','cm-addr','cm-state','cm-scode'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cm-type').value = 'Regular';
}

// ============ PRODUCTS ============
function toggleProdForm(show) {
  const form = document.getElementById('prodInlineForm');
  if (show === false) { form.classList.remove('open'); return; }
  form.classList.toggle('open');
  if (form.classList.contains('open')) form.scrollIntoView({ behavior:'smooth', block:'start' });
}

function renderProducts() {
  const el = document.getElementById('productGrid');
  const search = (document.getElementById('prodSearch')?.value || '').toLowerCase();
  const gstF   = document.getElementById('prodGstFilter')?.value || '';
  let list = DB.products;
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search) || (p.hsn||'').includes(search));
  if (gstF !== '')  list = list.filter(p => String(parseFloat(p.gst)) === gstF || String(p.gst) === gstF);
  if (!list.length) { el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ico">📦</div><h3>No products found</h3><p>' + (search||gstF ? 'Try a different filter.' : 'Add products to use in invoices!') + '</p></div>'; return; }
  el.innerHTML = list.map(p => `
    <div class="prod-card">
      <div class="prod-icon">${p.icon||'📦'}</div>
      <div class="prod-info">
        <div class="prod-name">${p.name}</div>
        <div class="prod-meta">HSN: ${p.hsn||'-'} | ${p.unit} | GST: ${p.gst}% ${p.category?`| <span style="color:var(--accent);font-weight:600;">${p.category}</span>`:''}</div>
        <div class="prod-rate">₹${parseFloat(p.rate).toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
        <button class="btn btn-ghost btn-xs" onclick="editProduct('${p.id}')">✏️</button>
        <button class="btn btn-danger btn-xs" onclick="deleteProduct('${p.id}')">✕</button>
      </div>
    </div>`).join('');
}

function saveProduct() {
  const name = document.getElementById('pm-name').value.trim();
  if (!name) { toast('Product name required', 'error'); return; }
  const obj = {
    id: editingProductId || uid(), name,
    hsn: document.getElementById('pm-hsn').value.trim(),
    rate: parseFloat(document.getElementById('pm-rate').value) || 0,
    unit: document.getElementById('pm-unit').value,
    gst: parseFloat(document.getElementById('pm-gst').value) || 0,
    icon: document.getElementById('pm-icon').value || '📦',
    category: document.getElementById('pm-cat')?.value || 'Other'
  };
  if (editingProductId) {
    const idx = DB.products.findIndex(x => x.id === editingProductId);
    if (idx > -1) DB.products[idx] = obj;
    toast('Product updated!', 'success');
  } else {
    DB.products.push(obj);
    toast('Product added!', 'success');
  }
  saveDB(); renderProducts(); toggleProdForm(false); clearProductForm();
}

function editProduct(id) {
  editingProductId = id;
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('prodFormTitle').textContent = 'Edit Product';
  document.getElementById('pm-name').value = p.name;
  document.getElementById('pm-hsn').value = p.hsn || '';
  document.getElementById('pm-rate').value = p.rate;
  document.getElementById('pm-unit').value = p.unit;
  document.getElementById('pm-gst').value = p.gst;
  document.getElementById('pm-icon').value = p.icon || '';
  if (document.getElementById('pm-cat')) document.getElementById('pm-cat').value = p.category || 'Other';
  document.getElementById('prodInlineForm').classList.add('open');
  document.getElementById('prodInlineForm').scrollIntoView({ behavior:'smooth', block:'start' });
}

function deleteProduct(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this product?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.products = DB.products.filter(x => x.id !== id);
    saveDB(); renderProducts(); toast('Product deleted', 'info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
}

function clearProductForm() {
  editingProductId = null;
  document.getElementById('prodFormTitle').textContent = 'Add Product';
  ['pm-name','pm-hsn','pm-rate','pm-icon'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pm-gst').value = '18';
  document.getElementById('pm-unit').value = 'Bag';
}

// ============ GST COMPANIES ============
function toggleGcoForm(show) {
  const form = document.getElementById('gcoInlineForm');
  if (show === false) { form.classList.remove('open'); return; }
  form.classList.toggle('open');
  if (form.classList.contains('open')) form.scrollIntoView({ behavior:'smooth', block:'start' });
}

function renderCompanies() {
  const el = document.getElementById('companyGrid');
  const search = (document.getElementById('compSearch')?.value || '').toLowerCase();
  let list = DB.companies;
  if (search) list = list.filter(c => c.name.toLowerCase().includes(search) || (c.gstin||'').toLowerCase().includes(search) || (c.state||'').toLowerCase().includes(search));
  if (!list.length) { el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ico">🏢</div><h3>No companies found</h3><p>' + (search ? 'Try a different search.' : 'Add your company to generate invoices!') + '</p></div>'; return; }
  el.innerHTML = list.map(c => `
    <div class="gco-card">
      <div class="gco-icon">🏢</div>
      <div class="gco-info">
        <div class="gco-name">${c.name}</div>
        <div class="gco-gstin">${c.gstin}</div>
        <div class="gco-meta">${c.addr||c.state}</div>
        <span class="gco-state-badge">📍 ${c.state} · Code: ${c.scode}</span>
        ${c.bank?`<div style="font-size:11px;color:var(--text2);margin-top:5px;">🏦 ${c.bank} | ${c.acno||''}</div>`:''}
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
        <button class="btn btn-ghost btn-xs" onclick="editGstCompany('${c.id}')">✏️</button>
        <button class="btn btn-danger btn-xs" onclick="deleteGstCompany('${c.id}')">✕</button>
      </div>
    </div>`).join('');
}

function saveGstCompany() {
  const name = document.getElementById('gco-name').value.trim();
  const gstin = document.getElementById('gco-gstin').value.trim().toUpperCase();
  const state = document.getElementById('gco-state').value.trim();
  const scode = document.getElementById('gco-scode').value.trim();
  if (!name) { toast('Company name required', 'error'); return; }
  if (!gstin || gstin.length < 10) { toast('Valid GSTIN required', 'error'); return; }
  if (!state || !scode) { toast('State and State Code required', 'error'); return; }
  const obj = {
    id: editingGcoId || uid(),
    name, gstin, state, scode,
    addr: document.getElementById('gco-addr').value.trim() || state,
    phone: document.getElementById('gco-phone').value.trim(),
    email: document.getElementById('gco-email').value.trim(),
    bank: document.getElementById('gco-bank').value.trim(),
    acno: document.getElementById('gco-acno').value.trim(),
    ifsc: document.getElementById('gco-ifsc').value.trim(),
    branch: document.getElementById('gco-branch').value.trim(),
    holder: document.getElementById('gco-holder').value.trim()
  };
  if (editingGcoId) {
    const idx = DB.companies.findIndex(x => x.id === editingGcoId);
    if (idx > -1) DB.companies[idx] = obj;
    toast('Company updated!', 'success');
  } else {
    DB.companies.push(obj);
    toast('Company added!', 'success');
  }
  saveDB(); renderCompanies(); populateSellerSelect();
  toggleGcoForm(false); clearGcoForm();
}

function editGstCompany(id) {
  editingGcoId = id;
  const c = DB.companies.find(x => x.id === id);
  if (!c) return;
  document.getElementById('gcoFormTitle').textContent = 'Edit GST Company';
  document.getElementById('gco-name').value = c.name;
  document.getElementById('gco-gstin').value = c.gstin;
  document.getElementById('gco-state').value = c.state;
  document.getElementById('gco-scode').value = c.scode;
  document.getElementById('gco-addr').value = c.addr || '';
  document.getElementById('gco-phone').value = c.phone || '';
  document.getElementById('gco-email').value = c.email || '';
  document.getElementById('gco-bank').value = c.bank || '';
  document.getElementById('gco-acno').value = c.acno || '';
  document.getElementById('gco-ifsc').value = c.ifsc || '';
  document.getElementById('gco-branch').value = c.branch || '';
  document.getElementById('gco-holder').value = c.holder || '';
  document.getElementById('gcoInlineForm').classList.add('open');
  document.getElementById('gcoInlineForm').scrollIntoView({ behavior:'smooth', block:'start' });
}

function deleteGstCompany(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this GST Company?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.companies = DB.companies.filter(x => x.id !== id);
    saveDB(); renderCompanies(); populateSellerSelect();
    toast('Company deleted', 'info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
}

function clearGcoForm() {
  editingGcoId = null;
  document.getElementById('gcoFormTitle').textContent = 'Add GST Company';
  ['gco-name','gco-gstin','gco-state','gco-scode','gco-addr','gco-phone','gco-email','gco-bank','gco-acno','gco-ifsc','gco-branch','gco-holder'].forEach(id => document.getElementById(id).value = '');
}

// Close modal on outside click
document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => {
    if (e.target === o) {
      o.classList.remove('open');
      clearClientForm();
    }
  });
});

// ============ FLEET ============
let editingFleetId = null;
function openFleetForm() {
  editingFleetId = null;
  document.getElementById('fleetFormTitle').textContent = 'Add Vehicle';
  ['fl-no','fl-model','fl-year','fl-owner','fl-driver'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fl-type').value = 'Lorry';
  document.getElementById('fl-status').value = 'Active';
  ['fl-ins','fl-fc','fl-permit'].forEach(id => document.getElementById(id).value = '');
  const f = document.getElementById('fleetInlineForm');
  f.classList.add('open'); f.scrollIntoView({ behavior:'smooth', block:'start' });
}
function closeFleetForm() { document.getElementById('fleetInlineForm').classList.remove('open'); }
function saveFleet() {
  const no = document.getElementById('fl-no').value.trim().toUpperCase();
  if (!no) { toast('Vehicle number required', 'error'); return; }
  const obj = {
    id: editingFleetId || uid(), no,
    type: document.getElementById('fl-type').value,
    model: document.getElementById('fl-model').value.trim(),
    year: document.getElementById('fl-year').value.trim(),
    owner: document.getElementById('fl-owner').value.trim(),
    driver: document.getElementById('fl-driver').value.trim(),
    status: document.getElementById('fl-status').value,
    ins: document.getElementById('fl-ins').value,
    fc: document.getElementById('fl-fc').value,
    permit: document.getElementById('fl-permit').value
  };
  if (editingFleetId) { const i = DB.fleet.findIndex(x => x.id === editingFleetId); if (i > -1) DB.fleet[i] = obj; toast('Vehicle updated!','success'); }
  else { DB.fleet.push(obj); toast('Vehicle added!','success'); }
  saveDB(); renderFleet(); closeFleetForm();
}
function editFleet(id) {
  editingFleetId = id;
  const v = DB.fleet.find(x => x.id === id); if (!v) return;
  document.getElementById('fleetFormTitle').textContent = 'Edit Vehicle';
  document.getElementById('fl-no').value = v.no;
  document.getElementById('fl-type').value = v.type;
  document.getElementById('fl-model').value = v.model || '';
  document.getElementById('fl-year').value = v.year || '';
  document.getElementById('fl-owner').value = v.owner || '';
  document.getElementById('fl-driver').value = v.driver || '';
  document.getElementById('fl-status').value = v.status;
  document.getElementById('fl-ins').value = v.ins || '';
  document.getElementById('fl-fc').value = v.fc || '';
  document.getElementById('fl-permit').value = v.permit || '';
  const f = document.getElementById('fleetInlineForm');
  f.classList.add('open'); f.scrollIntoView({ behavior:'smooth', block:'start' });
}
function deleteFleet(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this vehicle?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.fleet = DB.fleet.filter(x => x.id !== id);
    saveDB(); renderFleet(); toast('Vehicle deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
}
function renderFleet() {
  const el = document.getElementById('fleetGrid');
  const search  = (document.getElementById('fleetSearch')?.value || '').toLowerCase();
  const statusF = document.getElementById('fleetStatusFilter')?.value || '';
  let list = DB.fleet;
  if (search)  list = list.filter(v => v.no.toLowerCase().includes(search) || (v.driver||'').toLowerCase().includes(search) || (v.model||'').toLowerCase().includes(search));
  if (statusF) list = list.filter(v => v.status === statusF);
  if (!list.length) { el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ico">🚛</div><h3>No vehicles found</h3><p>' + (search||statusF ? 'Try a different filter.' : 'Add your first vehicle to get started!') + '</p></div>'; return; }
  const typeIcons = {Lorry:'🚛','Mini Truck':'🚚',Tipper:'🪣',Trailer:'🚜',JCB:'🏗️',Car:'🚗',Van:'🚐',Auto:'🛺',Other:'🔧'};
  const statusColors = {Active:'b-green','Under Maintenance':'b-amber',Idle:'b-blue','Out of Service':'b-red'};
  el.innerHTML = list.map(v => `
    <div class="fleet-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:22px;">${typeIcons[v.type]||'🚛'}</span>
          <div>
            <div class="fleet-no">${v.no}</div>
            <div class="fleet-model">${v.type}${v.model?' · '+v.model:''}</div>
          </div>
        </div>
        <span class="badge ${statusColors[v.status]||'b-gray'}">${v.status}</span>
      </div>
      <div class="fleet-meta">
        ${v.owner ? `👤 <strong>Owner:</strong> ${v.owner}<br>` : ''}
        ${v.driver ? `🧑‍✈️ <strong>Driver:</strong> ${v.driver}<br>` : ''}
        ${v.ins ? `📋 Insurance: ${v.ins}<br>` : ''}
        ${v.fc ? `📄 FC: ${v.fc}<br>` : ''}
        ${v.permit ? `🪪 Permit: ${v.permit}` : ''}
      </div>
      <div style="display:flex;gap:6px;margin-top:10px;">
        <button class="btn btn-ghost btn-xs" onclick="editFleet('${v.id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-xs" onclick="deleteFleet('${v.id}')">✕ Delete</button>
      </div>
    </div>`).join('');
}

// ============ DRIVERS ============
let editingDriverId = null;
function openDriverForm() {
  editingDriverId = null;
  document.getElementById('driverFormTitle').textContent = 'Add Driver';
  ['drv-name','drv-mobile','drv-lic','drv-licexp','drv-aadhar','drv-vehicle','drv-addr','drv-emg'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('drv-status').value = 'Active';
  const f = document.getElementById('driverInlineForm');
  f.classList.add('open'); f.scrollIntoView({ behavior:'smooth', block:'start' });
}
function closeDriverForm() { document.getElementById('driverInlineForm').classList.remove('open'); }
function saveDriver() {
  const name = document.getElementById('drv-name').value.trim();
  const mobile = document.getElementById('drv-mobile').value.trim();
  if (!name) { toast('Driver name required', 'error'); return; }
  const obj = {
    id: editingDriverId || uid(), name, mobile,
    lic: document.getElementById('drv-lic').value.trim().toUpperCase(),
    licexp: document.getElementById('drv-licexp').value,
    aadhar: document.getElementById('drv-aadhar').value.trim(),
    vehicle: document.getElementById('drv-vehicle').value.trim().toUpperCase(),
    status: document.getElementById('drv-status').value,
    addr: document.getElementById('drv-addr').value.trim(),
    emg: document.getElementById('drv-emg').value.trim()
  };
  if (editingDriverId) { const i = DB.drivers.findIndex(x => x.id === editingDriverId); if (i > -1) DB.drivers[i] = obj; toast('Driver updated!','success'); }
  else { DB.drivers.push(obj); toast('Driver added!','success'); }
  saveDB(); renderDrivers(); closeDriverForm();
}
function editDriver(id) {
  editingDriverId = id;
  const d = DB.drivers.find(x => x.id === id); if (!d) return;
  document.getElementById('driverFormTitle').textContent = 'Edit Driver';
  document.getElementById('drv-name').value = d.name;
  document.getElementById('drv-mobile').value = d.mobile || '';
  document.getElementById('drv-lic').value = d.lic || '';
  document.getElementById('drv-licexp').value = d.licexp || '';
  document.getElementById('drv-aadhar').value = d.aadhar || '';
  document.getElementById('drv-vehicle').value = d.vehicle || '';
  document.getElementById('drv-status').value = d.status;
  document.getElementById('drv-addr').value = d.addr || '';
  document.getElementById('drv-emg').value = d.emg || '';
  const f = document.getElementById('driverInlineForm');
  f.classList.add('open'); f.scrollIntoView({ behavior:'smooth', block:'start' });
}
function deleteDriver(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this driver?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.drivers = DB.drivers.filter(x => x.id !== id);
    saveDB(); renderDrivers(); toast('Driver deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
}
function renderDrivers() {
  const el = document.getElementById('driversGrid');
  const search  = (document.getElementById('driverSearch')?.value || '').toLowerCase();
  const statusF = document.getElementById('driverStatusFilter')?.value || '';
  let list = DB.drivers;
  if (search)  list = list.filter(d => d.name.toLowerCase().includes(search) || (d.vehicle||'').toLowerCase().includes(search) || (d.mobile||'').includes(search));
  if (statusF) list = list.filter(d => d.status === statusF);
  if (!list.length) { el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ico">👤</div><h3>No drivers found</h3><p>' + (search||statusF ? 'Try a different filter.' : 'Add your first driver to manage them!') + '</p></div>'; return; }
  const statusColors = {Active:'b-green','On Leave':'b-amber',Inactive:'b-red'};
  el.innerHTML = list.map(d => `
    <div class="driver-card">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div class="driver-avatar">👤</div>
        <div style="flex:1">
          <div class="driver-name">${d.name}</div>
          <div class="driver-lic">${d.lic || '—'}</div>
        </div>
        <span class="badge ${statusColors[d.status]||'b-gray'}">${d.status}</span>
      </div>
      <div class="fleet-meta">
        ${d.mobile ? `📞 ${d.mobile}<br>` : ''}
        ${d.vehicle ? `🚛 Vehicle: <strong>${d.vehicle}</strong><br>` : ''}
        ${d.licexp ? `📅 License Exp: ${d.licexp}<br>` : ''}
        ${d.aadhar ? `🪪 Aadhar: ${d.aadhar}` : ''}
      </div>
      <div style="display:flex;gap:6px;margin-top:10px;">
        <button class="btn btn-ghost btn-xs" onclick="editDriver('${d.id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-xs" onclick="deleteDriver('${d.id}')">✕ Delete</button>
      </div>
    </div>`).join('');
}

// ============ RENEWALS ============
let editingRenewalId = null;
function openRenewalForm() {
  editingRenewalId = null;
  document.getElementById('renewalFormTitle').textContent = 'Add Renewal';
  ['ren-vehicle','ren-expiry','ren-cost','ren-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('ren-type').value = 'Insurance';
  document.getElementById('ren-remind').value = '15';
  const f = document.getElementById('renewalInlineForm');
  f.classList.add('open'); f.scrollIntoView({ behavior:'smooth', block:'start' });
}
function closeRenewalForm() { document.getElementById('renewalInlineForm').classList.remove('open'); }
function saveRenewal() {
  const vehicle = document.getElementById('ren-vehicle').value.trim();
  const expiry = document.getElementById('ren-expiry').value;
  if (!vehicle || !expiry) { toast('Vehicle & expiry date required', 'error'); return; }
  const obj = {
    id: editingRenewalId || uid(), vehicle,
    type: document.getElementById('ren-type').value,
    expiry, remind: document.getElementById('ren-remind').value,
    cost: document.getElementById('ren-cost').value,
    notes: document.getElementById('ren-notes').value.trim()
  };
  if (editingRenewalId) { const i = DB.renewals.findIndex(x => x.id === editingRenewalId); if (i > -1) DB.renewals[i] = obj; toast('Renewal updated!','success'); }
  else { DB.renewals.push(obj); toast('Renewal added!','success'); }
  saveDB(); renderRenewals(); closeRenewalForm();
}
function deleteRenewal(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this renewal entry?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.renewals = DB.renewals.filter(x => x.id !== id);
    saveDB(); renderRenewals(); toast('Deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
}
function getDaysLeft(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const exp = new Date(dateStr);
  return Math.round((exp - today) / (1000*60*60*24));
}
function renderRenewals() {
  const el = document.getElementById('renewalsList');
  const search = (document.getElementById('renewalSearch')?.value || '').toLowerCase();
  const typeF  = document.getElementById('renewalTypeFilter')?.value || '';
  let list = DB.renewals;
  if (search) list = list.filter(r => r.vehicle.toLowerCase().includes(search) || (r.notes||'').toLowerCase().includes(search));
  if (typeF)  list = list.filter(r => r.type === typeF);
  if (!list.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">📅</div><h3>No renewals found</h3><p>' + (search||typeF ? 'Try a different filter.' : 'Track your document expiry dates here!') + '</p></div>'; return; }
  const sorted = [...list].sort((a,b) => new Date(a.expiry) - new Date(b.expiry));
  const typeIcons = {Insurance:'📋','FC (Fitness Certificate)':'🔧',Permit:'🪪','Road Tax':'🏛️',PUC:'💨','Driver License':'🆔',Other:'📄'};
  el.innerHTML = sorted.map(r => {
    const days = getDaysLeft(r.expiry);
    let dayClass = 'days-ok', dayText = `${days}d left`;
    if (days === null) { dayClass = 'days-expired'; dayText = 'No date'; }
    else if (days < 0) { dayClass = 'days-expired'; dayText = `Expired ${Math.abs(days)}d ago`; }
    else if (days <= 7) { dayClass = 'days-danger'; dayText = `${days}d left ⚠️`; }
    else if (days <= 30) { dayClass = 'days-warn'; dayText = `${days}d left`; }
    return `<div class="renewal-row">
      <div class="renewal-icon" style="background:var(--card2);">${typeIcons[r.type]||'📄'}</div>
      <div class="renewal-info">
        <div class="renewal-title">${r.vehicle} — ${r.type}</div>
        <div class="renewal-sub">Expiry: ${r.expiry}${r.cost ? ' · ₹'+Number(r.cost).toLocaleString('en-IN') : ''}${r.notes ? ' · '+r.notes : ''}</div>
      </div>
      <span class="renewal-days ${dayClass}">${dayText}</span>
      <button class="btn btn-danger btn-xs" onclick="deleteRenewal('${r.id}')">✕</button>
    </div>`;
  }).join('');
}

// ============ FUEL TRACKER ============
function openFuelForm() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fuel-date').value = today;
  ['fuel-vehicle','fuel-driver','fuel-litres','fuel-rate','fuel-total','fuel-odo'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fuel-type').value = 'Diesel';
  const f = document.getElementById('fuelInlineForm');
  f.classList.add('open'); f.scrollIntoView({ behavior:'smooth', block:'start' });
}
function closeFuelForm() { document.getElementById('fuelInlineForm').classList.remove('open'); }
function calcFuelTotal() {
  const l = parseFloat(document.getElementById('fuel-litres').value) || 0;
  const r = parseFloat(document.getElementById('fuel-rate').value) || 0;
  document.getElementById('fuel-total').value = (l * r).toFixed(2);
}
document.addEventListener('input', e => { if (e.target.id === 'fuel-litres') calcFuelTotal(); });
function saveFuel() {
  const vehicle = document.getElementById('fuel-vehicle').value.trim().toUpperCase();
  const litres = parseFloat(document.getElementById('fuel-litres').value);
  if (!vehicle || !litres) { toast('Vehicle & litres required', 'error'); return; }
  const rate = parseFloat(document.getElementById('fuel-rate').value) || 0;
  const obj = {
    id: uid(),
    date: document.getElementById('fuel-date').value,
    vehicle, driver: document.getElementById('fuel-driver').value.trim(),
    type: document.getElementById('fuel-type').value,
    litres, rate, total: litres * rate,
    odo: document.getElementById('fuel-odo').value
  };
  DB.fuel.push(obj); saveDB(); renderFuel(); renderFuelStats(); closeFuelForm(); toast('Fuel entry added!','success');
}
function deleteFuel(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this fuel entry?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.fuel = DB.fuel.filter(x => x.id !== id);
    saveDB(); renderFuel(); renderFuelStats(); toast('Deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
}
function renderFuelStats() {
  const totalL = DB.fuel.reduce((s,f) => s+f.litres, 0);
  const totalAmt = DB.fuel.reduce((s,f) => s+f.total, 0);
  const avgRate = totalL > 0 ? totalAmt / totalL : 0;
  document.getElementById('fuel-s-entries').textContent = DB.fuel.length;
  document.getElementById('fuel-s-litres').textContent = totalL.toFixed(1) + ' L';
  document.getElementById('fuel-s-spend').textContent = '₹' + Math.round(totalAmt).toLocaleString('en-IN');
  document.getElementById('fuel-s-avg').textContent = '₹' + avgRate.toFixed(2);
}
function renderFuel() {
  const el = document.getElementById('fuelList');
  const search   = (document.getElementById('fuelSearch')?.value || '').toLowerCase();
  const vehicleF = document.getElementById('fuelVehicleFilter')?.value || '';
  // Populate vehicle dropdown
  const vsel = document.getElementById('fuelVehicleFilter');
  if (vsel) {
    const current = vsel.value;
    const vehicles = [...new Set(DB.fuel.map(f => f.vehicle))].sort();
    vsel.innerHTML = '<option value="">All Vehicles</option>' + vehicles.map(v => `<option value="${v}" ${v===current?'selected':''}>${v}</option>`).join('');
  }
  let list = DB.fuel;
  if (search)   list = list.filter(f => f.vehicle.toLowerCase().includes(search) || (f.driver||'').toLowerCase().includes(search));
  if (vehicleF) list = list.filter(f => f.vehicle === vehicleF);
  if (!list.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">⛽</div><h3>No fuel entries found</h3><p>' + (search||vehicleF ? 'Try a different filter.' : 'Start tracking fuel consumption!') + '</p></div>'; return; }
  const sorted = [...list].sort((a,b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = `<div class="tbl-wrap"><table>
    <thead><tr><th>Date</th><th>Vehicle</th><th>Driver</th><th>Type</th><th class="td-r">Litres</th><th class="td-r">Rate/L</th><th class="td-r">Amount</th><th>Odometer</th><th></th></tr></thead>
    <tbody>${sorted.map(f => `<tr>
      <td>${f.date}</td><td><strong style="color:var(--accent)">${f.vehicle}</strong></td><td>${f.driver||'—'}</td>
      <td><span class="badge b-blue">${f.type}</span></td>
      <td class="td-r">${f.litres} L</td>
      <td class="td-r">₹${f.rate.toFixed(2)}</td>
      <td class="td-r" style="font-weight:700;color:var(--accent)">₹${f.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
      <td>${f.odo ? f.odo+' km' : '—'}</td>
      <td><button class="btn btn-danger btn-xs" onclick="deleteFuel('${f.id}')">✕</button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

// ============ EXPENSE TRACKER ============
function openExpenseForm() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('exp-date').value = today;
  ['exp-amount','exp-ref','exp-desc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('exp-cat').value = 'Maintenance';
  document.getElementById('exp-pay').value = 'Cash';
  const f = document.getElementById('expenseInlineForm');
  f.classList.add('open'); f.scrollIntoView({ behavior:'smooth', block:'start' });
}
function closeExpenseForm() { document.getElementById('expenseInlineForm').classList.remove('open'); }
function saveExpense() {
  const amount = parseFloat(document.getElementById('exp-amount').value);
  if (!amount || amount <= 0) { toast('Valid amount required', 'error'); return; }
  const obj = {
    id: uid(),
    date: document.getElementById('exp-date').value,
    cat: document.getElementById('exp-cat').value,
    amount, ref: document.getElementById('exp-ref').value.trim(),
    desc: document.getElementById('exp-desc').value.trim(),
    pay: document.getElementById('exp-pay').value
  };
  DB.expenses.push(obj); saveDB(); renderExpenses(); renderExpenseStats(); closeExpenseForm(); toast('Expense added!','success');
}
function deleteExpense(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this expense?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.expenses = DB.expenses.filter(x => x.id !== id);
    saveDB(); renderExpenses(); renderExpenseStats(); toast('Deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
}
function renderExpenseStats() {
  const total = DB.expenses.reduce((s,e) => s+e.amount, 0);
  const now = new Date(); const m = now.getMonth(), y = now.getFullYear();
  const monthAmt = DB.expenses.filter(e => { const d = new Date(e.date); return d.getMonth()===m&&d.getFullYear()===y; }).reduce((s,e)=>s+e.amount,0);
  const maint = DB.expenses.filter(e => e.cat==='Maintenance'||e.cat==='Vehicle Repair').reduce((s,e)=>s+e.amount,0);
  const salary = DB.expenses.filter(e => e.cat==='Salary').reduce((s,e)=>s+e.amount,0);
  document.getElementById('exp-s-total').textContent = '₹' + total.toLocaleString('en-IN');
  document.getElementById('exp-s-month').textContent = '₹' + monthAmt.toLocaleString('en-IN');
  document.getElementById('exp-s-maint').textContent = '₹' + maint.toLocaleString('en-IN');
  document.getElementById('exp-s-salary').textContent = '₹' + salary.toLocaleString('en-IN');
}
function renderExpenses() {
  const el = document.getElementById('expenseList');
  const search = (document.getElementById('expSearch')?.value || '').toLowerCase();
  const catF   = document.getElementById('expCatFilter')?.value || '';
  let list = DB.expenses;
  if (search) list = list.filter(e => (e.desc||'').toLowerCase().includes(search) || (e.ref||'').toLowerCase().includes(search));
  if (catF)   list = list.filter(e => e.cat === catF);
  if (!list.length) { el.innerHTML = '<div class="empty"><div class="empty-ico">💸</div><h3>No expenses found</h3><p>' + (search||catF ? 'Try a different filter.' : 'Start tracking your business expenses!') + '</p></div>'; return; }
  const sorted = [...list].sort((a,b) => new Date(b.date) - new Date(a.date));
  const catColors = {Maintenance:'b-amber',Fuel:'b-blue',Toll:'b-purple',Salary:'b-green','Vehicle Repair':'b-red',Tyre:'b-amber',Insurance:'b-blue',Tax:'b-purple',Office:'b-gray',Other:'b-gray'};
  el.innerHTML = `<div class="tbl-wrap"><table>
    <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Reference</th><th>Payment</th><th class="td-r">Amount</th><th></th></tr></thead>
    <tbody>${sorted.map(e => `<tr>
      <td>${e.date}</td>
      <td><span class="badge ${catColors[e.cat]||'b-gray'}">${e.cat}</span></td>
      <td>${e.desc||'—'}</td><td>${e.ref||'—'}</td>
      <td><span class="badge b-gray">${e.pay}</span></td>
      <td class="td-r" style="font-weight:700;color:var(--red)">₹${e.amount.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
      <td><button class="btn btn-danger btn-xs" onclick="deleteExpense('${e.id}')">✕</button></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

// ============ REPORTS ============
function getReportDates(period) {
  const now = new Date(); const y = now.getFullYear(); const m = now.getMonth();
  if (period === 'week') { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); return { start: s, end: now }; }
  if (period === 'month') return { start: new Date(y, m, 1), end: now };
  if (period === 'quarter') { const qs = Math.floor(m/3)*3; return { start: new Date(y, qs, 1), end: now }; }
  if (period === 'year') return { start: new Date(y, 0, 1), end: now };
  return { start: new Date(0), end: now };
}
function renderReports() {
  const period = document.getElementById('rep-period').value;
  const { start, end } = getReportDates(period);
  const invs = DB.invoices.filter(inv => { const d = new Date(inv.date); return d >= start && d <= end; });
  const revenue = invs.reduce((s,i) => s + (i.grand||0), 0);
  const pending = invs.filter(i => i.status === 'Unpaid' || i.status === 'Partial').reduce((s,i) => s + (i.balance||0), 0);
  const exps = DB.expenses.filter(e => { const d = new Date(e.date); return d >= start && d <= end; });
  const totalExp = exps.reduce((s,e) => s+e.amount, 0);
  document.getElementById('rep-invoices').textContent = invs.length;
  document.getElementById('rep-revenue').textContent = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('rep-pending').textContent = '₹' + pending.toLocaleString('en-IN');
  document.getElementById('rep-expense').textContent = '₹' + totalExp.toLocaleString('en-IN');
  // Top customers
  const custMap = {};
  invs.forEach(inv => {
    const k = inv.custname || 'Unknown';
    if (!custMap[k]) custMap[k] = 0;
    custMap[k] += inv.grand || 0;
  });
  const topCust = Object.entries(custMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const tcEl = document.getElementById('rep-top-customers');
  if (!topCust.length) { tcEl.innerHTML = '<div class="empty" style="padding:20px"><p>No data for selected period</p></div>'; }
  else { tcEl.innerHTML = topCust.map((c,i) => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;"><span><strong>${i+1}.</strong> ${c[0]}</span><span style="font-weight:700;color:var(--accent)">₹${c[1].toLocaleString('en-IN')}</span></div>`).join(''); }
  // Expense by category
  const catMap = {};
  exps.forEach(e => { if (!catMap[e.cat]) catMap[e.cat] = 0; catMap[e.cat] += e.amount; });
  const catEl = document.getElementById('rep-expense-cat');
  if (!Object.keys(catMap).length) { catEl.innerHTML = '<div class="empty" style="padding:20px"><p>No expenses for selected period</p></div>'; }
  else { catEl.innerHTML = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(c => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;"><span>${c[0]}</span><span style="font-weight:700;color:var(--red)">₹${c[1].toLocaleString('en-IN')}</span></div>`).join(''); }
  // Invoice summary
  const paid = invs.filter(i=>i.status==='Paid').length;
  const unpaid = invs.filter(i=>i.status==='Unpaid').length;
  const partial = invs.filter(i=>i.status==='Partial').length;
  const draft = invs.filter(i=>i.status==='Draft').length;
  document.getElementById('rep-inv-summary').innerHTML = `
    <div class="g4" style="padding:8px 0;">
      <div style="text-align:center;padding:14px;background:var(--green-dim);border-radius:var(--r-sm);"><div style="font-size:22px;font-weight:800;color:var(--green)">${paid}</div><div style="font-size:11px;color:var(--green);font-weight:600;">PAID</div></div>
      <div style="text-align:center;padding:14px;background:var(--red-dim);border-radius:var(--r-sm);"><div style="font-size:22px;font-weight:800;color:var(--red)">${unpaid}</div><div style="font-size:11px;color:var(--red);font-weight:600;">UNPAID</div></div>
      <div style="text-align:center;padding:14px;background:var(--accent-dim);border-radius:var(--r-sm);"><div style="font-size:22px;font-weight:800;color:var(--accent)">${partial}</div><div style="font-size:11px;color:var(--accent);font-weight:600;">PARTIAL</div></div>
      <div style="text-align:center;padding:14px;background:var(--blue-dim);border-radius:var(--r-sm);"><div style="font-size:22px;font-weight:800;color:var(--blue)">${draft}</div><div style="font-size:11px;color:var(--blue);font-weight:600;">DRAFT</div></div>
    </div>`;
}

// ============ CUSTOMERS PAGE ============
function renderCustomers() {
  const search = (document.getElementById('custSearch').value || '').toLowerCase();
  const typeFilter = document.getElementById('custTypeFilter').value;
  let clients = DB.clients;
  if (search) clients = clients.filter(c => c.name.toLowerCase().includes(search) || (c.mobile||'').includes(search) || (c.gstin||'').toLowerCase().includes(search));
  if (typeFilter) clients = clients.filter(c => c.type === typeFilter);
  // Stats
  document.getElementById('cust-s-total').textContent = DB.clients.length;
  document.getElementById('cust-s-vip').textContent = DB.clients.filter(c=>c.type==='VIP').length;
  document.getElementById('cust-s-corp').textContent = DB.clients.filter(c=>c.type==='Corporate').length;
  const totalRev = DB.invoices.reduce((s,i)=>s+(i.grand||0),0);
  document.getElementById('cust-s-revenue').textContent = '₹' + totalRev.toLocaleString('en-IN');
  const el = document.getElementById('customersGrid');
  if (!clients.length) { el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-ico">🧑‍💼</div><h3>No customers found</h3><p>Add customers from the Clients section or New Invoice!</p></div>'; return; }
  const typeColors = {Regular:'b-gray',VIP:'b-amber',Corporate:'b-blue','One-time':'b-purple'};
  el.innerHTML = clients.map(c => {
    const custInvs = DB.invoices.filter(i => i.custmobile === c.mobile || i.custname === c.name);
    const totalSpend = custInvs.reduce((s,i)=>s+(i.grand||0),0);
    return `<div class="client-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div class="client-name">${c.name}</div>
        <span class="badge ${typeColors[c.type]||'b-gray'}">${c.type||'Regular'}</span>
      </div>
      ${c.gstin?`<div class="client-gstin">GSTIN: ${c.gstin}</div>`:''}
      <div class="client-info">
        📞 ${c.mobile||'—'}<br>
        ${c.addr?`📍 ${c.addr.substring(0,60)}${c.addr.length>60?'…':''}<br>`:''}
        🧾 ${custInvs.length} Invoice${custInvs.length!==1?'s':''} · <strong style="color:var(--accent)">₹${totalSpend.toLocaleString('en-IN')}</strong>
      </div>
      <div style="display:flex;gap:6px;margin-top:10px;">
        <button class="btn btn-blue btn-xs" onclick="viewClientHistory('${c.id}')">📋 History</button>
        <button class="btn btn-ghost btn-xs" onclick="editClient('${c.id}')">✏️ Edit</button>
      </div>
    </div>`;
  }).join('');
}

// ============ SAMPLE DATA INJECTION ============
function injectSampleData() {
  // Only inject if no data exists at all
  if (DB.companies.length > 0 || DB.drivers.length > 0 || DB.fleet.length > 0) {
    // Still seed products if missing category field (upgrade existing data)
    if (DB.products.length > 0 && !DB.products[0].category) {
      DB.products = []; // force re-seed with categories
    } else {
      return;
    }
  }

  const today = new Date();
  const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0]; };

  // ── GST Companies (2) ─────────────────────────────────────────────
  const cid1 = uid(), cid2 = uid();
  DB.companies = [
    {
      id: cid1, name: 'Sammy Kura Transport Co.', gstin: '33ABCSK1234F1Z5',
      state: 'Tamil Nadu', scode: '33',
      addr: '14, Industrial Estate, Guindy, Chennai - 600032',
      phone: '9876543200', email: 'info@sammykura.in',
      bank: 'City Union Bank', acno: '510909010296124',
      ifsc: 'CIUB0000190', branch: 'Guindy Branch', holder: 'Sammy Kura Transport Co.'
    },
    {
      id: cid2, name: 'SK Blue Metals Pvt Ltd', gstin: '33XYZSK5678G1Z9',
      state: 'Tamil Nadu', scode: '33',
      addr: '88, SIDCO Industrial Area, Coimbatore - 641021',
      phone: '9876500001', email: 'accounts@skblue.co.in',
      bank: 'Indian Bank', acno: '600102034567890',
      ifsc: 'IDIB000C055', branch: 'Coimbatore Main', holder: 'SK Blue Metals Pvt Ltd'
    }
  ];

  // ── Clients (5) ───────────────────────────────────────────────────
  const cl1=uid(),cl2=uid(),cl3=uid(),cl4=uid(),cl5=uid();
  DB.clients = [
    { id: cl1, name: 'AK Constructions Pvt Ltd', mobile: '9444555666', gstin: '33AAKCA1234B1ZX', email: 'ak@akconstruct.com', addr: '15, Industrial Estate, Chennai - 600010', state: 'Tamil Nadu', scode: '33', type: 'Corporate' },
    { id: cl2, name: 'Sri Murugan Traders',       mobile: '9333444555', gstin: '33ASRMT9876C1Z2', email: '', addr: '7, Market Street, Coimbatore - 641001', state: 'Tamil Nadu', scode: '33', type: 'Regular' },
    { id: cl3, name: 'Vel Infra Projects',         mobile: '9222333444', gstin: '33BVLIP5432D1Z8', email: 'vel@velinfra.in', addr: '22, SIDCO Colony, Madurai - 625003', state: 'Tamil Nadu', scode: '33', type: 'VIP' },
    { id: cl4, name: 'Balaji Steel Suppliers',     mobile: '9111222333', gstin: '',                email: '', addr: '5, Mettur Road, Salem - 636001', state: 'Tamil Nadu', scode: '33', type: 'Regular' },
    { id: cl5, name: 'Kavitha Road Lines',         mobile: '9000111222', gstin: '33CKRLA7654E1Z5', email: 'kavitha@krl.co.in', addr: '88, Trichy Road, Karur - 639001', state: 'Tamil Nadu', scode: '33', type: 'Corporate' }
  ];

  // ── Products (25) — from SQL import ──────────────────────────────
  DB.products = [
    // Transport & Charges
    { id: 'prd001', name: 'Transport Charge (Per Trip)',    hsn: '9965', rate: 8500,  unit: 'Trip',     gst: 5,  icon: '🚛', category: 'Transport' },
    { id: 'prd002', name: 'Freight Charge (Per Tonne)',     hsn: '9965', rate: 1200,  unit: 'Tonne',    gst: 5,  icon: '⚖️', category: 'Transport' },
    { id: 'prd003', name: 'Loading / Unloading Charge',     hsn: '9985', rate: 650,   unit: 'Trip',     gst: 18, icon: '📦', category: 'Transport' },
    { id: 'prd004', name: 'Detention Charge (Per Day)',     hsn: '9965', rate: 2000,  unit: 'Day',      gst: 18, icon: '📅', category: 'Transport' },
    { id: 'prd005', name: 'Toll & Other Expenses',          hsn: '9965', rate: 500,   unit: 'Trip',     gst: 0,  icon: '🪙', category: 'Transport' },
    // Cement
    { id: 'prd006', name: 'Cement (OPC 53 Grade)',          hsn: '2523', rate: 420,   unit: 'Bag',      gst: 28, icon: '🏗️', category: 'Cement' },
    { id: 'prd007', name: 'Cement (PPC Grade)',             hsn: '2523', rate: 400,   unit: 'Bag',      gst: 28, icon: '🏗️', category: 'Cement' },
    // Sand
    { id: 'prd008', name: 'River Sand (Nattu Manal)',       hsn: '2505', rate: 4500,  unit: 'Tonne',    gst: 5,  icon: '🏖️', category: 'Sand' },
    { id: 'prd009', name: 'M-Sand (Manufactured Sand)',     hsn: '2505', rate: 2800,  unit: 'Tonne',    gst: 5,  icon: '🏖️', category: 'Sand' },
    { id: 'prd010', name: 'P-Sand (Plastering Sand)',       hsn: '2505', rate: 3200,  unit: 'Tonne',    gst: 5,  icon: '🏖️', category: 'Sand' },
    // Bricks
    { id: 'prd011', name: 'Sengal (Country Brick)',         hsn: '6901', rate: 7500,  unit: '1000 Nos', gst: 5,  icon: '🧱', category: 'Bricks' },
    { id: 'prd012', name: 'Wire Cut Brick',                 hsn: '6901', rate: 9000,  unit: '1000 Nos', gst: 5,  icon: '🧱', category: 'Bricks' },
    { id: 'prd013', name: 'Solid Block (4 Inch)',           hsn: '6810', rate: 28,    unit: 'Nos',      gst: 12, icon: '🧱', category: 'Bricks' },
    { id: 'prd014', name: 'Solid Block (6 Inch)',           hsn: '6810', rate: 38,    unit: 'Nos',      gst: 12, icon: '🧱', category: 'Bricks' },
    { id: 'prd015', name: 'Hollow Block (4 Inch)',          hsn: '6810', rate: 22,    unit: 'Nos',      gst: 12, icon: '🧱', category: 'Bricks' },
    { id: 'prd016', name: 'Hollow Block (6 Inch)',          hsn: '6810', rate: 32,    unit: 'Nos',      gst: 12, icon: '🧱', category: 'Bricks' },
    // Jelly / Metals
    { id: 'prd017', name: 'Blue Metal (6mm Jelly)',         hsn: '2517', rate: 1800,  unit: 'CFT',      gst: 5,  icon: '⛏️', category: 'Jelly' },
    { id: 'prd018', name: 'Blue Metal (12mm Jelly)',        hsn: '2517', rate: 1600,  unit: 'CFT',      gst: 5,  icon: '⛏️', category: 'Jelly' },
    { id: 'prd019', name: 'Blue Metal (20mm Jelly)',        hsn: '2517', rate: 1400,  unit: 'CFT',      gst: 5,  icon: '⛏️', category: 'Jelly' },
    { id: 'prd020', name: 'Granite Dust (Crusher Dust)',    hsn: '2517', rate: 900,   unit: 'CFT',      gst: 5,  icon: '⛏️', category: 'Jelly' },
    { id: 'prd021', name: 'Granite (Rubble Stone)',         hsn: '2516', rate: 3500,  unit: 'Tonne',    gst: 5,  icon: '🪨', category: 'Jelly' },
    { id: 'prd022', name: 'WBM Stone (Road Metal)',         hsn: '2517', rate: 1200,  unit: 'CFT',      gst: 5,  icon: '🪨', category: 'Jelly' }
  ];

  // ── Fleet (5) ─────────────────────────────────────────────────────
  DB.fleet = [
    { id: uid(), no: 'TN 39 AB 1234', type: 'Lorry',      model: 'Tata 407',             year: '2021', owner: 'Sammy Kura', driver: 'Rajan Kumar',    status: 'Active',            ins: '2026-11-30', fc: '2027-03-15', permit: '2027-01-20' },
    { id: uid(), no: 'TN 63 CD 5678', type: 'Tipper',     model: 'Ashok Leyland 2518',   year: '2020', owner: 'Sammy Kura', driver: 'Murugan S',      status: 'Active',            ins: '2026-08-25', fc: '2026-06-10', permit: '2026-08-05' },
    { id: uid(), no: 'TN 72 EF 9012', type: 'Mini Truck', model: 'Mahindra Bolero Pikup', year: '2022', owner: 'Sammy Kura', driver: 'Selvam P',       status: 'Under Maintenance', ins: '2027-02-14', fc: '2027-07-18', permit: '2027-04-30' },
    { id: uid(), no: 'TN 58 GH 3456', type: 'Trailer',    model: 'BharatBenz 4028',      year: '2019', owner: 'Sammy Kura', driver: 'Balamurugan T',  status: 'Active',            ins: '2026-07-10', fc: '2026-09-22', permit: '2026-10-01' },
    { id: uid(), no: 'TN 47 IJ 7890', type: 'Lorry',      model: 'Eicher Pro 2059',      year: '2023', owner: 'Sammy Kura', driver: 'Karthik V',      status: 'Idle',              ins: '2027-05-18', fc: '2028-01-09', permit: '2027-11-25' }
  ];

  // ── Drivers (5) ───────────────────────────────────────────────────
  DB.drivers = [
    { id: uid(), name: 'Rajan Kumar',    mobile: '9876543210', lic: 'TN3720100012345', licexp: '2027-08-15', aadhar: '1234 5678 9012', vehicle: 'TN 39 AB 1234', status: 'Active',   addr: '12, Gandhi Nagar, Chennai - 600001',     emg: '9876543211' },
    { id: uid(), name: 'Murugan S',      mobile: '9865432100', lic: 'TN0520180054321', licexp: '2026-12-10', aadhar: '2345 6789 0123', vehicle: 'TN 63 CD 5678', status: 'Active',   addr: '45, Anna Salai, Coimbatore - 641001',    emg: '9865432101' },
    { id: uid(), name: 'Selvam P',       mobile: '9754321009', lic: 'TN2820150098765', licexp: '2027-03-22', aadhar: '3456 7890 1234', vehicle: 'TN 72 EF 9012', status: 'On Leave', addr: '8, Nehru Street, Madurai - 625001',       emg: '9754321010' },
    { id: uid(), name: 'Balamurugan T',  mobile: '9643210098', lic: 'TN4120220067890', licexp: '2028-06-30', aadhar: '4567 8901 2345', vehicle: 'TN 58 GH 3456', status: 'Active',   addr: '22, KK Nagar, Trichy - 620021',           emg: '9643210099' },
    { id: uid(), name: 'Karthik V',      mobile: '9532100987', lic: 'TN5520190043210', licexp: '2026-09-05', aadhar: '5678 9012 3456', vehicle: 'TN 47 IJ 7890', status: 'Active',   addr: '67, RS Puram, Salem - 636001',            emg: '9532100988' }
  ];

  // ── Renewals (5) ─────────────────────────────────────────────────
  DB.renewals = [
    { id: uid(), vehicle: 'TN 39 AB 1234', type: 'Insurance',               expiry: addDays(60),   remind: '15', cost: '18500', notes: 'New India Assurance' },
    { id: uid(), vehicle: 'TN 63 CD 5678', type: 'FC (Fitness Certificate)', expiry: addDays(15),   remind: '7',  cost: '4200',  notes: 'RTO Coimbatore renewal' },
    { id: uid(), vehicle: 'TN 72 EF 9012', type: 'Permit',                   expiry: addDays(-5),   remind: '15', cost: '12000', notes: 'National permit — renewal pending!' },
    { id: uid(), vehicle: 'TN 58 GH 3456', type: 'Insurance',               expiry: addDays(8),    remind: '7',  cost: '22000', notes: 'Oriental Insurance — urgent!' },
    { id: uid(), vehicle: 'TN 47 IJ 7890', type: 'Road Tax',                 expiry: addDays(120),  remind: '30', cost: '8500',  notes: 'Annual road tax payment' }
  ];

  // ── Fuel entries (6) ─────────────────────────────────────────────
  DB.fuel = [
    { id: uid(), date: addDays(-2),  vehicle: 'TN 39 AB 1234', driver: 'Rajan Kumar',   type: 'Diesel', litres: 120, rate: 102.50, total: 12300,  odo: '45230' },
    { id: uid(), date: addDays(-5),  vehicle: 'TN 63 CD 5678', driver: 'Murugan S',     type: 'Diesel', litres: 200, rate: 101.80, total: 20360,  odo: '82450' },
    { id: uid(), date: addDays(-8),  vehicle: 'TN 58 GH 3456', driver: 'Balamurugan T', type: 'Diesel', litres: 350, rate: 102.20, total: 35770,  odo: '110800' },
    { id: uid(), date: addDays(-3),  vehicle: 'TN 47 IJ 7890', driver: 'Karthik V',     type: 'Diesel', litres: 80,  rate: 103.00, total: 8240,   odo: '22100' },
    { id: uid(), date: addDays(-10), vehicle: 'TN 39 AB 1234', driver: 'Rajan Kumar',   type: 'Diesel', litres: 140, rate: 101.50, total: 14210,  odo: '44900' },
    { id: uid(), date: addDays(-7),  vehicle: 'TN 72 EF 9012', driver: 'Selvam P',      type: 'Diesel', litres: 95,  rate: 102.00, total: 9690,   odo: '31500' }
  ];

  // ── Expenses (6) ─────────────────────────────────────────────────
  DB.expenses = [
    { id: uid(), date: addDays(-1),  cat: 'Maintenance',    amount: 8500,  ref: 'WO-001', desc: 'Tyre replacement — TN 63 CD 5678',      pay: 'Cash' },
    { id: uid(), date: addDays(-4),  cat: 'Salary',         amount: 18000, ref: 'SAL-05', desc: 'May salary — Rajan Kumar',               pay: 'Bank Transfer' },
    { id: uid(), date: addDays(-6),  cat: 'Vehicle Repair', amount: 12000, ref: 'GRG-22', desc: 'Engine service — TN 72 EF 9012',         pay: 'Cash' },
    { id: uid(), date: addDays(-9),  cat: 'Toll',           amount: 1850,  ref: 'TOLL-TN', desc: 'NH44 toll charges — Chennai to Madurai', pay: 'FASTag' },
    { id: uid(), date: addDays(-12), cat: 'Insurance',      amount: 22000, ref: 'OIC-887', desc: 'Insurance renewal — TN 58 GH 3456',     pay: 'Bank Transfer' },
    { id: uid(), date: addDays(-3),  cat: 'Salary',         amount: 16500, ref: 'SAL-06', desc: 'May salary — Murugan S',                 pay: 'Bank Transfer' }
  ];

  // ── Invoices (3) ──────────────────────────────────────────────────
  const sellerSnap1 = { name: DB.companies[0].name, gstin: DB.companies[0].gstin, state: DB.companies[0].state, scode: DB.companies[0].scode, addr: DB.companies[0].addr, bank: DB.companies[0].bank, acno: DB.companies[0].acno, ifsc: DB.companies[0].ifsc, branch: DB.companies[0].branch, holder: DB.companies[0].holder };

  function makeInv(no, dateOff, custName, custMobile, custGst, custAddr, vehicleNo, driverName, status, paidAmt, itemsList) {
    const totTaxable = itemsList.reduce((a,b)=>a+b.taxable, 0);
    const totCGST    = itemsList.reduce((a,b)=>a+b.cgst,    0);
    const totSGST    = itemsList.reduce((a,b)=>a+b.sgst,    0);
    const gross      = totTaxable + totCGST + totSGST;
    const grandTotal = Math.round(gross);
    return {
      id: uid(), invoiceNo: 'INV-' + String(no).padStart(3,'0'),
      date: addDays(dateOff), sellerId: cid1, sellerSnap: sellerSnap1,
      custName, custMobile, custGst, custAddr,
      vehicleNo, driverName, gstMode: 'exclusive',
      payMethod: 'Bank Transfer', status,
      notes: 'Thank you for your business!',
      items: itemsList, totTaxable, totCGST, totSGST,
      totalGST: totCGST + totSGST,
      roundOff: grandTotal - gross,
      grandTotal, paidAmt,
      balanceAmt: grandTotal - paidAmt
    };
  }

  function item(desc, hsn, unit, qty, rate, gstPct) {
    const taxable = qty * rate;
    const cgst = taxable * (gstPct/2) / 100;
    const sgst = cgst;
    return { desc, hsn, unit, qty, rate, gstPct, taxable, cgst, sgst, total: taxable + cgst + sgst };
  }

  DB.invoices = [
    makeInv(1, -15, 'AK Constructions Pvt Ltd', '9444555666', '33AAKCA1234B1ZX', '15, Industrial Estate, Chennai - 600010', 'TN 39 AB 1234', 'Rajan Kumar', 'Paid', 10030,
      [item('Transport Charge (Per Trip)', '9965', 'Trip', 1, 8500, 5), item('Loading / Unloading Charge', '9985', 'Trip', 1, 650, 18)]
    ),
    makeInv(2, -8, 'Vel Infra Projects', '9222333444', '33BVLIP5432D1Z8', '22, SIDCO Colony, Madurai - 625003', 'TN 63 CD 5678', 'Murugan S', 'Partial',  10000,
      [item('Freight Charge (Per Tonne)', '9965', 'Tonne', 10, 1200, 5), item('Toll & Other Expenses', '9965', 'Trip', 2, 500, 0)]
    ),
    makeInv(3, -2, 'Kavitha Road Lines', '9000111222', '33CKRLA7654E1Z5', '88, Trichy Road, Karur - 639001', 'TN 58 GH 3456', 'Balamurugan T', 'Unpaid', 0,
      [item('Transport Charge (Per Trip)', '9965', 'Trip', 2, 8500, 5), item('Detention Charge (Per Day)', '9965', 'Day', 1, 2000, 18)]
    )
  ];
  DB.settings.nextNum = 4;

  saveDB();
}

function init() {
  loadDB();
  injectSampleData();
  const savedTheme = localStorage.getItem('sk_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeBtn();
  setDate();
  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  populateSellerSelect();
  renderDashboard();
  renderClients();
  renderProducts();
  renderCompanies();
  checkMobile();
}
