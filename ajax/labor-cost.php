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
    if($_GET['date']) list($_GET['year'], $_GET['month']) = explode('-', $_GET['date']);
    $_GET['month'] = $month = intval($_GET['month']) ?: date('m');
    $_GET['year'] = $year = intval($_GET['year']) ?: date('Y');
    if ($month == 0) {
        $year -= 1;
        $month = 12;
    }
    $time = strtotime("{$month}/01/{$year}");

    try {
        $amo = getAmo();

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
            end($result)['date_create'] < ($time + 86400 * (cal_days_in_month(CAL_GREGORIAN, $month, $year)))) {
            $params['limit_offset'] = count($list);
        }

        $closeDates = $idList = [];
        foreach ($list as $row) if ($row['note_type'] == 3 /*&& $month == date('m', $row['date_create'])*/) {
            $data = json_decode($row['text'], true);
            if (empty($idList[$row['element_id']]) && isset($data['STATUS_NEW']) && in_array($data['STATUS_NEW'], [142, 13945743, 14626600])){
                $idList[$row['element_id']] = $row['element_id'];
                $closesDate[$row['element_id']] = $row['date_create'];
            }
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

        $leads = $amo->lead->apiList(['id' => array_keys($data)]);

        require __DIR__ . '/../views/labor-cost-report.php';
    } catch (\AmoCRM\Exception $e) {
        printf('Error (%d): %s' . PHP_EOL, $e->getCode(), $e->getMessage());
    }
}