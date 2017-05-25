<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 25.05.2017
 * Time: 22:20
 */
header('Content-Type: text/html; charset=utf-8');
if (!$_GET['domain']) throw new HttpException('Can`t find domain');

$file = __DIR__ . '/../data/' . $_GET['domain'] . '/' . basename($_SERVER['SCRIPT_FILENAME'], '.php') . '.json';

function getData()
{
    global $file;
    return file_exists($file) ? file_get_contents($file) : null;
}

function setData($data)
{
    global $file;
    if (!file_exists(dirname($file))) mkdir(dirname($file), 0777, true);
    return file_put_contents($file, is_array($data) ? serialize($data) : $data);
}

require_once __DIR__ . '/vendor/autoload.php';
