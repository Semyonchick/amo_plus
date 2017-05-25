define(['jquery'], function ($) {
    return function (self) {
        if (self.system().area === 'lcard' && AMOCRM.data.current_card.id === 0) {
            self.crm_post(self.get_settings().url + '/ajax/auto-name.php?domain=' + self.system().subdomain,
                {}, function (data) {
                    $('#person_name').val(data);
                });
        }
    }
});