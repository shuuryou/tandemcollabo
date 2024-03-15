<?php
define('IN_TANDEM', TRUE);
require_once('config.php');
require_once('vendor/autoload.php');
require_once('functions.php');

load_language();

common_headers();

error_reporting(E_ALL);
set_error_handler('my_error_handler');
set_exception_handler('my_exception_handler');
register_shutdown_function('my_lastchance_handler');

mb_internal_encoding('UTF-8');