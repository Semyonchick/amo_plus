<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 23.05.2017
 * Time: 14:30
 */

use yii\helpers\Inflector;
use yii\helpers\VarDumper;

require_once __DIR__ . '/../core/server.php';

try {
    // Создание клиента
    $amo = getAmo();

    $account = $amo->account;
    $info = $account->apiCurrent();

} catch (\AmoCRM\Exception $e) {
    printf('Error (%d): %s' . PHP_EOL, $e->getCode(), $e->getMessage());
}