<?php
if (!defined('IN_TANDEM')) die();

use DiffMatchPatch\DiffMatchPatch;
use DiffMatchPatch\DiffToolkit;

function initialize_session($id = NULL)
{
    ini_set('session.use_cookies', 0);
    ini_set('session.use_only_cookies', 0);
    ini_set('session.use_trans_sid', 0);
    ini_set('session.cache_limiter', '');
    ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
    ini_set('session.cookie_lifetime', SESSION_LIFETIME);

    if ($id === NULL) {
        $headers = getallheaders();
        if (!empty($headers['Session']))
            $id = $headers['Session'];
    }

    if ($id === NULL)
        return FALSE;

    session_id($id);
    session_start();

    if (empty($_SESSION['STARTED']) || !is_numeric($_SESSION['STARTED']) || time() - intval($_SESSION['STARTED']) > SESSION_LIFETIME)
        $_SESSION = ['STARTED' => time()];

    return TRUE;
}

function make_session_valid()
{
    $_SESSION['VALID'] = TRUE;
}

function is_session_valid()
{
    return !empty($_SESSION['VALID'] && $_SESSION['VALID']) === TRUE;
}

function common_headers()
{
    header('X-Content-Type-Options: nosniff');
    header('X-XSS-Protection: 1; mode=block');
    header('X-Frame-Options: DENY');
}

function load_language()
{
    global $LANGUAGES;

    if (empty($_SERVER['HTTP_ACCEPT_LANGUAGE']))
        goto default_lang;

    $langs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);

    foreach ($langs as $lang) {
        $lang = strtolower(substr($lang, 0, 5));

        if (array_key_exists($lang, $LANGUAGES)) {
            require_once($LANGUAGES[$lang]);
            return;
        }

        $generalLang = strtolower(substr($lang, 0, 2));

        if (array_key_exists($generalLang, $LANGUAGES)) {
            require_once($LANGUAGES[$generalLang]);
            return;
        }
    }

    default_lang:
    if (!isset($LANGUAGES['default']))
        throw new Exception('No default language file is defined.');

    require_once($LANGUAGES['default']);
}

function is_input_probably_okay($text)
{
    $pattern = '/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/u';
    $ret = preg_match($pattern, $text);
    return $ret === 0;
}

function diff_html($original, $corrected)
{
    $diffLineMode = function ($text1, $text2) {
        $dmp = new DiffMatchPatch();
        $tk = new DiffToolkit();
        list($chars1, $chars2, $lineArray) = $tk->linesToChars($text1, $text2, TRUE);
        $diffs = $dmp->diff_main($chars1, $chars2, FALSE);
        $tk->charsToLines($diffs, $lineArray);
        return $diffs;
    };

    $dmp = new DiffMatchPatch();
    $diffs = $diffLineMode($original, $corrected);

    return $dmp->diff_prettyHtml($diffs);
}

function random_key()
{
    $hash = hash('sha256', time() . random_int(PHP_INT_MIN, PHP_INT_MAX) . URL_SALT);
    $startPos = random_int(0, 56);
    $randomPart = substr($hash, $startPos, 8);
    return $randomPart;
}

function CacheBuster($file)
{
    $file = dirname(__FILE__) . DIRECTORY_SEPARATOR . $file;
    $dir = dirname(__FILE__) . DIRECTORY_SEPARATOR;
    $file = realpath($file);

    if (strpos($file, $dir, 0) !== 0)
    throw new Exception('Path traversal attack detected.');

    echo filemtime($file);
}

function __($constant)
{
    global $HTML_LOCALIZE;

    if (substr($HTML_LOCALIZE[$constant], 0, 1) == '@') {
        $file = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'localize' . DIRECTORY_SEPARATOR . substr($HTML_LOCALIZE[$constant], 1);
        $dir = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'localize' . DIRECTORY_SEPARATOR;
        $file = realpath($file);

        if (strpos($file, $dir, 0) !== 0)
            throw new Exception('Path traversal attack detected.');

        echo file_get_contents($file);
        return;
    }

    echo nl2br(htmlspecialchars($HTML_LOCALIZE[$constant]));
}

function my_error_handler($severity, $message, $file, $line)
{
    if (error_reporting() === 0)
        return FALSE;

    throw new ErrorException($message, 0, $severity, $file, $line);
}

function my_exception_handler($e)
{
    while (ob_get_level() !== 0)
        ob_end_clean();

    error_log($e->getMessage());

    http_response_code(500);
    echo 'Internal Server Error';

    if (DEBUG)
        printf('<pre>%s</pre>', htmlspecialchars(var_export($e, TRUE)));

    die();
}

function my_lastchance_handler()
{
    $error = error_get_last();
    if ($error === null)
        return;

    $errno   = $error["type"];
    $errfile = $error["file"];
    $errline = $error["line"];
    $errstr  = $error["message"];

    $exception = new ErrorException($errstr, 0, $errno, $errfile, $errline);

    call_user_func('my_exception_handler', $exception);
}
