// ================================================================
//  api.js — IN-MEMORY MOCK (DB data seeded from MySQL export)
//  No PHP/Apache needed — runs fully in the browser
// ================================================================

// ── Seed data from MySQL dump ────────────────────────────────────
const SEED = {
  companies: [
    { id:'cmp001', name:'Sammy Kura Transport Co.', gstin:'33ABCSK1234F1Z5', state:'Tamil Nadu', scode:'33', addr:'14, Industrial Estate, Guindy, Chennai - 600032', phone:'9876543200', email:'info@sammykura.in', bank:'City Union Bank', acno:'510909010296124', ifsc:'CIUB0000190', branch:'Guindy Branch', holder:'Sammy Kura Transport Co.' },
    { id:'cmp002', name:'SK Blue Metals Pvt Ltd', gstin:'33XYZSK5678G1Z9', state:'Tamil Nadu', scode:'33', addr:'88, SIDCO Industrial Area, Coimbatore - 641021', phone:'9876500001', email:'accounts@skblue.co.in', bank:'Indian Bank', acno:'600102034567890', ifsc:'IDIB000C055', branch:'Coimbatore Main', holder:'SK Blue Metals Pvt Ltd' }
  ],
  clients: [
    { id:'cli001', name:'AK Constructions Pvt Ltd', mobile:'9444555666', gstin:'33AAKCA1234B1ZX', email:'ak@akconstruct.com', addr:'15, Industrial Estate, Chennai - 600010', state:'Tamil Nadu', scode:'33', type:'Corporate' },
    { id:'cli002', name:'Sri Murugan Traders', mobile:'9333444555', gstin:'33ASRMT9876C1Z2', email:'', addr:'7, Market Street, Coimbatore - 641001', state:'Tamil Nadu', scode:'33', type:'Regular' },
    { id:'cli003', name:'Vel Infra Projects', mobile:'9222333444', gstin:'33BVLIP5432D1Z8', email:'vel@velinfra.in', addr:'22, SIDCO Colony, Madurai - 625003', state:'Tamil Nadu', scode:'33', type:'VIP' },
    { id:'cli004', name:'Balaji Steel Suppliers', mobile:'9111222333', gstin:'', email:'', addr:'5, Mettur Road, Salem - 636001', state:'Tamil Nadu', scode:'33', type:'Regular' },
    { id:'cli005', name:'Kavitha Road Lines', mobile:'9000111222', gstin:'33CKRLA7654E1Z5', email:'kavitha@krl.co.in', addr:'88, Trichy Road, Karur - 639001', state:'Tamil Nadu', scode:'33', type:'Corporate' }
  ],
  products: [
    { id:'prd001', name:'Transport Charge (Per Trip)', hsn:'9965', rate:8500, unit:'Trip', gst:5, icon:'🚛' },
    { id:'prd002', name:'Freight Charge (Per Tonne)', hsn:'9965', rate:1200, unit:'Tonne', gst:5, icon:'⚖️' },
    { id:'prd003', name:'Loading / Unloading Charge', hsn:'9985', rate:650, unit:'Trip', gst:18, icon:'📦' },
    { id:'prd004', name:'Detention Charge (Per Day)', hsn:'9965', rate:2000, unit:'Day', gst:18, icon:'📅' },
    { id:'prd005', name:'Toll & Other Expenses', hsn:'9965', rate:500, unit:'Trip', gst:0, icon:'🪙' },
    { id:'prd006', name:'Cement (OPC 53 Grade)', hsn:'2523', rate:420, unit:'Bag', gst:28, icon:'🧱' },
    { id:'prd007', name:'Cement (PPC Grade)', hsn:'2523', rate:400, unit:'Bag', gst:28, icon:'🧱' },
    { id:'prd008', name:'River Sand (Nattu Manal)', hsn:'2505', rate:4500, unit:'Tonne', gst:5, icon:'🏖️' },
    { id:'prd009', name:'M-Sand (Manufactured Sand)', hsn:'2505', rate:2800, unit:'Tonne', gst:5, icon:'🏖️' },
    { id:'prd010', name:'P-Sand (Plastering Sand)', hsn:'2505', rate:3200, unit:'Tonne', gst:5, icon:'🏖️' },
    { id:'prd011', name:'Sengal (Country Brick)', hsn:'6901', rate:7500, unit:'1000 Nos', gst:5, icon:'🧱' },
    { id:'prd012', name:'Wire Cut Brick', hsn:'6901', rate:9000, unit:'1000 Nos', gst:5, icon:'🧱' },
    { id:'prd013', name:'Solid Block (4 inch)', hsn:'6810', rate:28, unit:'Nos', gst:12, icon:'🟫' },
    { id:'prd014', name:'Solid Block (6 inch)', hsn:'6810', rate:38, unit:'Nos', gst:12, icon:'🟫' },
    { id:'prd015', name:'Hollow Block (4 inch)', hsn:'6810', rate:22, unit:'Nos', gst:12, icon:'🟫' },
    { id:'prd016', name:'Hollow Block (6 inch)', hsn:'6810', rate:32, unit:'Nos', gst:12, icon:'🟫' },
    { id:'prd017', name:'Blue Metal (6mm Jelly)', hsn:'2517', rate:1800, unit:'CFT', gst:5, icon:'🪨' },
    { id:'prd018', name:'Blue Metal (12mm Jelly)', hsn:'2517', rate:1600, unit:'CFT', gst:5, icon:'🪨' },
    { id:'prd019', name:'Blue Metal (20mm Jelly)', hsn:'2517', rate:1400, unit:'CFT', gst:5, icon:'🪨' },
    { id:'prd020', name:'Granite Dust (Crusher Dust)', hsn:'2517', rate:900, unit:'CFT', gst:5, icon:'🪨' },
    { id:'prd021', name:'Granite (Rubble Stone)', hsn:'2516', rate:3500, unit:'Tonne', gst:5, icon:'🪨' },
    { id:'prd022', name:'WBM Stone (Road Metal)', hsn:'2517', rate:1200, unit:'CFT', gst:5, icon:'🪨' }
  ],
  fleet: [
    { id:'flt001', no:'TN 39 AB 1234', type:'Lorry', model:'Tata 407', year:'2021', owner:'Sammy Kura', driver:'Rajan Kumar', status:'Active', ins:'2026-11-30', fc:'2027-03-15', permit:'2027-01-20' },
    { id:'flt002', no:'TN 63 CD 5678', type:'Tipper', model:'Ashok Leyland 2518', year:'2020', owner:'Sammy Kura', driver:'Murugan S', status:'Active', ins:'2026-08-25', fc:'2026-06-10', permit:'2026-08-05' },
    { id:'flt003', no:'TN 72 EF 9012', type:'Mini Truck', model:'Mahindra Bolero Pikup', year:'2022', owner:'Sammy Kura', driver:'Selvam P', status:'Under Maintenance', ins:'2027-02-14', fc:'2027-07-18', permit:'2027-04-30' },
    { id:'flt004', no:'TN 58 GH 3456', type:'Trailer', model:'BharatBenz 4028', year:'2019', owner:'Sammy Kura', driver:'Balamurugan T', status:'Active', ins:'2026-07-10', fc:'2026-09-22', permit:'2026-10-01' },
    { id:'flt005', no:'TN 47 IJ 7890', type:'Lorry', model:'Eicher Pro 2059', year:'2023', owner:'Sammy Kura', driver:'Karthik V', status:'Idle', ins:'2027-05-18', fc:'2028-01-09', permit:'2027-11-25' }
  ],
  drivers: [
    { id:'drv001', name:'Rajan Kumar', mobile:'9876543210', lic:'TN3720100012345', licexp:'2027-08-15', aadhar:'1234 5678 9012', vehicle:'TN 39 AB 1234', status:'Active', addr:'12, Gandhi Nagar, Chennai - 600001', emg:'9876543211' },
    { id:'drv002', name:'Murugan S', mobile:'9865432100', lic:'TN0520180054321', licexp:'2026-12-10', aadhar:'2345 6789 0123', vehicle:'TN 63 CD 5678', status:'Active', addr:'45, Anna Salai, Coimbatore - 641001', emg:'9865432101' },
    { id:'drv003', name:'Selvam P', mobile:'9754321009', lic:'TN2820150098765', licexp:'2027-03-22', aadhar:'3456 7890 1234', vehicle:'TN 72 EF 9012', status:'On Leave', addr:'8, Nehru Street, Madurai - 625001', emg:'9754321010' },
    { id:'drv004', name:'Balamurugan T', mobile:'9643210098', lic:'TN4120220067890', licexp:'2028-06-30', aadhar:'4567 8901 2345', vehicle:'TN 58 GH 3456', status:'Active', addr:'22, KK Nagar, Trichy - 620021', emg:'9643210099' },
    { id:'drv005', name:'Karthik V', mobile:'9532100987', lic:'TN5520190043210', licexp:'2026-09-05', aadhar:'5678 9012 3456', vehicle:'TN 47 IJ 7890', status:'Active', addr:'67, RS Puram, Salem - 636001', emg:'9532100988' }
  ],
  renewals: [
    { id:'ren001', vehicle:'TN 39 AB 1234', type:'Insurance', expiry:'2026-07-26', remind:15, cost:18500, notes:'New India Assurance' },
    { id:'ren002', vehicle:'TN 63 CD 5678', type:'FC (Fitness Certificate)', expiry:'2026-06-11', remind:7, cost:4200, notes:'RTO Coimbatore renewal' },
    { id:'ren003', vehicle:'TN 72 EF 9012', type:'Permit', expiry:'2026-05-22', remind:15, cost:12000, notes:'National permit — renewal pending!' },
    { id:'ren004', vehicle:'TN 58 GH 3456', type:'Insurance', expiry:'2026-06-04', remind:7, cost:22000, notes:'Oriental Insurance — urgent!' },
    { id:'ren005', vehicle:'TN 47 IJ 7890', type:'Road Tax', expiry:'2026-09-24', remind:30, cost:8500, notes:'Annual road tax payment' }
  ],
  fuel: [
    { id:'fue001', date:'2026-05-25', vehicle:'TN 39 AB 1234', driver:'Rajan Kumar', type:'Diesel', litres:120, rate:102.50, total:12300, odo:45230 },
    { id:'fue002', date:'2026-05-22', vehicle:'TN 63 CD 5678', driver:'Murugan S', type:'Diesel', litres:200, rate:101.80, total:20360, odo:82450 },
    { id:'fue003', date:'2026-05-19', vehicle:'TN 58 GH 3456', driver:'Balamurugan T', type:'Diesel', litres:350, rate:102.20, total:35770, odo:110800 },
    { id:'fue004', date:'2026-05-24', vehicle:'TN 47 IJ 7890', driver:'Karthik V', type:'Diesel', litres:80, rate:103.00, total:8240, odo:22100 },
    { id:'fue005', date:'2026-05-17', vehicle:'TN 39 AB 1234', driver:'Rajan Kumar', type:'Diesel', litres:140, rate:101.50, total:14210, odo:44900 },
    { id:'fue006', date:'2026-05-20', vehicle:'TN 72 EF 9012', driver:'Selvam P', type:'Diesel', litres:95, rate:102.00, total:9690, odo:31500 }
  ],
  expenses: [
    { id:'exp001', date:'2026-05-26', cat:'Maintenance', amount:8500, ref:'WO-001', desc:'Tyre replacement — TN 63 CD 5678', pay:'Cash' },
    { id:'exp002', date:'2026-05-23', cat:'Salary', amount:18000, ref:'SAL-05', desc:'May salary — Rajan Kumar', pay:'Bank Transfer' },
    { id:'exp003', date:'2026-05-21', cat:'Vehicle Repair', amount:12000, ref:'GRG-22', desc:'Engine service — TN 72 EF 9012', pay:'Cash' },
    { id:'exp004', date:'2026-05-18', cat:'Toll', amount:1850, ref:'TOLL-TN', desc:'NH44 toll charges — Chennai to Madurai', pay:'FASTag' },
    { id:'exp005', date:'2026-05-15', cat:'Insurance', amount:22000, ref:'OIC-887', desc:'Insurance renewal — TN 58 GH 3456', pay:'Bank Transfer' },
    { id:'exp006', date:'2026-05-24', cat:'Salary', amount:16500, ref:'SAL-06', desc:'May salary — Murugan S', pay:'Bank Transfer' }
  ],
  invoices: [
    { id:'inv001', invoice_no:'INV-001', date:'2026-05-12', cust_name:'AK Constructions Pvt Ltd', cust_mobile:'9444555666', cust_gst:'33AAKCA1234B1ZX', cust_addr:'15, Industrial Estate, Chennai - 600010', vehicle_no:'TN 39 AB 1234', driver_name:'Rajan Kumar', status:'Paid', grand_total:10030, paid_amt:10030, balance_amt:0, seller_id:'cmp001',
      sellerSnap:{ name:'Sammy Kura Transport Co.', gstin:'33ABCSK1234F1Z5', state:'Tamil Nadu', scode:'33', addr:'14, Industrial Estate, Guindy, Chennai - 600032', bank:'City Union Bank', acno:'510909010296124', ifsc:'CIUB0000190', branch:'Guindy Branch', holder:'Sammy Kura Transport Co.' },
      invoiceNo:'INV-001', custName:'AK Constructions Pvt Ltd', custMobile:'9444555666', custGst:'33AAKCA1234B1ZX', custAddr:'15, Industrial Estate, Chennai - 600010', vehicleNo:'TN 39 AB 1234', driverName:'Rajan Kumar', gstMode:'exclusive', payMethod:'Bank Transfer', totTaxable:9150, totCGST:228.75, totSGST:228.75, totalGST:457.50, roundOff:0.50, grandTotal:10030, paidAmt:10030, balanceAmt:0, notes:'Thank you for your business!',
      items:[{ desc:'Transport Charge (Per Trip)', hsn:'9965', unit:'Trip', qty:1, rate:8500, gstPct:5, taxable:8500, cgst:212.50, sgst:212.50, total:8925 },{ desc:'Loading / Unloading Charge', hsn:'9985', unit:'Trip', qty:1, rate:650, gstPct:18, taxable:650, cgst:58.50, sgst:58.50, total:767 }]
    },
    { id:'inv002', invoice_no:'INV-002', date:'2026-05-19', cust_name:'Vel Infra Projects', cust_mobile:'9222333444', cust_gst:'33BVLIP5432D1Z8', cust_addr:'22, SIDCO Colony, Madurai - 625003', vehicle_no:'TN 63 CD 5678', driver_name:'Murugan S', status:'Partial', grand_total:13600, paid_amt:10000, balance_amt:3600, seller_id:'cmp001',
      sellerSnap:{ name:'Sammy Kura Transport Co.', gstin:'33ABCSK1234F1Z5', state:'Tamil Nadu', scode:'33', addr:'14, Industrial Estate, Guindy, Chennai - 600032', bank:'City Union Bank', acno:'510909010296124', ifsc:'CIUB0000190', branch:'Guindy Branch', holder:'Sammy Kura Transport Co.' },
      invoiceNo:'INV-002', custName:'Vel Infra Projects', custMobile:'9222333444', custGst:'33BVLIP5432D1Z8', custAddr:'22, SIDCO Colony, Madurai - 625003', vehicleNo:'TN 63 CD 5678', driverName:'Murugan S', gstMode:'exclusive', payMethod:'Bank Transfer', totTaxable:13000, totCGST:300, totSGST:300, totalGST:600, roundOff:0, grandTotal:13600, paidAmt:10000, balanceAmt:3600, notes:'Thank you for your business!',
      items:[{ desc:'Freight Charge (Per Tonne)', hsn:'9965', unit:'Tonne', qty:10, rate:1200, gstPct:5, taxable:12000, cgst:300, sgst:300, total:12600 },{ desc:'Toll & Other Expenses', hsn:'9965', unit:'Trip', qty:2, rate:500, gstPct:0, taxable:1000, cgst:0, sgst:0, total:1000 }]
    },
    { id:'inv003', invoice_no:'INV-003', date:'2026-05-25', cust_name:'Kavitha Road Lines', cust_mobile:'9000111222', cust_gst:'33CKRLA7654E1Z5', cust_addr:'88, Trichy Road, Karur - 639001', vehicle_no:'TN 58 GH 3456', driver_name:'Balamurugan T', status:'Unpaid', grand_total:20000, paid_amt:0, balance_amt:20000, seller_id:'cmp001',
      sellerSnap:{ name:'Sammy Kura Transport Co.', gstin:'33ABCSK1234F1Z5', state:'Tamil Nadu', scode:'33', addr:'14, Industrial Estate, Guindy, Chennai - 600032', bank:'City Union Bank', acno:'510909010296124', ifsc:'CIUB0000190', branch:'Guindy Branch', holder:'Sammy Kura Transport Co.' },
      invoiceNo:'INV-003', custName:'Kavitha Road Lines', custMobile:'9000111222', custGst:'33CKRLA7654E1Z5', custAddr:'88, Trichy Road, Karur - 639001', vehicleNo:'TN 58 GH 3456', driverName:'Balamurugan T', gstMode:'exclusive', payMethod:'Bank Transfer', totTaxable:19000, totCGST:660, totSGST:660, totalGST:1320, roundOff:0, grandTotal:20000, paidAmt:0, balanceAmt:20000, notes:'Thank you for your business!',
      items:[{ desc:'Transport Charge (Per Trip)', hsn:'9965', unit:'Trip', qty:2, rate:8500, gstPct:5, taxable:17000, cgst:425, sgst:425, total:17850 },{ desc:'Detention Charge (Per Day)', hsn:'9965', unit:'Day', qty:1, rate:2000, gstPct:18, taxable:2000, cgst:180, sgst:180, total:2360 }]
    }
  ],
  settings: { prefix:'INV', nextNum:4 }
};

// ── Initialize mock store from seed (only once) ──────────────────
const STORE_KEY = 'lorry_mock_store_v2';
function getStore() {
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (s) return JSON.parse(s);
  } catch(e) {}
  return JSON.parse(JSON.stringify(SEED)); // deep clone seed
}
function saveStore(store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch(e) {}
}

// ── uid helper ───────────────────────────────────────────────────
function mockUid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

// ── INIT PATCH — override loadDB/saveDB then call init directly ──
// Scripts are at bottom of <body>, DOM is already ready here.
window.saveDB = function() { saveStore(DB); };
window.loadDB = async function() {
  const store = getStore();
  DB.companies = store.companies || [];
  DB.clients   = store.clients   || [];
  DB.products  = store.products  || [];
  DB.invoices  = store.invoices  || [];
  DB.fleet     = store.fleet     || [];
  DB.drivers   = store.drivers   || [];
  DB.renewals  = store.renewals  || [];
  DB.fuel      = store.fuel      || [];
  DB.expenses  = store.expenses  || [];
  DB.settings  = store.settings  || { prefix:'INV', nextNum:1 };
};

(function bootMock() {
  // Patch the synchronous init() defined in main.js
  const _orig = window.init;
  window.init = function() {
    window.loadDB(); // sync-safe because getStore is sync
    injectSampleData(); // no-op
    const savedTheme = localStorage.getItem('sk_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (typeof updateThemeBtn === 'function') updateThemeBtn();
    if (typeof setDate === 'function') setDate();
    const dd = document.getElementById('dash-date');
    if (dd) dd.textContent = new Date().toLocaleDateString('en-IN',
      { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    if (typeof populateSellerSelect === 'function') populateSellerSelect();
    if (typeof renderDashboard    === 'function') renderDashboard();
    if (typeof renderClients      === 'function') renderClients();
    if (typeof renderProducts     === 'function') renderProducts();
    if (typeof renderCompanies    === 'function') renderCompanies();
    if (typeof checkMobile        === 'function') checkMobile();
  };
  window.init(); // call immediately — DOM is ready (scripts at bottom of body)
})();

// ── COMPANIES ────────────────────────────────────────────────────
window.saveGstCompany = async function() {
  const name  = document.getElementById('gco-name').value.trim();
  const gstin = document.getElementById('gco-gstin').value.trim().toUpperCase();
  const state = document.getElementById('gco-state').value.trim();
  const scode = document.getElementById('gco-scode').value.trim();
  if (!name)                       { toast('Company name required','error'); return; }
  if (!gstin || gstin.length < 10) { toast('Valid GSTIN required','error'); return; }
  if (!state || !scode)            { toast('State and State Code required','error'); return; }
  const obj = {
    id: editingGcoId || mockUid(), name, gstin, state, scode,
    addr:   document.getElementById('gco-addr').value.trim()   || state,
    phone:  document.getElementById('gco-phone').value.trim(),
    email:  document.getElementById('gco-email').value.trim(),
    bank:   document.getElementById('gco-bank').value.trim(),
    acno:   document.getElementById('gco-acno').value.trim(),
    ifsc:   document.getElementById('gco-ifsc').value.trim(),
    branch: document.getElementById('gco-branch').value.trim(),
    holder: document.getElementById('gco-holder').value.trim()
  };
  if (editingGcoId) {
    const i = DB.companies.findIndex(x => x.id === editingGcoId);
    if (i >= 0) DB.companies[i] = obj;
    toast('Company updated!','success');
  } else {
    DB.companies.push(obj);
    toast('Company added!','success');
  }
  window.saveDB();
  renderCompanies(); populateSellerSelect();
  toggleGcoForm(false); clearGcoForm();
};

window.deleteGstCompany = function(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this GST Company?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.companies = DB.companies.filter(x => x.id !== id);
    window.saveDB(); renderCompanies(); populateSellerSelect();
    toast('Company deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
};

// ── CLIENTS ──────────────────────────────────────────────────────
window.saveClient = async function() {
  const name   = document.getElementById('cm-name').value.trim();
  const mobile = document.getElementById('cm-mobile').value.trim();
  const addr   = document.getElementById('cm-addr').value.trim();
  if (!name || !mobile || !addr) { toast('Name, mobile & address required','error'); return; }
  const obj = {
    id:    editingClientId || mockUid(), name, mobile,
    gstin: document.getElementById('cm-gstin').value.trim().toUpperCase(),
    email: document.getElementById('cm-email').value.trim(),
    addr,
    state: document.getElementById('cm-state').value.trim(),
    scode: document.getElementById('cm-scode').value.trim(),
    type:  document.getElementById('cm-type').value
  };
  if (editingClientId) {
    const i = DB.clients.findIndex(x => x.id === editingClientId);
    if (i >= 0) DB.clients[i] = obj;
    toast('Client updated!','success');
  } else {
    DB.clients.push(obj);
    toast('Client added!','success');
  }
  window.saveDB(); renderClients();
  closeModal('clientModal'); clearClientForm();
};

window.deleteClient = function(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this client? Their invoices will remain.';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.clients = DB.clients.filter(x => x.id !== id);
    window.saveDB(); renderClients(); toast('Client deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
};

// ── PRODUCTS ─────────────────────────────────────────────────────
window.saveProduct = async function() {
  const name = document.getElementById('pm-name').value.trim();
  if (!name) { toast('Product name required','error'); return; }
  const obj = {
    id:   editingProductId || mockUid(), name,
    hsn:  document.getElementById('pm-hsn').value.trim(),
    rate: parseFloat(document.getElementById('pm-rate').value) || 0,
    unit: document.getElementById('pm-unit').value,
    gst:  parseFloat(document.getElementById('pm-gst').value) || 0,
    icon: document.getElementById('pm-icon').value || '📦'
  };
  if (editingProductId) {
    const i = DB.products.findIndex(x => x.id === editingProductId);
    if (i >= 0) DB.products[i] = obj;
    toast('Product updated!','success');
  } else {
    DB.products.push(obj);
    toast('Product added!','success');
  }
  window.saveDB(); renderProducts(); toggleProdForm(false); clearProductForm();
};

window.deleteProduct = function(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this product?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.products = DB.products.filter(x => x.id !== id);
    window.saveDB(); renderProducts(); toast('Product deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
};

// ── FLEET ────────────────────────────────────────────────────────
window.saveFleet = async function() {
  const no = document.getElementById('fl-no').value.trim().toUpperCase();
  if (!no) { toast('Vehicle number required','error'); return; }
  const obj = {
    id:     editingFleetId || mockUid(), no,
    type:   document.getElementById('fl-type').value,
    model:  document.getElementById('fl-model').value.trim(),
    year:   document.getElementById('fl-year').value.trim(),
    owner:  document.getElementById('fl-owner').value.trim(),
    driver: document.getElementById('fl-driver').value.trim(),
    status: document.getElementById('fl-status').value,
    ins:    document.getElementById('fl-ins').value   || null,
    fc:     document.getElementById('fl-fc').value    || null,
    permit: document.getElementById('fl-permit').value || null
  };
  if (editingFleetId) {
    const i = DB.fleet.findIndex(x => x.id === editingFleetId);
    if (i >= 0) DB.fleet[i] = obj;
    toast('Vehicle updated!','success');
  } else {
    DB.fleet.push(obj);
    toast('Vehicle added!','success');
  }
  window.saveDB(); renderFleet(); closeFleetForm();
};

window.deleteFleet = function(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this vehicle?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.fleet = DB.fleet.filter(x => x.id !== id);
    window.saveDB(); renderFleet(); toast('Vehicle deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
};

// ── DRIVERS ──────────────────────────────────────────────────────
window.saveDriver = async function() {
  const name = document.getElementById('dr-name').value.trim();
  if (!name) { toast('Driver name required','error'); return; }
  const obj = {
    id:     editingDriverId || mockUid(), name,
    mobile: document.getElementById('dr-mobile').value.trim(),
    lic:    document.getElementById('dr-lic').value.trim(),
    licexp: document.getElementById('dr-licexp').value || null,
    aadhar: document.getElementById('dr-aadhar').value.trim(),
    vehicle:document.getElementById('dr-vehicle').value.trim().toUpperCase(),
    status: document.getElementById('dr-status').value,
    addr:   document.getElementById('dr-addr').value.trim(),
    emg:    document.getElementById('dr-emg').value.trim()
  };
  if (editingDriverId) {
    const i = DB.drivers.findIndex(x => x.id === editingDriverId);
    if (i >= 0) DB.drivers[i] = obj;
    toast('Driver updated!','success');
  } else {
    DB.drivers.push(obj);
    toast('Driver added!','success');
  }
  window.saveDB(); renderDrivers(); closeDriverForm();
};

window.deleteDriver = function(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this driver?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.drivers = DB.drivers.filter(x => x.id !== id);
    window.saveDB(); renderDrivers(); toast('Driver deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
};

// ── RENEWALS ─────────────────────────────────────────────────────
window.saveRenewal = async function() {
  const vehicle = document.getElementById('rn-vehicle').value.trim().toUpperCase();
  const expiry  = document.getElementById('rn-expiry').value;
  if (!vehicle || !expiry) { toast('Vehicle & expiry date required','error'); return; }
  const obj = {
    id:     editingRenewalId || mockUid(), vehicle,
    type:   document.getElementById('rn-type').value,
    expiry,
    remind: parseInt(document.getElementById('rn-remind').value) || 15,
    cost:   parseFloat(document.getElementById('rn-cost').value) || null,
    notes:  document.getElementById('rn-notes').value.trim()
  };
  if (editingRenewalId) {
    const i = DB.renewals.findIndex(x => x.id === editingRenewalId);
    if (i >= 0) DB.renewals[i] = obj;
    toast('Renewal updated!','success');
  } else {
    DB.renewals.push(obj);
    toast('Renewal added!','success');
  }
  window.saveDB(); renderRenewals(); closeRenewalForm();
};

window.deleteRenewal = function(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this renewal record?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.renewals = DB.renewals.filter(x => x.id !== id);
    window.saveDB(); renderRenewals(); toast('Deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
};

// ── FUEL ─────────────────────────────────────────────────────────
window.saveFuel = async function() {
  const vehicle = document.getElementById('fuel-vehicle').value.trim().toUpperCase();
  const litres  = parseFloat(document.getElementById('fuel-litres').value);
  if (!vehicle || !litres) { toast('Vehicle & litres required','error'); return; }
  const rate  = parseFloat(document.getElementById('fuel-rate').value) || 0;
  const obj = {
    id:     mockUid(),
    date:   document.getElementById('fuel-date').value,
    vehicle, driver: document.getElementById('fuel-driver').value.trim(),
    type:   document.getElementById('fuel-type').value,
    litres, rate, total: litres * rate,
    odo:    document.getElementById('fuel-odo').value || null
  };
  DB.fuel.unshift(obj);
  window.saveDB(); renderFuel(); renderFuelStats(); closeFuelForm(); toast('Fuel entry added!','success');
};

window.deleteFuel = function(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this fuel entry?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.fuel = DB.fuel.filter(x => x.id !== id);
    window.saveDB(); renderFuel(); renderFuelStats(); toast('Deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
};

// ── EXPENSES ─────────────────────────────────────────────────────
window.saveExpense = async function() {
  const amount = parseFloat(document.getElementById('exp-amount').value);
  if (!amount || amount <= 0) { toast('Valid amount required','error'); return; }
  const obj = {
    id:   mockUid(),
    date: document.getElementById('exp-date').value,
    cat:  document.getElementById('exp-cat').value,
    amount,
    ref:  document.getElementById('exp-ref').value.trim(),
    desc: document.getElementById('exp-desc').value.trim(),
    pay:  document.getElementById('exp-pay').value
  };
  DB.expenses.unshift(obj);
  window.saveDB(); renderExpenses(); renderExpenseStats(); closeExpenseForm(); toast('Expense added!','success');
};

window.deleteExpense = function(id) {
  document.getElementById('deleteMsg').textContent = 'Delete this expense?';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.expenses = DB.expenses.filter(x => x.id !== id);
    window.saveDB(); renderExpenses(); renderExpenseStats(); toast('Deleted','info'); closeModal('deleteModal');
  };
  openModal('deleteModal');
};

// ── INVOICES ─────────────────────────────────────────────────────
window.saveInvoice = async function() {
  const sellerId   = document.getElementById('inv-seller').value;
  const custName   = document.getElementById('inv-custname').value.trim();
  const custMobile = document.getElementById('inv-custmobile').value.trim();
  if (!sellerId)   { toast('Please select a GST Company (Seller)','error'); return; }
  if (!custName)   { toast('Customer name required','error'); return; }
  if (!custMobile) { toast('Customer mobile required','error'); return; }

  const items = [];
  let hasProd = false;
  document.querySelectorAll('#itemsBody tr').forEach(row => {
    const inputs  = row.querySelectorAll('td');
    const desc    = row.querySelector('input:not([type="number"]):not([type="hidden"])')?.value?.trim();
    const hsnInp  = inputs[2]?.querySelector('input');
    const unitSel = row.querySelectorAll('select')[1];
    const qty     = parseFloat(row.querySelector('.qty')?.value)  || 0;
    const rate    = parseFloat(row.querySelector('.rate')?.value) || 0;
    const gstPct  = parseFloat(document.getElementById('gstval-' + row.id)?.value) || 0;
    if (!desc || qty <= 0 || rate <= 0) return;
    hasProd = true;
    let taxable, cgst, sgst, rowTotal;
    if (gstMode === 'exclusive') {
      taxable = qty * rate; cgst = taxable*(gstPct/2)/100; sgst = cgst; rowTotal = taxable + cgst + sgst;
    } else {
      rowTotal = qty * rate; taxable = rowTotal/(1+gstPct/100); cgst = taxable*(gstPct/2)/100; sgst = cgst;
    }
    items.push({ desc, hsn: hsnInp?.value||'', unit: unitSel?.value||'Nos', qty, rate, gstPct, taxable, cgst, sgst, total: rowTotal });
  });
  if (!hasProd) { toast('Add at least one product row with price','error'); return; }

  const totTaxable = items.reduce((a,b) => a+b.taxable, 0);
  const totCGST    = items.reduce((a,b) => a+b.cgst, 0);
  const totSGST    = items.reduce((a,b) => a+b.sgst, 0);
  const gross      = totTaxable + totCGST + totSGST;
  const grandTotal = Math.round(gross);
  const paidAmt    = parseFloat(document.getElementById('inv-paid').value) || 0;
  const seller     = DB.companies.find(x => x.id === sellerId) || {};
  const invoiceNo  = document.getElementById('inv-no').value;

  const inv = {
    id: mockUid(), invoiceNo, invoice_no: invoiceNo,
    date: document.getElementById('inv-date').value,
    sellerId, seller_id: sellerId,
    sellerSnap: { name:seller.name, gstin:seller.gstin, state:seller.state, scode:seller.scode,
                  addr:seller.addr, bank:seller.bank, acno:seller.acno, ifsc:seller.ifsc,
                  branch:seller.branch, holder:seller.holder },
    custName, cust_name: custName,
    custMobile, cust_mobile: custMobile,
    custGst:   document.getElementById('inv-custgst').value.trim().toUpperCase(),
    cust_gst:  document.getElementById('inv-custgst').value.trim().toUpperCase(),
    custAddr:  document.getElementById('inv-custaddr').value.trim(),
    cust_addr: document.getElementById('inv-custaddr').value.trim(),
    vehicleNo: document.getElementById('inv-vehicle').value.trim().toUpperCase(),
    vehicle_no: document.getElementById('inv-vehicle').value.trim().toUpperCase(),
    driverName: document.getElementById('inv-driver').value.trim(),
    driver_name: document.getElementById('inv-driver').value.trim(),
    gstMode, payMethod: document.getElementById('inv-pay').value,
    status: document.getElementById('inv-status').value,
    notes: document.getElementById('inv-notes').value.trim(),
    items, totTaxable, totCGST, totSGST,
    totalGST: totCGST + totSGST,
    roundOff: grandTotal - gross,
    grandTotal, grand_total: grandTotal,
    paidAmt, paid_amt: paidAmt,
    balanceAmt: grandTotal - paidAmt,
    balance_amt: grandTotal - paidAmt
  };

  DB.invoices.unshift(inv);
  DB.settings.nextNum = (DB.settings.nextNum || 1) + 1;
  window.saveDB();
  toast('Invoice ' + invoiceNo + ' saved! 🎉','success');
  resetInvoice(); renderDashboard();
};

window.deleteInvoice = function(id) {
  document.getElementById('deleteMsg').textContent = 'Are you sure you want to delete this invoice? This cannot be undone.';
  document.getElementById('deleteConfirmBtn').onclick = () => {
    DB.invoices = DB.invoices.filter(x => x.id !== id);
    window.saveDB(); toast('Invoice deleted','info'); closeModal('deleteModal');
    renderHistory(); renderDashboard();
  };
  openModal('deleteModal');
};

// ── SETTINGS ─────────────────────────────────────────────────────
window.saveSettings = async function() {
  const prefix  = document.getElementById('set-prefix')?.value?.trim();
  const nextNum = parseInt(document.getElementById('set-next')?.value) || 1;
  if (!prefix) return;
  DB.settings = { prefix, nextNum };
  window.saveDB(); toast('Settings saved!','success');
};

window.injectSampleData = function() {};

console.log('✅ api.js (mock mode) loaded — DB seeded from MySQL export, saved to localStorage.');
