<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 11.05.2017
 * Time: 15:30
 */

require_once __DIR__ . '/../core/server.php';

if ($_POST['id'] && $_POST['data']) {
    $data = getData();
    $data = $data ? (unserialize($data) ?: []) : [];
    $data[$_POST['id']] = $_POST['data'];

    setData($data);

    echo 'save';
}

if (isset($_GET['report'])) {
    $month = intval($_POST['month']) ?: date('m');
    $year = intval($_POST['year']) ?: date('Y');
    if ($month == 0) {
        $year -= 1;
        $month = 12;
    }
    $time = strtotime("{$month}/01/{$year}");

    try {
        // Создание клиента
        $amo = new \AmoCRM\Client($_GET['domain'], 'sash.l@mail.ru', 'fceaaec07bf17722f6689bc74abe32d2');

        $note = $amo->note;

        $params = [
            'type' => 'lead',
            'if-modified-since' => date('D, d M Y H:i:s', $time),
            'limit_rows' => 500,
        ];
        $list = [];
        while (($result = $note->apiList($params)) &&
            ($list = array_merge_recursive($list, $result)) &&
            count($result) == 500 &&
            end($result)['date_create'] < ($time + 86400 * cal_days_in_month(CAL_GREGORIAN, $month, $year))) {
            $params['limit_offset'] = count($list);
        }

        $idList = [];
        foreach ($list as $row) if ($row['note_type'] == 3 && $month == date('m', $row['date_create'])) {
            $data = json_decode($row['text'], true);
            if (isset($data['STATUS_NEW']) && $data['STATUS_NEW'] == 142)
                $idList[$row['element_id']] = $row['element_id'];
        }

        $db = unserialize(getData());
        $names = $data = $empty = [];
        foreach ($idList as $id) {
            if ($db[$id]) {
                $data[$id] = $db[$id];
                foreach ($data[$id] as $key => $row){
                    if($row['name'] == 'Выбрать') unset($data[$id][$key]);
                    else $names[] = trim($row['name']);
                }
            } else {
                $empty[] = $id;
            }
        }
        $names = array_unique($names);
        ?>
        <table border="1" cellpadding="5">
            <thead>
            <tr>
                <th>№ Сделки</th>
                <td>Расходы</td>
                <? foreach ($names as $name) echo '<td>' . $name . '</td>' ?>
            </tr>
            </thead>
            <? foreach ($data as $key => $row): ?>
                <tr>
                    <th><?= $key ?></th>
                    <td><?= array_sum(array_map(function($row){
                            return $row['price'];
                        }, $row)) ?></td>
                    <? foreach ($names as $name) echo '<td>' . current(array_filter($row, function($row) use ($name){
                                return $row['name'] == $name;
                            }))['price'] . '</td>' ?>
                </tr>
            <? endforeach; ?>
        </table>

        <pre><? print_r($empty)?></pre>


        <?

//        echo json_encode([compact('empty')]);
    } catch (\AmoCRM\Exception $e) {
        printf('Error (%d): %s' . PHP_EOL, $e->getCode(), $e->getMessage());
    }
}