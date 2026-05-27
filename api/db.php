<?php
// ============================================================
//  DB CONNECTION — lorry_billing
//  Edit these 4 constants to match your server
// ============================================================
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');          // ← change to your MySQL password
define('DB_NAME', 'lorry_billing');

function getDB(): mysqli {
    static $conn = null;
    if ($conn === null) {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if ($conn->connect_error) {
            http_response_code(500);
            die(json_encode(['error' => 'DB connection failed: ' . $conn->connect_error]));
        }
        $conn->set_charset('utf8mb4');
    }
    return $conn;
}

// Generate UUID v4
function uuid(): string {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0,0xffff), mt_rand(0,0xffff),
        mt_rand(0,0xffff),
        mt_rand(0,0x0fff)|0x4000,
        mt_rand(0,0x3fff)|0x8000,
        mt_rand(0,0xffff), mt_rand(0,0xffff), mt_rand(0,0xffff)
    );
}

// Send JSON response
function json_out(mixed $data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Read JSON body
function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Safe string helper
function s(?string $v, string $d = ''): string { return $v ?? $d; }
function n(mixed $v, float $d = 0): float      { return is_numeric($v) ? (float)$v : $d; }
function ni(mixed $v): ?int                     { return is_numeric($v) ? (int)$v : null; }
function nd(mixed $v): ?string                  { return ($v && $v !== '') ? $v : null; }
