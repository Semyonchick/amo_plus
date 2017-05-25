<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 23.05.2017
 * Time: 14:30
 */

$file = __DIR__ . '/../data/' . $_GET['domain'] . '/'.basename(__FILE__, '.php').'.json';

$list = file_exists($file) ? file_get_contents($file) : '';
$list = $list ? unserialize($list) : [];

if (!isset($list[date('Y')])) $list[date('Y')] = [];
$max = (max($list[date('Y')]) ?: 0) + 1;
$list[date('Y')][] = $max;

if (!file_exists(dirname($file))) mkdir(dirname($file), 0777, true);
file_put_contents($file, serialize($list));

echo $max;