define(['jquery'], function ($) {
    return function (self) {
        if (self.system().area !== 'lcard') return;

        var priceSendTimeout,
            budget = self.get_settings().budget,
            $price = $('#lead_card_budget'),
            $pay = $('[name="CFV[' + budget.pay + ']"]'),
            $total = $('[name="CFV[' + budget.total + ']"]'),
            total = parsePrice($total),
            pay = parsePrice($pay),
            price = parsePrice($price);

        $total.add($pay).keyup(function () {
            showPrice($price, parsePrice($total) - parsePrice($pay))
        }).keyup();

        function showPrice($element, price) {
            var newPrice = String(price).replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1").trim();
            if (newPrice !== $element.val()) {
                $element.val(newPrice);
                if (priceSendTimeout) clearTimeout(priceSendTimeout);
                priceSendTimeout = setTimeout(function () {
                    $.post('/ajax/leads/detail/', {
                        ID: AMOCRM.constant('card_id'),
                        lead: {
                            NAME: AMOCRM.constant('card_element').name,
                            PRICE: newPrice
                        }
                    });
                }, 500);
            }
        }

        function parsePrice($element) {
            if(!$element.length) return 0;
            return parseInt($element.val().replace(/\s/, '')) || 0;
        }
    }
});