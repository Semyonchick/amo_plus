define(['jquery'], function($){
    console.log('load');

   return {
       render: function () {
           console.log('render');
       },
       init: function () {
           console.log('init');
       },
       bind_actions: function () {
           console.log('bind');
       },
       settings: function () {
       },
       onSave: function () {
       },
       destroy: function () {
       },
       contacts: {
           selected: function () {
           }
       },
       leads: {
           selected: function () {
           }
       },
       tasks: {
           selected: function () {
           }
       }
   }
});