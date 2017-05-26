define(['jquery'], function ($) {
    return function (self) {
        var savedData = JSON.parse(sessionStorage.getItem('fieldsTemplate' + self.ns));

        $('.amo_plus-widgets').append('<div class="ap__widgetBlock ap__FieldsTemplate" data-name="fields-template">' +
            '<h3 class="ap__widgetTitle">Подстановки полей</h3>' +
            '<ul class="ap__widgetContent"></ul>' +
            '<span class="ap__toggleButton"></span>' +
            '</div>');

        var $content = $('.ap__FieldsTemplate .ap__widgetContent').on('amo:contentOpen', function () {
            if ($content.text() !== '') return;
            if (!savedData) setTimeout(function () {
                self.crm_post(
                    self.get_settings().url + '/ajax/fields-template.php',
                    {
                        domain: self.system().subdomain,
                        login: AMOCRM.constant('user').login,
                        api_key: AMOCRM.constant('user').api_key
                    },
                    function (result) {
                        sessionStorage.setItem('fieldsTemplate' + self.ns, JSON.stringify(result));
                        savedData = result;
                        renderField();
                    }, 'json');
            }, 300);
            else renderField();
        });

        function renderSelect(name, items, className) {
            var data = '<li>';
            data += '<label>' + name + '</label>';
            data += self.render({ref: '/tmpl/controls/select.twig'}, {
                items: items,
                class_name: className || 'for_select'
            });
            data += '</li>';
            return $(data);
        }

        function renderField() {
            var $type = renderSelect('Сущность', Object.keys(savedData.fields).map(function (row) {
                return {option: row, id: row};
            }), 'type_select');
            $content.append($type);
            setTimeout(function () {
                $(':input:last', $type).val($('li:first', $type).data('value')).change();
            }, 1);

            var $fields = $('<li>').appendTo($content);
            $('.type_select :input').change(function () {
                var data = savedData.fields[this.value];
                $fields.html(renderSelect('Поле', Object.keys(data).map(function (key) {
                    return {option: data[key], id: key};
                }), 'field_select').html());
                setTimeout(function () {
                    $(':input:last', $fields).val($('li:first', $fields).data('value')).change();
                }, 1);
            });

            var $format = renderSelect('Форматирование', Object.keys(savedData.formats).map(function (key) {
                return {option: savedData.formats[key], id: key};
            }), 'format_select');
            $content.append($format);

            var $result = $('<li class="selectField">').appendTo($content);
            $($format).add($fields).on('change', ':input', function () {
                var value = $(':input:last', $fields).val(),
                    format = $(':input:last', $format).val();
                if (format) value += '-' + format;
                value = '{{' + value + '}}';
                var $input = $('<input id="field-template" class="text-input" type="text">').val(value)
                    .on('focus click keyup keydown keypress change', function () {
                        $(this).val(value).select();
                        document.execCommand('copy');
                    });
                $result.html($input);
            })
        }
    }
});