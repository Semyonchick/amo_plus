define(['jquery'], function ($) {
    return function (self) {
        self.render_template(
            {
                caption: {
                    class_name: 'amo-plus'
                },
                body: '<div class="amo_plus-widgets"></div>',
                render: ''
            }
        );
    }
});