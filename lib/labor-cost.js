define(['jquery'], function ($) {
    return function (self) {
        var fotK = 1,
            wait,
            domain = self.system().subdomain,
            userData = {},
            data = self.render({
                data: '<div class="ap__widgetBlock ap__laborCost" data-name="laborcost-">' +
                '<h3 class="ap__widgetTitle">Трудозатраты</h3>' +
                '<table class="ap__widgetContent" cellspacing="5">' +
                '</table>' +
                '<span class="ap__toggleButton"></span>' +
                '</div>'
            });
        $('.amo_plus-widgets').append(data);

        // следим за пользователями
        $('[name="CFV[151472]"]').each(updateFotK).change(updateFotK);
        $('[name="CFV[151418]"]').change(render);
        $('[name="CFV[441495]"]').keyup(render);
        $(document)
            .on('keyup', '#5705 .js-change-quantity, #6039 .js-change-quantity', function () {
                var catalogId = $(this).parents('.catalog_elements-in_card').attr('id');
                var id = $(this).parents('.catalog-fields__container').data('id');
                if (userData[catalogId] && userData[catalogId][id])
                    userData[catalogId][id].quantity = this.value;
                render();
            })
            .on('click', '.catalog-fields__container--search-res', function () {
                $.getJSON('/ajax/v1/catalog_elements/list/', {
                    catalog_id: $(this).parents('.catalog_elements-in_card').attr('id'),
                    id: [id = $(this).data('value-id')]
                }).done(function (data) {
                    addUserData(data);
                });
            })
            .on('click', '.linked-form__field__more', function () {
                var catalogId = $(this).parents('.catalog_elements-in_card').attr('id');
                var id = $(this).parents('.catalog-fields__container').data('id');
                if (userData[catalogId] && userData[catalogId][id])
                    delete userData[catalogId][id];
                render();
            });

        // Калькулятор трудозатрат
        var dataCatalogList = [5705, 6039];
        $.getJSON('/ajax/v1/links/list/', {
            links: dataCatalogList.map(function (catalogId) {
                return {
                    from: 'leads',
                    to: 'catalog_elements',
                    from_catalog_id: 2,
                    to_catalog_id: catalogId,
                    from_id: AMOCRM.constant('card_id')
                }
            })
        }).done(function (data) {
            var links = data.response.links;
            dataCatalogList.map(function (catalogId) {
                $.getJSON('/ajax/v1/catalog_elements/list/', {
                    catalog_id: catalogId,
                    id: links.filter(function (row) {
                        return row.to_catalog_id === catalogId;
                    }).map(function (row) {
                        return row.to_id;
                    })
                }).done(function (data) {
                    addUserData(data, links);
                });
            });
        });

        function addUserData(data, links) {
            if (!links.length) return;
            data.response.catalog_elements.forEach(function (row) {
                if (!userData[row.catalog_id]) userData[row.catalog_id] = {};
                userData[row.catalog_id][row.id] = {
                    id: row.id,
                    name: row.name,
                    quantity: links ? links.filter(function (link) {
                        return link.to_id === row.id;
                    })[0].quantity : 1
                };
                row.custom_fields.forEach(function (field) {
                    userData[row.catalog_id][row.id][field.code || field.name] = field.values[0].value;
                });
            });

            render();
        }

        function calculate() {
            var result = [],
                tmpPrice = 0,
                total = +$('[name="CFV[441495]"]').val();

            if (!total) return [];

            // ЗП бригадаир
            tmpPrice = Math.ceil(total * fotK * 0.04);
            result.push({
                name: $('[data-value="' + $('[name="CFV[151418]"]').val() + '"] span:first').text(),
                price: tmpPrice
            });
            total -= tmpPrice;

            // ЗП Сдельщина
            if (userData[6039]) {
                tmpPrice = 0;
                Object.keys(userData[6039]).forEach(function (key) {
                    var row = userData[6039][key],
                        price = row.quantity * row.PRICE;
                    total -= price;
                    if (row.SKU) result.push({name: row.SKU, price: price});
                    else tmpPrice += price;
                });
                if (tmpPrice) result.push({name: 'Сдельщина', price: tmpPrice});
            }

            // ЗП Работники
            if (userData[5705]) {
                tmpPrice = 0;
                Object.keys(userData[5705]).forEach(function (key) {
                    var row = userData[5705][key];
                    tmpPrice += row.quantity * +row['Разряд'].replace(',', '.');
                });

                tmpPrice = total * fotK / tmpPrice;
                if (!tmpPrice || tmpPrice < 0) tmpPrice = 0;
                Object.keys(userData[5705]).forEach(function (key) {
                    var row = userData[5705][key];
                    result.push({
                        name: row.name,
                        price: Math.round(row.quantity * +row['Разряд'].replace(',', '.') * tmpPrice)
                    });
                });
            }

            return result;
        }

        function render() {
            var result = calculate();

            $('.ap__laborCost .ap__widgetContent').html(self.render({
                data: '<tr style="color:grey"><th>ФОТ К</th><td>{{fot}}</td></tr>' +
                '{% for row in result %}' +
                '<tr><th>{{row.name}}</th><td>{{row.price}}</td></tr>' +
                '{% endfor %}' +
                '<tr style="color:red"><th>ИТОГО</th><td>{{total}}</td></tr>'
            }, {
                result: result,
                fot: fotK,
                total: result.reduce(function (a, b) {
                    return a + b.price;
                }, 0)
            }));

            if (wait) clearTimeout(wait);
            wait = setTimeout(function () {
                self.crm_post(
                    self.get_settings().url + '/ajax/labor-cost.php?domain=' + domain, {
                        id: AMOCRM.data.current_card.id,
                        data: result
                    });
            }, 1000);
        }

        function updateFotK() {
            var finishDate = $('[name="CFV[151472]"]').val();
            if (finishDate)
                $.get('/private/api/v2/json/notes/list', {type: 'lead', element_id: 6087317}, function (data) {
                    var finishNote = data.response.notes.filter(function (row) {
                        try {
                            return +JSON.parse(row.text).STATUS_NEW === 142;
                        } catch (e) {
                        }
                        return false;
                    }).pop();
                    if (finishNote) {
                        var diffDays = new Date(finishDate.replace(/(\d+)\.(\d+)\.(\d+)/, '$2/$1/$3')).getDate() - new Date(finishNote.date_create).getDate();
                        if (diffDays && diffDays < 0)
                            if (diffDays > -6) {
                                fotK = 0.7;
                            } else if (diffDays > -3) {
                                fotK = 0.8;
                            } else
                                fotK = 0.9;
                        else fotK = 1;

                        render();
                    }
                });
        }
    }
});