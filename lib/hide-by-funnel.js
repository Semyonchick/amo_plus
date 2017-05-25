define(['jquery'], function ($) {
    return function (self) {
        if (self.system().area !== 'lcard') return;

        var wait,
            savedData = JSON.parse(localStorage.getItem('checked' + self.ns)) || {},
            funnels = AMOCRM.constant('lead_statuses'),
            domain = self.system().subdomain,
            data = self.render({
                data: '<div class="ap__widgetBlock ap__hideByFunnel" data-name="hide-by-funnel">' +
                '<h3 class="ap__widgetTitle">Скрытые поля</h3>' +
                '<ul class="ap__widgetContent">' +
                '{% for funnel in funnels %}' +
                '<li class="ap__funnelSelect" data-funnel="{{funnel.id}}"><label>{{funnel.name}}</label> {{select}}</li>' +
                '{% endfor %}' +
                '<button class="button-input ap__saveButton" type="button">Сохранить</button>' +
                '</ul>' +
                '<span class="ap__toggleButton"></span>' +
                '</div>'
            }, {
                funnels: funnels,
                select: function () {
                    var characters = [];
                    $('.card-entity-form__fields  .linked-form__field__label span').each(function () {
                        var text = $(this).text(),
                            name = $(':input:last', $(this).parent().next()).attr('name');
                        if (text && name)
                            characters.push({option: text, id: name.match(/\[([^\]]+)\]/)[1]});
                    });

                    return self.render({ref: '/tmpl/controls/checkboxes_dropdown.twig'}, {
                        items: characters,
                        class_name: 'multi-checked'
                    });
                }
            });
        if (AMOCRM.constant('user_rights').is_admin){
            $('.amo_plus-widgets').append(data);
            $('.ap__saveButton').click(function () {
                localStorage.setItem('checked' + self.ns, JSON.stringify(savedData));
                if (wait) clearTimeout(wait);
                wait = setTimeout(function () {
                    if (savedData) self.crm_post(
                        self.get_settings().url + '/ajax/hide-by-funnel.php?domain=' + domain,
                        {data: JSON.stringify(savedData), save: true},
                        function (msg) {
                            hideCharacters(msg);

                            AMOCRM.notifications.add_call({
                                text: self.i18n('widget').name + ': Данные по воронкам сохранены',
                                date: Math.ceil(Date.now() / 1000)
                            });
                        }, 'json');
                }, 300);
            });
        }

        // Отмечаем элементы из памяти
        selectItems();
        self.crm_post(self.get_settings().url + '/data/' + domain + '/hide-by-funnel.json',
            {}, function (msg) {
                savedData = msg;
                localStorage.setItem('checked' + self.ns, JSON.stringify(savedData));
                selectItems();
            }, 'json');
        function selectItems() {
            Object.keys(funnels).forEach(function (key) {
                var funnel = funnels[key];
                $('[data-funnel="' + funnel.id + '"] :input').each(function () {
                    this.name = 'data[' + funnel.id + '][]';
                    if (!savedData[funnel.id] || !savedData[funnel.id].length || $.inArray(+this.value, savedData[funnel.id]) !== -1 || $.inArray(this.value, savedData[funnel.id]) !== -1) {
                        $(this).prop('checked', true);
                    } else {
                        $(this).prop('checked', false);
                    }
                }).filter(':last').change();
            });
        }

        // Следим за выбором для показа
        $('.ap__funnelSelect :input').change(function () {
            var checked = {};
            $('.ap__funnelSelect :checked').each(function () {
                var id = $(this).parents('[data-funnel]').data('funnel');
                if (!checked[id]) checked[id] = [];
                checked[id].push(this.value);
            });
            hideCharacters(checked);
        });

        $("[name='lead[PIPELINE_ID]']").change(function () {
            hideCharacters();
        });
        function hideCharacters(data) {
            if (data) savedData = data;
            if (!savedData) return;
            var id = $("[name='lead[PIPELINE_ID]']").val();
            if (savedData[id] && savedData[id].length) {
                $('.card-entity-form__fields  .linked-form__field__label span').each(function () {
                    var text = $(this).text(),
                        name = $(':input:last', $(this).parent().next()).attr('name');
                    if (text && name && $.inArray(name.match(/\[([^\]]+)\]/)[1], savedData[id]) === -1) {
                        $(this).parent().parent().hide()
                    } else {
                        $(this).parent().parent().show()
                    }
                });
            }
        }
    }
});