<?php
require_once('init.php');

initialize_session();

if (!is_session_valid())
{
    http_response_code(403);
    exit();
}

unset($_SESSION['CAPTCHA_VALIDATED']);

if (empty($_POST['h-captcha-response'])) {
    http_response_code(400);
    return;
}

$data = array(
    'secret' => HCAPTCHA_SECRET,
    'response' => $_POST['h-captcha-response']
);

$verify = curl_init();
curl_setopt($verify, CURLOPT_URL, HCAPTCHA_ENDPOINT);
curl_setopt($verify, CURLOPT_POST, true);
curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($verify);

$responseData = json_decode($response);

if ($responseData->success) {
    $_SESSION['CAPTCHA_VALIDATED'] = TRUE;
    session_write_close();
    http_response_code(200);
    return;
}

http_response_code(401);
