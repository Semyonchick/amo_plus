<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 11.05.2017
 * Time: 15:30
 */

require_once __DIR__ . '/../core/server.php';

if($_POST['data'] && $_POST['save']){
    setData($_POST['data']);
}

echo getData();