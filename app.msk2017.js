define(['jquery'], function ($) {

    return {
        render: function (self) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = self.get_settings().url + '/style/app.css';
            document.getElementsByTagName("head")[0].appendChild(link);

            require([
                self.get_settings().url + '/lib/_render.js'
            ], function () {
                for (var i = 0; i < arguments.length; i++) arguments[i](self);
            });
        },
        init: function (self) {
            //Константы для виджетов
            self.set_settings({budget: {pay: 154744, total: 537187}});

            //Подключаем все виджеты
            require([
                self.get_settings().url + '/lib/auto-budget.js',
                self.get_settings().url + '/lib/auto-name.js',
                self.get_settings().url + '/lib/labor-cost.js',
                self.get_settings().url + '/lib/fields-template.js',
                self.get_settings().url + '/lib/hide-by-funnel.js',
                self.get_settings().url + '/lib/documents.js'
            ], function () {
                for (var i = 0; i < arguments.length; i++) arguments[i](self);

                //Стандартные функции
                $('.ap__widgetBlock').each(function () {
                    var $widget = $(this),
                        $content = $('.ap__widgetContent', $widget),
                        $button = $('.ap__toggleButton', $widget).addClass('open');

                    if (!+localStorage.getItem($widget.data('name'))) {
                        $content.hide();
                        $button.removeClass('open');
                    }
                    $('.ap__toggleButton, .ap__widgetTitle', $widget).click(function () {
                        $content.toggle();
                        $button.toggleClass('open');
                        localStorage.setItem($widget.data('name'), $button.hasClass('open') ? 1 : 0);
                        if($button.hasClass('open')) $content.trigger('amo:contentOpen');
                    });
                    if($button.hasClass('open')) $content.trigger('amo:contentOpen');
                });
            });
        },
        bind_actions: function (self) {
        },
        settings: function (self) {
        },
        onSave: function (self) {
        },
        destroy: function () {
        },
        contacts: {
            selected: function () {
            }
        },
        leads: {
            selected: function () {
            }
        },
        tasks: {
            selected: function () {
            }
        }
    }
});