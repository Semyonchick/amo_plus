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
    return current(array_filter($row, function ($row) use ($name) {
        return $row['name'] == $name;
    }))['price'];
}

function field($id, $fields)
{
    return current(array_filter($fields, function ($row) use ($id) {
        return $row['id'] == $id;
    }))['values'][0]['value'];
}

$headers = array(
        '№ Заказа' => 'string',
        'Планируемый срок сдачи' => 'DD.MM.YYYY',
        'Фактический срок сдачи' => 'DD.MM.YYYY',
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
    $tableData[] = array_merge_recursive([
        $lead['name'],
        date('d.m.Y', strtotime(field(151472, $lead['custom_fields']))),
        date('d.m.Y', $lead['date_close']),
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

    <div style="float: right">
        <a href="?<?= http_build_query(['report' => 'xlsx'] + $_GET) ?>">скачать .xlsx</a>
    </div>

    <form method="post">
        <input placeholder="YYYY-MM" type="month" name="date"
               value="<?= $_POST['year'] ?>-<?= substr('0' . $_POST['month'], -2, 2) ?>" onchange="this.form.submit()">
    </form>

    <div style="overflow-x: auto;margin: 0 -2px">
        <table>
            <thead>
            <tr>
                <? foreach (array_keys($headers) as $row): ?>
                    <th><?= $row ?></th>
                <? endforeach; ?>
            </tr>
            </thead>
            <tbody>
            <? foreach ($tableData as $row): ?>
                <tr>
                    <? foreach ($row as $value) echo '<td>' . $value . '</td>' ?>
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