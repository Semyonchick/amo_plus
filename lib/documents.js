define(['jquery', 'lib/components/base/modal'], function ($, Modal) {
    return function (self) {
        var savedData = JSON.parse(sessionStorage.getItem('fieldsTemplate' + self.ns)),
            href = self.get_settings().url + '/ajax/documents.php?domain=' + self.system().subdomain + '&document=order-produce&id=' + AMOCRM.data.current_card.id;

        $('.amo_plus-widgets')
            .append('<div class="ap__widgetBlock ap__FieldsTemplate" data-name="fields-template">' +
                '<h3 class="ap__widgetTitle">Документы</h3>' +
                '<ul class="ap__widgetContent">' +
                '<li>' +
                '<a href="' + href + '&pdf=1" class="file-icon file-icon__pdf" target="_blank" style="float: right;color: white;font-size: 10px;">pdf</a>' +
                '<a href="' + href + '" class="in-modal">Заказ на производство</a> ' +
                '</li>' +
                '</ul>' +
                '<span class="ap__toggleButton"></span>' +
                '</div>')
            .on('click', '.ap__widgetContent .in-modal', function () {
                var type = this.dataset.type,
                    href = this.href,
                    modal = new Modal({
                        class_name: 'modal-window',
                        init: function ($modal_body) {
                            var $this = $(this);
                            $modal_body
                                .trigger('modal:loaded') //запускает отображение модального окна
                                .html('<iframe style="width: 100%;height: 85vh" src="' + href + '"></iframe>')
                                .css({width: '96%', maxWidth: 800})
                                .trigger('modal:centrify')  //настраивает модальное окно
                                .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
                        },
                        destroy: function () {
                        }
                    });
                return false;
            });
    }
});