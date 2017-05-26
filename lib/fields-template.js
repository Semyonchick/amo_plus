define(['jquery'], function ($) {
    return function (self) {
        var wait,
            savedData = JSON.parse(localStorage.getItem('fieldsTemplate' + self.ns)) || {},
            domain = self.system().subdomain,
            data = self.render({
                data: '<div class="ap__widgetBlock ap__FieldsTemplate" data-name="fields-template">' +
                '<h3 class="ap__widgetTitle">Подстановки полей</h3>' +
                '<ul class="ap__widgetContent">' +
                '</ul>' +
                '<span class="ap__toggleButton"></span>' +
                '</div>'
            });
        $('.amo_plus-widgets').append(data);

        $('.ap__FieldsTemplate .ap__widgetContent').on('amo:contentOpen', function(){
            if (wait) clearTimeout(wait);
            wait = setTimeout(function () {
                self.crm_post(
                    self.get_settings().url + '/ajax/fields-template.php',
                    {
                        domain: self.system().subdomain,
                        login: AMOCRM.constant('user').login,
                        api_key: AMOCRM.constant('user').api_key
                    },
                    function (result) {
                        console.log(result);
                    }, 'json');
            }, 300);
        });
    }
});