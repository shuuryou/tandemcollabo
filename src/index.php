<?php
require_once('init.php');

if (empty($_SERVER['QUERY_STRING'])) {
    $session_id = session_create_id();
    initialize_session($session_id);
    make_session_valid();
    session_write_close();

    $vars = ['session_id' => $session_id];
    render_template('create', $vars);
}

$key = strtolower($_SERVER['QUERY_STRING']);

if ($key == 'legal') render_template('legal');

$pdo = new PDO(DB_DSN);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->prepare("SELECT original, corrected, rangy_data, note_data FROM corrections WHERE key = :key");
$stmt->bindParam(':key', $key, PDO::PARAM_STR);
$stmt->execute();

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    http_response_code(404);
    render_template('404');
}

$original = base64_decode($row['original']);
$corrected = base64_decode($row['corrected']);

$vars = [
    'original' => $original,
    'corrected' => $corrected,
    'rangy_data' => base64_decode($row['rangy_data']),
    'note_data' => base64_decode($row['note_data']),
    'diff' => diff_html($original, $corrected),
];

render_template('view', $vars);

function render_template($name, array $vars = array())
{
    foreach ($vars as $k => $v)
        $$k = $v;

    ob_start();
    require_once(sprintf('template/%s.phtml', $name));
    ob_end_flush();
    exit();
}
