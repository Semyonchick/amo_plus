<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 23.05.2017
 * Time: 14:30
 */

require_once __DIR__ . '/../core/server.php';

$list = getData();
$list = $list ? unserialize($list) : [];

if (!isset($list[date('Y')])) $list[date('Y')] = [];
$max = (max($list[date('Y')]) ?: 0) + 1;
$list[date('Y')][] = $max;

setData($list);

echo $max;