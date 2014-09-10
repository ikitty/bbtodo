$(function () {
    Backbone.sync = function (a,b,c) {
        c();
    }
    var Item = Backbone.Model.extend({
        defaults: function () {
            return {
                name: 'alex'
                ,order: 1
            } ;
        }
    });
    var List = Backbone.Collection.extend({
        model: Item
    });

    var ItemView = Backbone.View.extend({
        tagName: 'p'
        ,events: {
            'click .swap': 'data_swap'
            ,'click .del': 'data_remove'
        }
        ,initialize: function () {
            //_.bindAll(this,  'swap', 'remove');
            //this.model.bind('change', this.render);
            //bind will change this point.
            //so use listenTo instead
            this.listenTo(this.model, 'change', this.ui_render);
            this.listenTo(this.model, 'remove', this.ui_unrender);
        }
        //collect ui operation
        ,ui_render: function () {
            this.$el.html('<b>' + this.model.get('name') + ":" + this.model.get('order') + '  <i class="swap">swap</i>  <i class="del">del</i></b>')
            return this ;
        }
        ,ui_unrender: function () {
            $(this.el).remove();
        }

        //data operation
        ,data_swap:function () {
            this.model.set({
                name: this.model.get('order')
                ,order: this.model.get('name')
            })   
        }
        ,data_remove: function () {
            this.model.destroy();
        }
    });

    var ListView = Backbone.View.extend({
        el: $('body')
        
        ,events: {
            'click #add': 'addItem'
        }
        ,initialize: function () {
            _.bindAll(this, 'render', 'addItem', 'appendItem');
            this.collection =  new List();
            this.listenTo(this.collection, 'add', this.appendItem);

            this.counter = 0 ;
            this.render();
        }

        ,render: function () {
            var self = this;
            this.$el.append('<button id="add">add item</button><section></section>');
            _(this.collection.models).each(function (model) {
                self.appendItem(model);
            }, this);
        }

        ,addItem: function () {
            this.counter++;
            this.collection.add({
                name: 'Alex'
                ,order: 'order is ' + this.counter
            });
        }

        ,appendItem: function (model) {
            var itemView = new ItemView({
                model: model
            });
            this.$el.find('section').append(itemView.ui_render().el);
        }
    });
    var listView = new ListView();
});
