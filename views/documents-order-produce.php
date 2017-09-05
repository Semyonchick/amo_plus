<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 07.06.2017
 * Time: 18:16
 */;

if (!$_GET || !$_GET['id'])
    throw new HttpException('Не переданы данные по сделке');

function getFieldValue($value, $data)
{
    $data = array_filter($data, function ($row) use ($value) {
        return $row['id'] == $value || isset($row['code']) && $row['code'] == $value;
    });
    return $data ? current($data)['values'][0]['value'] : null;
}

try {
    // Создание клиента
    $amo = getAmo();
    $lead = $amo->lead->apiList(['id' => $_GET['id']])[0];
    $company = $amo->company->apiList(['id' => $lead['linked_company_id']])[0];
    $links = $amo->links->apiList(['from' => 'leads', 'from_id' => $lead['id'], 'to']);
    $itemQuantities = [];
    foreach ($links as $row)
        $itemQuantities[$row['to_id']] = $row['quantity'];
    $items = count($itemQuantities) ? $amo->catalog_element->apiList(['id' => array_keys($itemQuantities)]) : [];
} catch (\AmoCRM\Exception $e) {
    printf('Error (%d): %s' . PHP_EOL, $e->getCode(), $e->getMessage());
    die;
}
?>
<html lang="ru-RU">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body {
            margin: 0 auto;
            font-family: OpenSans, sans-serif;
            font-size: 12px;
        }

        table {
            width: 100%;
            font-size: 10px;
        }

        .border-bottom {
            border-bottom: 1px solid black;
        }

        .text-center {
            text-align: center;
        }

        .font-small {
            font-size: 8px;
        }
    </style>
</head>
<body>

<table border="0">
    <tr>
        <td><h3>НАРЯД-ЗАКАЗ НА ПРОИЗВОДСТВО
                №<?= trim(preg_replace('#[^\d\.\/\\-]+#', '', $lead['name']), '-.\/ ') ?></h3></td>
        <td><h3>Дата составления <?= date('d.m.Y') ?></h3></td>
        <td width="30" rowspan="4"></td>
        <td class="text-center"><h3>ПК Метконцепт</h3></td>
    </tr>
    <tr>
        <td colspan="2"><br></td>
        <td rowspan="3" class="text-center">
            <div>УТВЕРЖДАЮ</div>
            <div>Директор</div>
            <table class="text-center">
                <tr>
                    <td class="border-bottom">&nbsp;</td>
                    <td width="5" rowspan="2"></td>
                    <td class="border-bottom">&nbsp;</td>
                </tr>
                <tr>
                    <td class="font-small">(подпись)</td>
                    <td class="font-small">(расшифровка подписи)</td>
                </tr>
            </table>
            <table cellspacing="0" style="margin-top: 10px;text-align: left">
                <tr>
                    <td width="5">«</td>
                    <td width="15%" class="border-bottom"></td>
                    <td width="15">»</td>
                    <td class="border-bottom"></td>
                    <td width="10"></td>
                    <td width="30" class="border-bottom">20</td>
                    <td width="5">г.</td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td colspan="2">Заказчик: <?= $company['name'] ?></td>
    </tr>
    <tr>
        <td colspan="2">Адрес выполненнения заказа: <?= getFieldValue(151390, $lead['custom_fields']) ?></td>
    </tr>
</table>

<h2>Наименование изделий</h2>

<table border="1" cellspacing="0" cellpadding="5" style="table-layout: fixed">
    <tr>
        <th width="10">№</th>
        <th>Наименование</th>
        <th width="42">Артикул</th>
        <th width="42">Размер</th>
        <th width="42">Ед. Изм.</th>
        <th width="42">Кол-во</th>
        <th width="70">Планируемая дата сдачи</th>
        <th width="70">Фактическая дата сдачи</th>
        <th width="70">Подпись приемщика</th>
    </tr>
    <? $i = 1; ?>
    <? foreach ($items as $row) if ($row['catalog_id'] == 5703): ?>
        <tr>
            <td><?= $i++ ?></td>
            <td><?= $row['name'] ?></td>
            <td><?= getFieldValue(492257, $row['custom_fields']) ?></td>
            <td><?= getFieldValue(539153, $row['custom_fields']) ?></td>
            <td><?= getFieldValue('SKU', $row['custom_fields']) ?: getFieldValue(539155, $row['custom_fields']) ?></td>
            <td><?= $itemQuantities[$row['id']] ?></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    <? endif ?>
</table>

<h2>Заказ на ТМЦ</h2>

<table border="1" cellspacing="0" cellpadding="5" style="table-layout: fixed">
    <tr>
        <th width="10">№</th>
        <th>Наименование</th>
        <th width="42">Код</th>
        <th width="42">Размер</th>
        <th width="42">Ед. Изм.</th>
        <th width="42">Кол-во</th>
        <th width="70">Фактический расход</th>
        <th width="70">Подпись кладовщика</th>
        <th width="70">Подпись подотчетного лица</th>
    </tr>
    <? $i = 1; ?>
    <? foreach ($items as $row) if ($row['catalog_id'] == 5715): ?>
        <tr>
            <td><?= $i++ ?></td>
            <td><?= $row['name'] ?></td>
            <td><?= getFieldValue(539165, $row['custom_fields']) ?></td>
            <td><?= getFieldValue(496155, $row['custom_fields']) ?></td>
            <td><?= getFieldValue('SKU', $row['custom_fields']) ?></td>
            <td><?= $itemQuantities[$row['id']] ?></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    <? endif ?>
</table>

<? if (getFieldValue(551845, $lead['custom_fields'])): ?>
    <h4>Комментарии:</h4>
    <p><?= nl2br(getFieldValue(551845, $lead['custom_fields'])) ?></p>
<? endif ?>

<table cellspacing="0" style="margin-top: 20px">
    <tr>
        <td width="20%" rowspan="2">Заказ-наряд составил</td>
        <td class="border-bottom">&nbsp;</td>
        <td width="20" rowspan="2"></td>
        <td class="border-bottom">&nbsp;</td>
        <td width="50" rowspan="2"></td>
        <td width="20%" rowspan="2">Заказ-наряд принял</td>
        <td class="border-bottom">&nbsp;</td>
        <td width="20" rowspan="2"></td>
        <td class="border-bottom">&nbsp;</td>
    </tr>
    <tr class="text-center">
        <td class="font-small text-center">(подпись)</td>
        <td class="font-small text-center">(расшифровка подписи)</td>
        <td class="font-small text-center">(подпись)</td>
        <td class="font-small text-center">(расшифровка подписи)</td>
    </tr>
</table>
</body>
</html>