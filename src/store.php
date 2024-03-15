<?php
require_once('init.php');

initialize_session();

if (!is_session_valid()) {
    http_response_code(403);
    exit();
}

if (!empty($_SESSION['LAST_STORE']) && is_numeric($_SESSION['LAST_STORE']) && time() - intval($_SESSION['LAST_STORE']) < STORE_LOCKOUT) {
    http_response_code(429);
    if (DEBUG) echo 'STORE LOCKOUT';
    exit();
}

$_SESSION['LAST_STORE'] = time();
session_write_close();

if (empty($_SESSION['CAPTCHA_VALIDATED']) || $_SESSION['CAPTCHA_VALIDATED'] !== TRUE) {
    http_response_code(403);
    return;
}

if (empty($_POST['original']) || empty($_POST['corrected']) || empty($_POST['notes']) || empty($_POST['highlights'])) {
    http_response_code(400);
    return;
}

if (strlen($_POST['original']) > CONTENT_MAX_LENGTH || strlen($_POST['corrected']) > CONTENT_MAX_LENGTH) {
    http_response_code(400);
    exit();
}

if (strlen($_POST['notes']) > CONTENT_MAX_LENGTH || strlen($_POST['highlights']) > CONTENT_MAX_LENGTH) {
    http_response_code(400);
    exit();
}

if (!is_input_probably_okay($_POST['original']) || !is_input_probably_okay($_POST['corrected'])) {
    http_response_code(400);
    exit();
}

$pdo = new PDO(DB_DSN);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$ts = time() - STORE_LOCKOUT;

$stmt = $pdo->prepare("SELECT COUNT(ip) FROM corrections WHERE ip = :ip and ts >= :ts");
$stmt->bindParam(':ip', $_SERVER['REMOTE_ADDR'], PDO::PARAM_STR);
$stmt->bindParam(':ts', $ts, PDO::PARAM_INT);

$stmt->execute();
$count = $stmt->fetchColumn();
$stmt = NULL;

if ($count != 0) {
    if (DEBUG) echo 'DB LOCKOUT';
    http_response_code(429);
    exit();
}

$key = strtolower(random_key());

$pdo->exec("PRAGMA journal_mode=WAL;");
$pdo->exec("PRAGMA synchronous=NORMAL;");
$pdo->exec("PRAGMA cache_size=-32000;");
$pdo->exec("PRAGMA foreign_keys=ON;");

$original = base64_encode($_POST['original']);
$corrected = base64_encode($_POST['corrected']);
$rangy = base64_encode($_POST['highlights']);
$note = base64_encode($_POST['notes']);
$ts = time();

$stmt = $pdo->prepare('INSERT INTO corrections (original, corrected, rangy_data, note_data, ts, ip, key) VALUES (:original, :corrected, :rangy, :note, :ts, :ip, :key)');

$stmt->bindParam(':original', $original, PDO::PARAM_LOB);
$stmt->bindParam(':corrected', $corrected, PDO::PARAM_LOB);
$stmt->bindParam(':rangy', $rangy, PDO::PARAM_LOB);
$stmt->bindParam(':note',  $note, PDO::PARAM_LOB);
$stmt->bindParam(':ts', $ts, PDO::PARAM_INT);
$stmt->bindParam(':ip', $_SERVER['REMOTE_ADDR'], PDO::PARAM_STR);
$stmt->bindParam(':key', $key, PDO::PARAM_STR);

$stmt->execute();

$stmt = null;
$pdo = null;

http_response_code(200);
printf(LINK_URL_TEMPLATE, $key);
