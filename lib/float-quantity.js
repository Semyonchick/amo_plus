define(['jquery'], function ($) {
    return function (self) {
        if (self.system().area !== 'lcard') return;

        $(document).ajaxComplete(function (event, xhr, settings) {
            if (settings.url.match(/\/ajax\/v1\/catalog_elements\/list\//)) {
                $('.element').each(addInput);
            }
        });

        $(document).on('click', '.control--suggest--list--item', function () {
            setTimeout(function () {
                $('.element').each(addInput);
            });
        });

        function addInput() {
            var input = $('.catalog-fields__amount-field:last', this);
            if (!input.length || input.prevAll('.virtual-input').length) return;
            var virtualInput = $('<input autocomplete="off">').val(input.val() < 1000 ? input.val() : input.val() / 1000).attr('class', 'catalog-fields__amount-field virtual-input text-input').insertBefore(input).show(),
                tester = input.nextAll('tester:first');
            input.hide();
            virtualInput.on('input', function () {
                this.value = this.value.replace(',', '.').replace(/\.+/, '.').replace(/[^\d\.]/, '');
                if (!(this.value > 0)) this.value = parseFloat(this.value) || '';
                else if (Math.ceil(this.value * 1000) > this.value * 1000) this.value = Math.floor(this.value * 1000) / 1000;

                this.style.width = tester.text(this.value + ' x').css('width');

                input.val(parseFloat(this.value) * 1000).trigger('input');
            }).trigger('input');
        }
    }
});