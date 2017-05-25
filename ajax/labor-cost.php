<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 11.05.2017
 * Time: 15:30
 */

$file = __DIR__ . '/../data/' . $_GET['domain'] . '/' . basename(__FILE__, '.php') . '.json';

if ($_POST['id'] && $_POST['data']) {
    if (file_exists($file)) $data = file_get_contents($file);
    $data = !empty($data) ? (unserialize($data) ?: []) : [];
    $data[$_POST['id']] = $_POST['data'];

    if (!file_exists(dirname($file))) mkdir(dirname($file), 0777, true);
    file_put_contents($file, serialize($data));

    echo 'save';
}