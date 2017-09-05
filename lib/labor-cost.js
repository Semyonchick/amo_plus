define(['jquery', 'lib/components/base/modal'], function ($, Modal) {
    return function (self) {
        var fotK = 1,
            wait,
            domain = self.system().subdomain,
            userData = {},
            data = self.render({
                data: '<div class="ap__widgetBlock ap__laborCost" data-name="laborcost-">' +
                '<h3 class="ap__widgetTitle">Трудозатраты</h3>' +
                '<table class="ap__widgetContent ap__laborCostTable" cellspacing="5">' +
                '</table>' +
                '<div class="ap__widgetContent" style="text-align: center;margin-top: 10px"><a id="showReport" class="button-input" href="https://smartsam.ru/amo_plus/ajax/labor-cost.php?domain=msk2017&report=1">смотреть отчет</a></div>' +
                '<span class="ap__toggleButton"></span>' +
                '</div>'
            });
        $('.amo_plus-widgets').append(data);

        // показываем отчет по пользователям
        $('#showReport', '.amo_plus-widgets').click(function () {
            var href = this.href;
            modal = new Modal({
                class_name: 'modal-window',
                init: function ($modal_body) {
                    var $this = $(this);
                    $modal_body
                        .trigger('modal:loaded') //запускает отображение модального окна
                        .html('<iframe style="width: 100%;height: 85vh" src="' + href + '"></iframe>')
                        .css({width:'96%'})
                        .trigger('modal:centrify')  //настраивает модальное окно
                        .append('<span class="modal-body__close"><span class="icon icon-modal-close"></span></span>');
                },
                destroy: function () {
                }
            });
            return false;
        });
        updateFotK();

        // следим за пользователями
        $('[name="CFV[151472]"],[name="CFV[549915]"]').change(updateFotK);
        $('[name="CFV[151418]"]').change(render);
        $('[name="CFV[441495]"]').on('input', render);
        $(document)
            .on('input', '#5705 .js-change-quantity, #6039 .js-change-quantity', function () {
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
            if (!links || !links.length) return;
            data.response.catalog_elements.forEach(function (row) {
                var element = links.filter(function (link) {
                    return link.to_id === row.id;
                });
                if(!element.length) return;
                if (!userData[row.catalog_id]) userData[row.catalog_id] = {};
                userData[row.catalog_id][row.id] = {
                    id: row.id,
                    name: row.name,
                    quantity: element.length ? element.pop().quantity || 1 : 1
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

            if($('[name="CFV[151418]"]').val()){
                // ЗП бригадаир
                tmpPrice = Math.ceil(total * fotK * 0.04);
                result.push({
                    name: $('[data-value="' + $('[name="CFV[151418]"]').val() + '"] span:first').text(),
                    price: tmpPrice,
                    type: 'main'
                });
                total -= tmpPrice;
            }


            // ЗП Сдельщина
            if (userData[6039]) {
                tmpPrice = 0;
                Object.keys(userData[6039]).forEach(function (key) {
                    var row = userData[6039][key],
                        price = row.quantity * row.PRICE;
                    total -= price;
                    if (row.SKU) result.push({name: row.SKU, price: price, type: 'do'});
                    else tmpPrice += price;
                });
                if (tmpPrice) result.push({name: 'Сдельщина', price: tmpPrice});
            }

            // ЗП Почасовая
            if (userData[5705]) {
                tmpPrice = 0;
                Object.keys(userData[5705]).forEach(function (key) {
                    var row = userData[5705][key];
                    tmpPrice += row.quantity * +(row['Разряд'] || '1').replace(',', '.');
                });

                tmpPrice = total * fotK / tmpPrice;
                if (!tmpPrice || tmpPrice < 0) tmpPrice = 0;
                Object.keys(userData[5705]).forEach(function (key) {
                    var row = userData[5705][key];
                    result.push({
                        name: row.name,
                        price: Math.round(row.quantity * +(row['Разряд'] || '1').replace(',', '.') * tmpPrice),
                        type: 'time'
                    });
                });
            }

            return result;
        }

        function render() {
            var result = calculate();

            $('.ap__laborCost .ap__laborCostTable').html(self.render({
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
            var finishNote = $('[name="CFV[549915]"]').val();
            if (finishDate) {
                if (!finishNote) {
                    $.get('/private/api/v2/json/notes/list', {type: 'lead', element_id: AMOCRM.constant('card_id')}, function (data) {
                        if (!finishNote) {
                            finishNote = data.response.notes.filter(function (row) {
                                try {
                                    return +JSON.parse(row.text).STATUS_NEW === 14626600 || +JSON.parse(row.text).STATUS_NEW === 13945743 || +JSON.parse(row.text).STATUS_NEW === 142;
                                } catch (e) {
                                }
                                return false;
                            })[0];
                            if(finishNote){
                                finishNote = new Date(finishNote.date_create * 1000).toLocaleDateString();
                                $('[name="CFV[549915]"]').val(finishNote).trigger('input').change();
                            }
                        }
                    });
                } else {
                    if (finishNote) {
                        var diffDays = (new Date(finishDate.replace(/(\d+)\.(\d+)\.(\d+)/, '$2/$1/$3')) - new Date(finishNote.replace(/(\d+)\.(\d+)\.(\d+)/, '$2/$1/$3'))) / (1000 * 24 * 60 * 60);
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
                }
            }
        }
    }
});