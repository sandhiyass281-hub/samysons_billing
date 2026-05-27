-- ============================================================
--  LORRY BILLING — SAMPLE DATA
--  Import this AFTER schema.sql
-- ============================================================

USE lorry_billing;

-- ── COMPANIES ─────────────────────────────────────────────
INSERT IGNORE INTO companies (id,name,gstin,state,scode,addr,phone,email,bank,acno,ifsc,branch,holder,created_at) VALUES
('cmp001','Sammy Kura Transport Co.','33ABCSK1234F1Z5','Tamil Nadu','33','14, Industrial Estate, Guindy, Chennai - 600032','9876543200','info@sammykura.in','City Union Bank','510909010296124','CIUB0000190','Guindy Branch','Sammy Kura Transport Co.','2026-05-27 11:25:20'),
('cmp002','SK Blue Metals Pvt Ltd','33XYZSK5678G1Z9','Tamil Nadu','33','88, SIDCO Industrial Area, Coimbatore - 641021','9876500001','accounts@skblue.co.in','Indian Bank','600102034567890','IDIB000C055','Coimbatore Main','SK Blue Metals Pvt Ltd','2026-05-27 11:25:20');

-- ── CLIENTS ───────────────────────────────────────────────
INSERT IGNORE INTO clients (id,name,mobile,gstin,email,addr,state,scode,type,created_at) VALUES
('cli001','AK Constructions Pvt Ltd','9444555666','33AAKCA1234B1ZX','ak@akconstruct.com','15, Industrial Estate, Chennai - 600010','Tamil Nadu','33','Corporate','2026-05-27 11:25:20'),
('cli002','Sri Murugan Traders','9333444555','33ASRMT9876C1Z2','','7, Market Street, Coimbatore - 641001','Tamil Nadu','33','Regular','2026-05-27 11:25:20'),
('cli003','Vel Infra Projects','9222333444','33BVLIP5432D1Z8','vel@velinfra.in','22, SIDCO Colony, Madurai - 625003','Tamil Nadu','33','VIP','2026-05-27 11:25:20'),
('cli004','Balaji Steel Suppliers','9111222333','','','5, Mettur Road, Salem - 636001','Tamil Nadu','33','Regular','2026-05-27 11:25:20'),
('cli005','Kavitha Road Lines','9000111222','33CKRLA7654E1Z5','kavitha@krl.co.in','88, Trichy Road, Karur - 639001','Tamil Nadu','33','Corporate','2026-05-27 11:25:20');

-- ── PRODUCTS ──────────────────────────────────────────────
INSERT IGNORE INTO products (id,name,hsn,rate,unit,gst,icon,created_at) VALUES
('prd001','Transport Charge (Per Trip)','9965',8500.00,'Trip',5.00,'🚛','2026-05-27 11:25:20'),
('prd002','Freight Charge (Per Tonne)','9965',1200.00,'Tonne',5.00,'⚖️','2026-05-27 11:25:20'),
('prd003','Loading / Unloading Charge','9985',650.00,'Trip',18.00,'📦','2026-05-27 11:25:20'),
('prd004','Detention Charge (Per Day)','9965',2000.00,'Day',18.00,'📅','2026-05-27 11:25:20'),
('prd005','Toll & Other Expenses','9965',500.00,'Trip',0.00,'🪙','2026-05-27 11:25:20');

-- ── DRIVERS ───────────────────────────────────────────────
INSERT IGNORE INTO drivers (id,name,mobile,lic,licexp,aadhar,vehicle,status,addr,emg,created_at) VALUES
('drv001','Rajan Kumar','9876543210','TN3720100012345','2027-08-15','1234 5678 9012','TN 39 AB 1234','Active','12, Gandhi Nagar, Chennai - 600001','9876543211','2026-05-27 11:25:20'),
('drv002','Murugan S','9865432100','TN0520180054321','2026-12-10','2345 6789 0123','TN 63 CD 5678','Active','45, Anna Salai, Coimbatore - 641001','9865432101','2026-05-27 11:25:20'),
('drv003','Selvam P','9754321009','TN2820150098765','2027-03-22','3456 7890 1234','TN 72 EF 9012','On Leave','8, Nehru Street, Madurai - 625001','9754321010','2026-05-27 11:25:20'),
('drv004','Balamurugan T','9643210098','TN4120220067890','2028-06-30','4567 8901 2345','TN 58 GH 3456','Active','22, KK Nagar, Trichy - 620021','9643210099','2026-05-27 11:25:20'),
('drv005','Karthik V','9532100987','TN5520190043210','2026-09-05','5678 9012 3456','TN 47 IJ 7890','Active','67, RS Puram, Salem - 636001','9532100988','2026-05-27 11:25:20');

-- ── FLEET ─────────────────────────────────────────────────
INSERT IGNORE INTO fleet (id,no,type,model,year,owner,driver,status,ins,fc,permit,created_at) VALUES
('flt001','TN 39 AB 1234','Lorry','Tata 407','2021','Sammy Kura','Rajan Kumar','Active','2026-11-30','2027-03-15','2027-01-20','2026-05-27 11:25:20'),
('flt002','TN 63 CD 5678','Tipper','Ashok Leyland 2518','2020','Sammy Kura','Murugan S','Active','2026-08-25','2026-06-10','2026-08-05','2026-05-27 11:25:20'),
('flt003','TN 72 EF 9012','Mini Truck','Mahindra Bolero Pikup','2022','Sammy Kura','Selvam P','Under Maintenance','2027-02-14','2027-07-18','2027-04-30','2026-05-27 11:25:20'),
('flt004','TN 58 GH 3456','Trailer','BharatBenz 4028','2019','Sammy Kura','Balamurugan T','Active','2026-07-10','2026-09-22','2026-10-01','2026-05-27 11:25:20'),
('flt005','TN 47 IJ 7890','Lorry','Eicher Pro 2059','2023','Sammy Kura','Karthik V','Idle','2027-05-18','2028-01-09','2027-11-25','2026-05-27 11:25:20');

-- ── RENEWALS ──────────────────────────────────────────────
INSERT IGNORE INTO renewals (id,vehicle,type,expiry,remind,cost,notes,created_at) VALUES
('ren001','TN 39 AB 1234','Insurance','2026-07-26',15,18500.00,'New India Assurance','2026-05-27 11:25:20'),
('ren002','TN 63 CD 5678','FC (Fitness Certificate)','2026-06-11',7,4200.00,'RTO Coimbatore renewal','2026-05-27 11:25:20'),
('ren003','TN 72 EF 9012','Permit','2026-05-22',15,12000.00,'National permit — renewal pending!','2026-05-27 11:25:20'),
('ren004','TN 58 GH 3456','Insurance','2026-06-04',7,22000.00,'Oriental Insurance — urgent!','2026-05-27 11:25:20'),
('ren005','TN 47 IJ 7890','Road Tax','2026-09-24',30,8500.00,'Annual road tax payment','2026-05-27 11:25:20');

-- ── FUEL ──────────────────────────────────────────────────
INSERT IGNORE INTO fuel (id,date,vehicle,driver,type,litres,rate,total,odo,created_at) VALUES
('fue001','2026-05-25','TN 39 AB 1234','Rajan Kumar','Diesel',120.00,102.50,12300.00,45230,'2026-05-27 11:25:20'),
('fue002','2026-05-22','TN 63 CD 5678','Murugan S','Diesel',200.00,101.80,20360.00,82450,'2026-05-27 11:25:20'),
('fue003','2026-05-19','TN 58 GH 3456','Balamurugan T','Diesel',350.00,102.20,35770.00,110800,'2026-05-27 11:25:20'),
('fue004','2026-05-24','TN 47 IJ 7890','Karthik V','Diesel',80.00,103.00,8240.00,22100,'2026-05-27 11:25:20'),
('fue005','2026-05-17','TN 39 AB 1234','Rajan Kumar','Diesel',140.00,101.50,14210.00,44900,'2026-05-27 11:25:20'),
('fue006','2026-05-20','TN 72 EF 9012','Selvam P','Diesel',95.00,102.00,9690.00,31500,'2026-05-27 11:25:20');

-- ── EXPENSES ──────────────────────────────────────────────
INSERT IGNORE INTO expenses (id,date,cat,amount,ref,description,pay,created_at) VALUES
('exp001','2026-05-26','Maintenance',8500.00,'WO-001','Tyre replacement — TN 63 CD 5678','Cash','2026-05-27 11:25:20'),
('exp002','2026-05-23','Salary',18000.00,'SAL-05','May salary — Rajan Kumar','Bank Transfer','2026-05-27 11:25:20'),
('exp003','2026-05-21','Vehicle Repair',12000.00,'GRG-22','Engine service — TN 72 EF 9012','Cash','2026-05-27 11:25:20'),
('exp004','2026-05-18','Toll',1850.00,'TOLL-TN','NH44 toll charges — Chennai to Madurai','FASTag','2026-05-27 11:25:20'),
('exp005','2026-05-15','Insurance',22000.00,'OIC-887','Insurance renewal — TN 58 GH 3456','Bank Transfer','2026-05-27 11:25:20'),
('exp006','2026-05-24','Salary',16500.00,'SAL-06','May salary — Murugan S','Bank Transfer','2026-05-27 11:25:20');

-- ── INVOICES ──────────────────────────────────────────────
INSERT IGNORE INTO invoices (id,invoice_no,date,seller_id,seller_name,seller_gstin,seller_state,seller_scode,seller_addr,seller_bank,seller_acno,seller_ifsc,seller_branch,seller_holder,cust_name,cust_mobile,cust_gst,cust_addr,vehicle_no,driver_name,gst_mode,pay_method,status,notes,tot_taxable,tot_cgst,tot_sgst,total_gst,round_off,grand_total,paid_amt,balance_amt,created_at) VALUES
('inv001','INV-001','2026-05-12','cmp001','Sammy Kura Transport Co.','33ABCSK1234F1Z5','Tamil Nadu','33','14, Industrial Estate, Guindy, Chennai - 600032','City Union Bank','510909010296124','CIUB0000190','Guindy Branch','Sammy Kura Transport Co.','AK Constructions Pvt Ltd','9444555666','33AAKCA1234B1ZX','15, Industrial Estate, Chennai - 600010','TN 39 AB 1234','Rajan Kumar','exclusive','Bank Transfer','Paid','Thank you for your business!',9150.00,228.75,228.75,457.50,0.50,10030.00,10030.00,0.00,'2026-05-27 11:25:20'),
('inv002','INV-002','2026-05-19','cmp001','Sammy Kura Transport Co.','33ABCSK1234F1Z5','Tamil Nadu','33','14, Industrial Estate, Guindy, Chennai - 600032','City Union Bank','510909010296124','CIUB0000190','Guindy Branch','Sammy Kura Transport Co.','Vel Infra Projects','9222333444','33BVLIP5432D1Z8','22, SIDCO Colony, Madurai - 625003','TN 63 CD 5678','Murugan S','exclusive','Bank Transfer','Partial','Thank you for your business!',13000.00,300.00,300.00,600.00,0.00,13600.00,10000.00,3600.00,'2026-05-27 11:25:20'),
('inv003','INV-003','2026-05-25','cmp001','Sammy Kura Transport Co.','33ABCSK1234F1Z5','Tamil Nadu','33','14, Industrial Estate, Guindy, Chennai - 600032','City Union Bank','510909010296124','CIUB0000190','Guindy Branch','Sammy Kura Transport Co.','Kavitha Road Lines','9000111222','33CKRLA7654E1Z5','88, Trichy Road, Karur - 639001','TN 58 GH 3456','Balamurugan T','exclusive','Bank Transfer','Unpaid','Thank you for your business!',19000.00,660.00,660.00,1320.00,0.00,20000.00,0.00,20000.00,'2026-05-27 11:25:20');

INSERT IGNORE INTO invoice_items (invoice_id,description,hsn,unit,qty,rate,gst_pct,taxable,cgst,sgst,total) VALUES
('inv001','Transport Charge (Per Trip)','9965','Trip',1.000,8500.00,5.00,8500.00,212.50,212.50,8925.00),
('inv001','Loading / Unloading Charge','9985','Trip',1.000,650.00,18.00,650.00,58.50,58.50,767.00),
('inv002','Freight Charge (Per Tonne)','9965','Tonne',10.000,1200.00,5.00,12000.00,300.00,300.00,12600.00),
('inv002','Toll & Other Expenses','9965','Trip',2.000,500.00,0.00,1000.00,0.00,0.00,1000.00),
('inv003','Transport Charge (Per Trip)','9965','Trip',2.000,8500.00,5.00,17000.00,425.00,425.00,17850.00),
('inv003','Detention Charge (Per Day)','9965','Day',1.000,2000.00,18.00,2000.00,180.00,180.00,2360.00);

-- ── SETTINGS ──────────────────────────────────────────────
INSERT INTO settings (id,prefix,next_num) VALUES (1,'INV',4)
  ON DUPLICATE KEY UPDATE next_num=IF(next_num<4,4,next_num);
