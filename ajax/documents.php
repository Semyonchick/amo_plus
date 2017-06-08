<?php
/**
 * Created by PhpStorm.
 * User: semyonchick
 * Date: 23.05.2017
 * Time: 14:30
 */

use Dompdf\Dompdf;

require_once __DIR__ . '/../core/server.php';

if ($_GET['pdf']) {
    ob_start();
}
require __DIR__ . '/../views/documents-' . $_GET['document'] . '.php';

if ($_GET['pdf']) {
    $html = ob_get_clean();

//    var_dump($page);die;
    $html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');


    $mpdf = new mPDF();
    $mpdf->WriteHTML($html);
    $mpdf->Output("{$_GET['document']}-{$_GET['id']}.pdf", 'I');

//    $dompdf = new Dompdf();
//    $dompdf->loadHtml($html, 'UTF-8');
//    $dompdf->setPaper('A4');
//    $dompdf->render();
//    echo $html;
//    $dompdf->stream($_GET['document'] . '-' . $_GET['id'] . ".pdf", array("Attachment" => false));
}
