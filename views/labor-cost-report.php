<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 26.05.2017
 * Time: 9:27
 *
 * @var $names array
 * @var $data array
 * @var $empty array
 */
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
