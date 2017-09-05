define(['jquery'], function ($) {
    return function (self) {
        if (self.system().area !== 'lcard') return;

        var priceSendTimeout,
            budget = self.get_settings().budget,
            $price = $('#lead_card_budget'),
            $pay = $('[name="CFV[' + budget.pay + ']"]'),
            $total = $('[name="CFV[' + budget.total + ']"]');

        $total.keyup(function () {
            if(parsePrice($total)) showPrice($price, parsePrice($total) - parsePrice($pay))
        }).keyup();
        $pay.keyup(function () {
            if(parsePrice($total)) showPrice($price, parsePrice($total) - parsePrice($pay))
        }).keyup();

        function showPrice($element, price) {
            var newPrice = String(price).replace(/(\d{1,3})(?=((\d{3})*)$)/g, " $1").trim();
            if (parseInt(newPrice) !== parseInt($element.val())){
                $element.val(newPrice).trigger('input');
                /*if (AMOCRM.constant('card_id')) {
                    if (priceSendTimeout) clearTimeout(priceSendTimeout);
                    priceSendTimeout = setTimeout(function () {
                        if (AMOCRM.constant('card_id')) $.post('/private/api/v2/json/leads/set', {
                            request: {
                                leads: {
                                    update: [{
                                        id: AMOCRM.constant('card_id'),
                                        last_modified: new Date().getTime()/1000,
                                        price: newPrice
                                    }]
                                }
                            }
                        });
                    }, 500);
                }*/
            }
        }

        function parsePrice($element) {
            if(!$element.length) return 0;
            return parseInt($element.val().replace(/\s/, '')) || 0;
        }
    }
});