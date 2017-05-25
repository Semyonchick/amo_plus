<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 11.05.2017
 * Time: 15:30
 */

if($_POST['data'])
    file_put_contents(__DIR__ . '/data.json', $_POST['data']);

echo file_get_contents(__DIR__ . '/data.json');