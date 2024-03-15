<?php
if (!defined('IN_TANDEM')) die();

// TODO: Replace these
define('HCAPTCHA_SITEKEY', '10000000-ffff-ffff-ffff-000000000001');
define('HCAPTCHA_SECRET', '0x0000000000000000000000000000000000000000');

define('HCAPTCHA_ENDPOINT', 'https://hcaptcha.com/siteverify');
define('CONTENT_MAX_LENGTH', 32000);

// TODO: Change path and create DB from schema
define('DB_DSN', 'sqlite:tandem.db');

// TODO: Replace this
define('URL_SALT', 'changeme');

define('DEBUG', TRUE);

// TODO: Replace this
define('LINK_URL_TEMPLATE', 'http://localhost/?%s');

define('SESSION_LIFETIME', 1800);
define('PREVIEW_LOCKOUT', 3);
define('STORE_LOCKOUT', 60);

$LANGUAGES = [
    'default' => 'localize/default.php'
];