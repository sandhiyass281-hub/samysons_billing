-- ============================================================
--  LORRY BILLING SYSTEM — DATABASE SCHEMA
--  DB: lorry_billing
--  Engine: MySQL 8+ / MariaDB 10.4+
-- ============================================================

CREATE DATABASE IF NOT EXISTS lorry_billing
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lorry_billing;

-- ──────────────────────────────────────────────────────────
-- 1. GST COMPANIES  (Seller / Your companies)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id          VARCHAR(36)  PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  gstin       VARCHAR(15)  NOT NULL UNIQUE,
  state       VARCHAR(80)  NOT NULL,
  scode       VARCHAR(2)   NOT NULL,
  addr        VARCHAR(300),
  phone       VARCHAR(15),
  email       VARCHAR(100),
  bank        VARCHAR(100),
  acno        VARCHAR(30),
  ifsc        VARCHAR(15),
  branch      VARCHAR(100),
  holder      VARCHAR(150),
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────
-- 2. CLIENTS  (Buyers / Customers)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id          VARCHAR(36)  PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  mobile      VARCHAR(15)  NOT NULL,
  gstin       VARCHAR(15),
  email       VARCHAR(100),
  addr        VARCHAR(300) NOT NULL,
  state       VARCHAR(80),
  scode       VARCHAR(2),
  type        ENUM('Regular','Corporate','VIP') DEFAULT 'Regular',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────
-- 3. PRODUCTS  (Service / Product Master)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          VARCHAR(36)   PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  hsn         VARCHAR(10),
  rate        DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit        VARCHAR(20)   DEFAULT 'Nos',
  gst         DECIMAL(5,2)  DEFAULT 0,
  icon        VARCHAR(5)    DEFAULT '📦',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────
-- 4. INVOICES  (Header)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              VARCHAR(36)   PRIMARY KEY,
  invoice_no      VARCHAR(30)   NOT NULL UNIQUE,
  date            DATE          NOT NULL,
  seller_id       VARCHAR(36)   NOT NULL,
  -- Seller snapshot (frozen at invoice time)
  seller_name     VARCHAR(150),
  seller_gstin    VARCHAR(15),
  seller_state    VARCHAR(80),
  seller_scode    VARCHAR(2),
  seller_addr     VARCHAR(300),
  seller_bank     VARCHAR(100),
  seller_acno     VARCHAR(30),
  seller_ifsc     VARCHAR(15),
  seller_branch   VARCHAR(100),
  seller_holder   VARCHAR(150),
  -- Buyer info
  cust_name       VARCHAR(150)  NOT NULL,
  cust_mobile     VARCHAR(15)   NOT NULL,
  cust_gst        VARCHAR(15),
  cust_addr       VARCHAR(300),
  -- Trip info
  vehicle_no      VARCHAR(20),
  driver_name     VARCHAR(100),
  -- Invoice settings
  gst_mode        ENUM('exclusive','inclusive') DEFAULT 'exclusive',
  pay_method      VARCHAR(50),
  status          ENUM('Paid','Unpaid','Partial') DEFAULT 'Unpaid',
  notes           TEXT,
  -- Totals
  tot_taxable     DECIMAL(14,2) DEFAULT 0,
  tot_cgst        DECIMAL(12,2) DEFAULT 0,
  tot_sgst        DECIMAL(12,2) DEFAULT 0,
  total_gst       DECIMAL(12,2) DEFAULT 0,
  round_off       DECIMAL(6,2)  DEFAULT 0,
  grand_total     DECIMAL(14,2) DEFAULT 0,
  paid_amt        DECIMAL(14,2) DEFAULT 0,
  balance_amt     DECIMAL(14,2) DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES companies(id) ON DELETE RESTRICT
);

-- ──────────────────────────────────────────────────────────
-- 5. INVOICE ITEMS  (Line items per invoice)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id          INT           AUTO_INCREMENT PRIMARY KEY,
  invoice_id  VARCHAR(36)   NOT NULL,
  description VARCHAR(200)  NOT NULL,
  hsn         VARCHAR(10),
  unit        VARCHAR(20),
  qty         DECIMAL(10,3) NOT NULL,
  rate        DECIMAL(12,2) NOT NULL,
  gst_pct     DECIMAL(5,2)  DEFAULT 0,
  taxable     DECIMAL(14,2) DEFAULT 0,
  cgst        DECIMAL(12,2) DEFAULT 0,
  sgst        DECIMAL(12,2) DEFAULT 0,
  total       DECIMAL(14,2) DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────────────
-- 6. FLEET  (Vehicles)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fleet (
  id          VARCHAR(36)  PRIMARY KEY,
  no          VARCHAR(20)  NOT NULL UNIQUE,
  type        ENUM('Lorry','Mini Truck','Tipper','Trailer','JCB','Car','Van','Auto','Other') DEFAULT 'Lorry',
  model       VARCHAR(100),
  year        VARCHAR(4),
  owner       VARCHAR(150),
  driver      VARCHAR(150),
  status      ENUM('Active','Under Maintenance','Idle','Out of Service') DEFAULT 'Active',
  ins         DATE,
  fc          DATE,
  permit      DATE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────
-- 7. DRIVERS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drivers (
  id          VARCHAR(36)  PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  mobile      VARCHAR(15),
  lic         VARCHAR(20),
  licexp      DATE,
  aadhar      VARCHAR(20),
  vehicle     VARCHAR(20),
  status      ENUM('Active','On Leave','Inactive') DEFAULT 'Active',
  addr        VARCHAR(300),
  emg         VARCHAR(15),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────
-- 8. RENEWALS  (Document expiry tracker)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS renewals (
  id          VARCHAR(36)  PRIMARY KEY,
  vehicle     VARCHAR(20)  NOT NULL,
  type        ENUM('Insurance','FC (Fitness Certificate)','Permit','Road Tax','PUC','Driver License','Other') DEFAULT 'Insurance',
  expiry      DATE         NOT NULL,
  remind      INT          DEFAULT 15,
  cost        DECIMAL(12,2),
  notes       VARCHAR(300),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────
-- 9. FUEL TRACKER
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fuel (
  id          VARCHAR(36)   PRIMARY KEY,
  date        DATE          NOT NULL,
  vehicle     VARCHAR(20)   NOT NULL,
  driver      VARCHAR(150),
  type        ENUM('Diesel','Petrol','CNG') DEFAULT 'Diesel',
  litres      DECIMAL(8,2)  NOT NULL,
  rate        DECIMAL(8,2)  DEFAULT 0,
  total       DECIMAL(12,2) DEFAULT 0,
  odo         INT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────
-- 10. EXPENSES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          VARCHAR(36)   PRIMARY KEY,
  date        DATE          NOT NULL,
  cat         ENUM('Maintenance','Fuel','Toll','Salary','Vehicle Repair','Tyre','Insurance','Tax','Office','Other') DEFAULT 'Other',
  amount      DECIMAL(12,2) NOT NULL,
  ref         VARCHAR(50),
  description VARCHAR(300),
  pay         ENUM('Cash','Bank Transfer','UPI','Cheque','FASTag') DEFAULT 'Cash',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────────────────
-- 11. SETTINGS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  id          INT PRIMARY KEY DEFAULT 1,
  prefix      VARCHAR(10) DEFAULT 'INV',
  next_num    INT         DEFAULT 1,
  CHECK (id = 1)   -- Only one row allowed
);

INSERT IGNORE INTO settings (id, prefix, next_num) VALUES (1, 'INV', 1);
