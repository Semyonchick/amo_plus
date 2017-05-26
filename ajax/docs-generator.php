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

    $fields = [];
    $helper = [
        'leads' => ['ld', 'Сделки'],
        'contacts' => ['cn', 'Контакты'],
        'companies' => ['cm', 'Компании'],
    ];
    foreach ($helper as $name => $data) {
        foreach ($info['custom_fields'][$name] as $value) {
            $fields[$data[1]][$data[0] . '-' . Inflector::slug(!empty($value['CODE']) ? $value['CODE'] : $value['name'], '_') . '-' . $value['id']] = $value['name'];
            if (!empty($value['enums']) && $value['multiple'] == 'Y') foreach ($value['enums'] as $key => $code)
                $fields[$data[1]][$data[0] . '-' . Inflector::slug(!empty($value['CODE']) ? $value['CODE'] : $value['name'], '_') . '-' . $value['id'] . '|' . $key] = $value['name'] . ' ' . $code;

        }
    }

    $formats = [
        'fio_to_dative' => 'ФИО в именительном',
        'fio_to_genitive' => 'ФИО в родительном',
        'fio_to_initial' => 'ФИО с инициалами',
        'month_to_word' => 'Месяц прописью',
        'number_to_word' => 'Номер прописью',
        'currency_to_word' => 'Сумма пропиьсю',
        'float' => 'Число',
        'date' => 'Дата',
        'phone' => 'Телефон',
    ];
    
    echo json_encode([
        'fields' => $fields,
        'formats' => $formats,
    ]);
} catch (\AmoCRM\Exception $e) {
    printf('Error (%d): %s' . PHP_EOL, $e->getCode(), $e->getMessage());
}