<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 26.05.2017
 * Time: 9:27
 *
 * @var $names array
 * @var $data array
 * @var $leads array
 * @var $empty array
 */


function userPrice($name, $row)
{
    return array_sum(array_map(function ($row) {
        return $row['price'];
    }, array_filter($row, function ($row) use ($name) {
        return $row['name'] == $name;
    }))) ?: '';
}

function field($id, $fields)
{
    return current(array_filter($fields, function ($row) use ($id) {
        return $row['id'] == $id;
    }))['values'][0]['value'];
}

$headers = array(
        '№ Заказа' => 'string',
        'Планируемый срок сдачи' => 'string',
        'Фактический срок сдачи' => 'string',
        'Планируемый ФОТ' => 'price',
        'Фактический ФОТ' => 'price',
        'ФИО Бригадира' => 'string',
        '% бригадира' => 'price',
    ) + array_combine($names, array_fill(0, count($names), 'price'));

$tableData = [];
foreach ($data as $key => $row):
    $main = current(array_filter($row, function ($row) {
        return $row['type'] == 'main';
    }));
    $lead = current(array_filter($leads, function ($row) use ($key) {
        return $row['id'] == $key;
    }));
    if (!field(549915, $lead['custom_fields']) || strtotime(field(549915, $lead['custom_fields'])) >= $time && strtotime(field(549915, $lead['custom_fields'])) <= ($time + 86400 * cal_days_in_month(CAL_GREGORIAN, $month, $year)))
        $tableData[$key] = array_merge_recursive([
            $lead['name'],
            date('d.m.Y', strtotime(field(151472, $lead['custom_fields']))),
            date('d.m.Y', strtotime(field(549915, $lead['custom_fields']))?:$closesDate[$key]),
            field(441495, $lead['custom_fields']),
            array_sum(array_map(function ($row) {
                return $row['price'];
            }, $row)),
            $main['name'],
            $main['price'],
        ], array_map(function ($name) use ($row) {
            return userPrice($name, $row);
        }, $names));
endforeach;

$footer = [];
foreach (array_values($headers) as $key => $row) {
    $footer[] = $row == 'price' ? array_sum(array_map(function ($row) use ($key) {
        return $row[$key];
    }, $tableData)) : '';
}

if ($_GET['report'] == 'xlsx'):
    $writer = new XLSXWriter();

    $writer->writeSheetHeader('Sheet1', $headers);
    foreach ($tableData as $row)
        $writer->writeSheetRow('Sheet1', $row, ['border' => 'left,right,top,bottom']);
    $writer->writeSheetRow('Sheet1', $footer, ['color' => '#f00']);

    header('Content-disposition: attachment; filename=report' . $month . $year . '.xlsx');
    header('Content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    $writer->writeToStdOut();

else:
?>
    <html>
    <head>
        <link href="../style/table.css" type="text/css" rel="stylesheet"/>
    </head>
    <body>

    <? if ($_GET['report'] == 'print'):?>
        <script>window.onload = function () {
                window.print();
                window.close()
            }</script>
    <? else: ?>
        <div style="float: right">
<!--            <a href="?--><?//= http_build_query(['report' => 'print'] + $_GET) ?><!--" target="_blank">распечатать</a>-->
            <a href="?<?= http_build_query(['report' => 'xlsx'] + $_GET) ?>">скачать .xlsx</a>
        </div>
        <form>
            <? foreach ($_GET as $key => $value): ?>
                <input type="hidden" name="<?= $key ?>" value="<?= $value ?>">
            <? endforeach; ?>
            <input placeholder="YYYY-MM" type="month" name="date"
                   value="<?= $_GET['year'] ?>-<?= substr('0' . $_GET['month'], -2, 2) ?>"
                   onchange="this.form.submit()">
        </form>
    <? endif; ?>

    <div class="table-scroll" style="margin: 0 -2px">
        <table width="100%">
            <thead>
            <tr>
                <? foreach (array_keys($headers) as $row): ?>
                    <th><?= $row ?></th>
                <? endforeach; ?>
            </tr>
            </thead>
            <tbody>
            <? foreach ($tableData as $key => $row): ?>
                <tr>
                    <? foreach ($row as $i=> $value) echo '<td>' . ($i ? $value : '<a href="https://msk2017.amocrm.ru/leads/detail/'.$key.'" target="_blank">' .$value . '</a>' ) . '</td>' ?>
                </tr>
            <? endforeach; ?>
            </tbody>
            <tfoot>
            <tr>
                <? foreach ($footer as $row): ?>
                    <th><?= $row ?></th>
                <? endforeach; ?>
            </tr>
            </tfoot>
        </table>
    </div>
    </body>
    </html>
<? endif ?>