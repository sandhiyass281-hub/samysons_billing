<?php
// ============================================================
//  LORRY BILLING — PHP API ROUTER
//  Place this file at: api/index.php
//  .htaccess rewrites all /api/* requests here
// ============================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/db.php';

// Parse route from PATH_INFO or REQUEST_URI
$uri    = $_SERVER['REQUEST_URI'] ?? '/';
$uri    = strtok($uri, '?');                     // strip query string
$uri    = preg_replace('#^.*/api#', '', $uri);   // strip /api prefix (works in subfolders too)
$parts  = explode('/', trim($uri, '/'));
$res    = $parts[0] ?? '';                       // e.g. "companies"
$id     = $parts[1] ?? null;                     // e.g. "some-uuid"
$method = $_SERVER['REQUEST_METHOD'];

match ($res) {
    'companies' => handleCompanies($method, $id),
    'clients'   => handleClients($method, $id),
    'products'  => handleProducts($method, $id),
    'invoices'  => handleInvoices($method, $id),
    'fleet'     => handleFleet($method, $id),
    'drivers'   => handleDrivers($method, $id),
    'renewals'  => handleRenewals($method, $id),
    'fuel'      => handleFuel($method, $id),
    'expenses'  => handleExpenses($method, $id),
    'settings'  => handleSettings($method),
    default     => json_out(['error' => 'Unknown endpoint'], 404),
};

// ============================================================
//  COMPANIES
// ============================================================
function handleCompanies(string $m, ?string $id): never {
    $db = getDB();
    if ($m === 'GET') {
        $r = $db->query('SELECT * FROM companies ORDER BY created_at');
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }
    if ($m === 'POST') {
        $b  = body(); $id = uuid();
        $st = $db->prepare('INSERT INTO companies (id,name,gstin,state,scode,addr,phone,email,bank,acno,ifsc,branch,holder) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $st->bind_param('sssssssssssss', $id, $b['name'], $b['gstin'], $b['state'], $b['scode'],
            $b['addr'], $b['phone'], $b['email'], $b['bank'], $b['acno'], $b['ifsc'], $b['branch'], $b['holder']);
        $st->execute();
        json_out(['id' => $id]);
    }
    if ($m === 'PUT') {
        $b  = body();
        $st = $db->prepare('UPDATE companies SET name=?,gstin=?,state=?,scode=?,addr=?,phone=?,email=?,bank=?,acno=?,ifsc=?,branch=?,holder=? WHERE id=?');
        $st->bind_param('sssssssssssss', $b['name'], $b['gstin'], $b['state'], $b['scode'],
            $b['addr'], $b['phone'], $b['email'], $b['bank'], $b['acno'], $b['ifsc'], $b['branch'], $b['holder'], $id);
        $st->execute();
        json_out(['ok' => true]);
    }
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM companies WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  CLIENTS
// ============================================================
function handleClients(string $m, ?string $id): never {
    $db = getDB();
    if ($m === 'GET') {
        $r = $db->query('SELECT * FROM clients ORDER BY name');
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }
    if ($m === 'POST') {
        $b = body(); $id = uuid();
        $st = $db->prepare('INSERT INTO clients (id,name,mobile,gstin,email,addr,state,scode,type) VALUES (?,?,?,?,?,?,?,?,?)');
        $st->bind_param('sssssssss', $id, $b['name'], $b['mobile'], $b['gstin'], $b['email'], $b['addr'], $b['state'], $b['scode'], $b['type']);
        $st->execute();
        json_out(['id' => $id]);
    }
    if ($m === 'PUT') {
        $b = body();
        $st = $db->prepare('UPDATE clients SET name=?,mobile=?,gstin=?,email=?,addr=?,state=?,scode=?,type=? WHERE id=?');
        $st->bind_param('sssssssss', $b['name'], $b['mobile'], $b['gstin'], $b['email'], $b['addr'], $b['state'], $b['scode'], $b['type'], $id);
        $st->execute();
        json_out(['ok' => true]);
    }
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM clients WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  PRODUCTS
// ============================================================
function handleProducts(string $m, ?string $id): never {
    $db = getDB();
    if ($m === 'GET') {
        $r = $db->query('SELECT * FROM products ORDER BY name');
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }
    if ($m === 'POST') {
        $b = body(); $id = uuid();
        $rate = n($b['rate']); $gst = n($b['gst']);
        $st = $db->prepare('INSERT INTO products (id,name,hsn,rate,unit,gst,icon) VALUES (?,?,?,?,?,?,?)');
        $st->bind_param('sssdsds', $id, $b['name'], $b['hsn'], $rate, $b['unit'], $gst, $b['icon']);
        $st->execute();
        json_out(['id' => $id]);
    }
    if ($m === 'PUT') {
        $b = body();
        $rate = n($b['rate']); $gst = n($b['gst']);
        $st = $db->prepare('UPDATE products SET name=?,hsn=?,rate=?,unit=?,gst=?,icon=? WHERE id=?');
        $st->bind_param('ssdsdss', $b['name'], $b['hsn'], $rate, $b['unit'], $gst, $b['icon'], $id);
        $st->execute();
        json_out(['ok' => true]);
    }
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM products WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  FLEET
// ============================================================
function handleFleet(string $m, ?string $id): never {
    $db = getDB();
    if ($m === 'GET') {
        $r = $db->query('SELECT * FROM fleet ORDER BY no');
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }
    if ($m === 'POST') {
        $b = body(); $id = uuid();
        $ins = nd($b['ins']); $fc = nd($b['fc']); $permit = nd($b['permit']);
        $st = $db->prepare('INSERT INTO fleet (id,no,type,model,year,owner,driver,status,ins,fc,permit) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
        $st->bind_param('sssssssssss', $id, $b['no'], $b['type'], $b['model'], $b['year'], $b['owner'], $b['driver'], $b['status'], $ins, $fc, $permit);
        $st->execute();
        json_out(['id' => $id]);
    }
    if ($m === 'PUT') {
        $b = body();
        $ins = nd($b['ins']); $fc = nd($b['fc']); $permit = nd($b['permit']);
        $st = $db->prepare('UPDATE fleet SET no=?,type=?,model=?,year=?,owner=?,driver=?,status=?,ins=?,fc=?,permit=? WHERE id=?');
        $st->bind_param('sssssssssss', $b['no'], $b['type'], $b['model'], $b['year'], $b['owner'], $b['driver'], $b['status'], $ins, $fc, $permit, $id);
        $st->execute();
        json_out(['ok' => true]);
    }
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM fleet WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  DRIVERS
// ============================================================
function handleDrivers(string $m, ?string $id): never {
    $db = getDB();
    if ($m === 'GET') {
        $r = $db->query('SELECT * FROM drivers ORDER BY name');
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }
    if ($m === 'POST') {
        $b = body(); $id = uuid();
        $licexp = nd($b['licexp']);
        $st = $db->prepare('INSERT INTO drivers (id,name,mobile,lic,licexp,aadhar,vehicle,status,addr,emg) VALUES (?,?,?,?,?,?,?,?,?,?)');
        $st->bind_param('ssssssssss', $id, $b['name'], $b['mobile'], $b['lic'], $licexp, $b['aadhar'], $b['vehicle'], $b['status'], $b['addr'], $b['emg']);
        $st->execute();
        json_out(['id' => $id]);
    }
    if ($m === 'PUT') {
        $b = body();
        $licexp = nd($b['licexp']);
        $st = $db->prepare('UPDATE drivers SET name=?,mobile=?,lic=?,licexp=?,aadhar=?,vehicle=?,status=?,addr=?,emg=? WHERE id=?');
        $st->bind_param('ssssssssss', $b['name'], $b['mobile'], $b['lic'], $licexp, $b['aadhar'], $b['vehicle'], $b['status'], $b['addr'], $b['emg'], $id);
        $st->execute();
        json_out(['ok' => true]);
    }
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM drivers WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  RENEWALS
// ============================================================
function handleRenewals(string $m, ?string $id): never {
    $db = getDB();
    if ($m === 'GET') {
        $r = $db->query('SELECT * FROM renewals ORDER BY expiry');
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }
    if ($m === 'POST') {
        $b = body(); $id = uuid();
        $cost = nd($b['cost']); $remind = (int)($b['remind'] ?? 15);
        $st = $db->prepare('INSERT INTO renewals (id,vehicle,type,expiry,remind,cost,notes) VALUES (?,?,?,?,?,?,?)');
        $st->bind_param('sssssss', $id, $b['vehicle'], $b['type'], $b['expiry'], $remind, $cost, $b['notes']);
        $st->execute();
        json_out(['id' => $id]);
    }
    if ($m === 'PUT') {
        $b = body();
        $cost = nd($b['cost']); $remind = (int)($b['remind'] ?? 15);
        $st = $db->prepare('UPDATE renewals SET vehicle=?,type=?,expiry=?,remind=?,cost=?,notes=? WHERE id=?');
        $st->bind_param('sssssss', $b['vehicle'], $b['type'], $b['expiry'], $remind, $cost, $b['notes'], $id);
        $st->execute();
        json_out(['ok' => true]);
    }
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM renewals WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  FUEL
// ============================================================
function handleFuel(string $m, ?string $id): never {
    $db = getDB();
    if ($m === 'GET') {
        $r = $db->query('SELECT * FROM fuel ORDER BY date DESC');
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }
    if ($m === 'POST') {
        $b = body(); $id = uuid();
        $litres = n($b['litres']); $rate = n($b['rate']);
        $total  = $litres * $rate;
        $odo    = ni($b['odo']);
        $st = $db->prepare('INSERT INTO fuel (id,date,vehicle,driver,type,litres,rate,total,odo) VALUES (?,?,?,?,?,?,?,?,?)');
        $st->bind_param('sssssdddi', $id, $b['date'], $b['vehicle'], $b['driver'], $b['type'], $litres, $rate, $total, $odo);
        $st->execute();
        json_out(['id' => $id, 'total' => $total]);
    }
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM fuel WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  EXPENSES
// ============================================================
function handleExpenses(string $m, ?string $id): never {
    $db = getDB();
    if ($m === 'GET') {
        $r = $db->query('SELECT * FROM expenses ORDER BY date DESC');
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }
    if ($m === 'POST') {
        $b = body(); $id = uuid();
        $amount = n($b['amount']);
        $desc   = $b['desc'] ?? $b['description'] ?? '';
        $st = $db->prepare('INSERT INTO expenses (id,date,cat,amount,ref,description,pay) VALUES (?,?,?,?,?,?,?)');
        $st->bind_param('sssdsss', $id, $b['date'], $b['cat'], $amount, $b['ref'], $desc, $b['pay']);
        $st->execute();
        json_out(['id' => $id]);
    }
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM expenses WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  SETTINGS
// ============================================================
function handleSettings(string $m): never {
    $db = getDB();
    if ($m === 'GET') {
        $r   = $db->query('SELECT * FROM settings WHERE id=1');
        $row = $r->fetch_assoc();
        json_out(['prefix' => $row['prefix'], 'nextNum' => (int)$row['next_num']]);
    }
    if ($m === 'PUT') {
        $b = body();
        $nextNum = (int)($b['nextNum'] ?? 1);
        $st = $db->prepare('UPDATE settings SET prefix=?, next_num=? WHERE id=1');
        $st->bind_param('si', $b['prefix'], $nextNum);
        $st->execute();
        json_out(['ok' => true]);
    }
    json_out(['error' => 'Method not allowed'], 405);
}

// ============================================================
//  INVOICES  (most complex — transaction + line items)
// ============================================================
function handleInvoices(string $m, ?string $id): never {
    $db = getDB();

    // GET all (list)
    if ($m === 'GET' && !$id) {
        $r = $db->query(
            'SELECT id, invoice_no, date, cust_name, cust_mobile, vehicle_no,
                    status, grand_total, paid_amt, balance_amt
             FROM invoices ORDER BY date DESC'
        );
        json_out($r->fetch_all(MYSQLI_ASSOC));
    }

    // GET single with items
    if ($m === 'GET' && $id) {
        $st = $db->prepare('SELECT * FROM invoices WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        $inv = $st->get_result()->fetch_assoc();
        if (!$inv) json_out(['error' => 'Not found'], 404);

        $st2 = $db->prepare('SELECT * FROM invoice_items WHERE invoice_id=?');
        $st2->bind_param('s', $id); $st2->execute();
        $rows = $st2->get_result()->fetch_all(MYSQLI_ASSOC);

        // Map DB columns → frontend camelCase
        $inv['sellerSnap'] = [
            'name'   => $inv['seller_name'],  'gstin'  => $inv['seller_gstin'],
            'state'  => $inv['seller_state'],  'scode'  => $inv['seller_scode'],
            'addr'   => $inv['seller_addr'],   'bank'   => $inv['seller_bank'],
            'acno'   => $inv['seller_acno'],   'ifsc'   => $inv['seller_ifsc'],
            'branch' => $inv['seller_branch'], 'holder' => $inv['seller_holder'],
        ];
        $inv['invoiceNo']  = $inv['invoice_no'];
        $inv['custName']   = $inv['cust_name'];  $inv['custMobile'] = $inv['cust_mobile'];
        $inv['custGst']    = $inv['cust_gst'];   $inv['custAddr']   = $inv['cust_addr'];
        $inv['vehicleNo']  = $inv['vehicle_no']; $inv['driverName'] = $inv['driver_name'];
        $inv['gstMode']    = $inv['gst_mode'];   $inv['payMethod']  = $inv['pay_method'];
        $inv['totTaxable'] = (float)$inv['tot_taxable'];
        $inv['totCGST']    = (float)$inv['tot_cgst'];
        $inv['totSGST']    = (float)$inv['tot_sgst'];
        $inv['totalGST']   = (float)$inv['total_gst'];
        $inv['roundOff']   = (float)$inv['round_off'];
        $inv['grandTotal'] = (float)$inv['grand_total'];
        $inv['paidAmt']    = (float)$inv['paid_amt'];
        $inv['balanceAmt'] = (float)$inv['balance_amt'];

        $inv['items'] = array_map(fn($it) => [
            'desc'    => $it['description'], 'hsn'  => $it['hsn'],
            'unit'    => $it['unit'],        'qty'  => (float)$it['qty'],
            'rate'    => (float)$it['rate'], 'gstPct' => (float)$it['gst_pct'],
            'taxable' => (float)$it['taxable'], 'cgst' => (float)$it['cgst'],
            'sgst'    => (float)$it['sgst'], 'total' => (float)$it['total'],
        ], $rows);

        json_out($inv);
    }

    // POST — create invoice + items in a transaction
    if ($m === 'POST') {
        $b  = body();
        $id = uuid();
        $ss = $b['sellerSnap'] ?? [];

        $db->begin_transaction();
        try {
            $st = $db->prepare(
                'INSERT INTO invoices (
                    id, invoice_no, date, seller_id,
                    seller_name, seller_gstin, seller_state, seller_scode, seller_addr,
                    seller_bank, seller_acno, seller_ifsc, seller_branch, seller_holder,
                    cust_name, cust_mobile, cust_gst, cust_addr,
                    vehicle_no, driver_name, gst_mode, pay_method, status, notes,
                    tot_taxable, tot_cgst, tot_sgst, total_gst, round_off,
                    grand_total, paid_amt, balance_amt
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
            );

            $invoiceNo = $b['invoiceNo'];   $date      = $b['date'];
            $sellerId  = $b['sellerId'];
            $sn = $ss['name']??'';   $sg = $ss['gstin']??'';  $sst = $ss['state']??'';
            $ssc = $ss['scode']??''; $sa = $ss['addr']??'';   $sbk = $ss['bank']??'';
            $sac = $ss['acno']??'';  $sif = $ss['ifsc']??'';  $sbr = $ss['branch']??'';
            $sho = $ss['holder']??'';
            $cn = $b['custName'];     $cm = $b['custMobile'];
            $cg = $b['custGst']??''; $ca = $b['custAddr']??'';
            $vn = $b['vehicleNo']??''; $dn = $b['driverName']??'';
            $gm = $b['gstMode']??'exclusive'; $pm = $b['payMethod']??'Cash';
            $st2 = $b['status']??'Unpaid'; $nt = $b['notes']??'';
            $tt = n($b['totTaxable']); $tc = n($b['totCGST']); $ts = n($b['totSGST']);
            $tg = n($b['totalGST']);   $ro = n($b['roundOff']); $gt = n($b['grandTotal']);
            $pa = n($b['paidAmt']);    $ba = n($b['balanceAmt']);

            $st->bind_param(
                'ssssssssssssssssssssssssdddddddd',
                $id, $invoiceNo, $date, $sellerId,
                $sn, $sg, $sst, $ssc, $sa, $sbk, $sac, $sif, $sbr, $sho,
                $cn, $cm, $cg, $ca,
                $vn, $dn, $gm, $pm, $st2, $nt,
                $tt, $tc, $ts, $tg, $ro, $gt, $pa, $ba
            );
            $st->execute();

            // Insert line items
            $sti = $db->prepare(
                'INSERT INTO invoice_items (invoice_id,description,hsn,unit,qty,rate,gst_pct,taxable,cgst,sgst,total)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?)'
            );
            foreach (($b['items'] ?? []) as $it) {
                $desc   = $it['desc'];    $hsn  = $it['hsn']??'';
                $unit   = $it['unit']??'Nos';
                $qty    = n($it['qty']); $rate = n($it['rate']); $gp = n($it['gstPct']);
                $taxable= n($it['taxable']); $cgst = n($it['cgst']); $sgst = n($it['sgst']); $tot = n($it['total']);
                $sti->bind_param('ssssddddddd', $id, $desc, $hsn, $unit, $qty, $rate, $gp, $taxable, $cgst, $sgst, $tot);
                $sti->execute();
            }

            // Increment invoice counter
            $db->query('UPDATE settings SET next_num = next_num + 1 WHERE id=1');

            $db->commit();
            json_out(['id' => $id, 'invoiceNo' => $invoiceNo]);
        } catch (Throwable $e) {
            $db->rollback();
            json_out(['error' => $e->getMessage()], 500);
        }
    }

    // DELETE
    if ($m === 'DELETE') {
        $st = $db->prepare('DELETE FROM invoices WHERE id=?');
        $st->bind_param('s', $id); $st->execute();
        json_out(['ok' => true]);
    }

    json_out(['error' => 'Method not allowed'], 405);
}
