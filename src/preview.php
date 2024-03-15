<?php
require_once('init.php');

initialize_session();

if (!is_session_valid())
{
    http_response_code(403);
    exit();
}

if (!empty($_SESSION['LAST_PREVIEW']) && is_numeric($_SESSION['LAST_PREVIEW']) && time() - intval($_SESSION['LAST_PREVIEW']) < PREVIEW_LOCKOUT)
{
    if (DEBUG) echo 'PREVIEW LOCKOUT';
    http_response_code(429);
    exit();
}

$_SESSION['LAST_PREVIEW'] = time();
session_write_close();

if (empty($_POST['original']) && empty($_POST['corrected']))
{
    http_response_code(400);
    if (DEBUG) echo 'INPUT MISSING';
    exit();
}

if (strlen($_POST['original']) > CONTENT_MAX_LENGTH || strlen($_POST['corrected']) > CONTENT_MAX_LENGTH) {
    http_response_code(400);
    if (DEBUG) echo 'INPUT TOO LONG';
    exit();
}

if (!is_input_probably_okay($_POST['original']))
{
    http_response_code(400);
    if (DEBUG) echo 'ORIGINAL INPUT NOT OK';
    exit();
}

if (!is_input_probably_okay($_POST['corrected']))
{
    http_response_code(400);
    if (DEBUG) echo 'CORRECTED INPUT NOT OK';
    exit();
}

echo diff_html($_POST['original'], $_POST['corrected']);