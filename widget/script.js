define(function () {
    return function () {
        var self = this;

        if (!self.params || !self.params['url'])
            self.set_settings({url: 'https://smartsam.ru/amo_plus'});
        var script = self.get_settings().url + '/app.' + self.system().subdomain + '.js';

        this.callbacks = {
            render: function () {
                require([script], function (data) {
                    data.render(self);
                });
                return true;
            },
            init: function () {
                require([script], function (data) {
                    data.init(self);
                });
                return true;
            },
            bind_actions: function () {
                require([script], function (data) {
                    data.bind_actions(self);
                });
                return true;
            },
            settings: function () {
                require([script], function (data) {
                    data.settings(self);
                });
                return true;
            },
            onSave: function () {
                require([script], function (data) {
                    data.onSave(self);
                });
                return true;
            },
            destroy: function () {
                require([script], function (data) {
                    data.destroy(self);
                });
            },
            contacts: {
                selected: function () {
                    require([script], function (data) {
                        data.contacts.selected(self);
                    });
                }
            },
            leads: {
                selected: function () {
                    require([script], function (data) {
                        data.leads.selected(self);
                    });
                }
            },
            tasks: {
                selected: function () {
                    require([script], function (data) {
                        data.tasks.selected(self);
                    });
                }
            }
        };

        return this;
    };
});
