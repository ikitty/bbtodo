$(function () {
    //Backbone.sync = function (a,b,c) {
        //c();
    //}
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
        ,localStorage: new Backbone.LocalStorage("bbTest")
        ,nextId: function () {
            if (!this.length) {
                return 1 ;
            }
            return this.last().get('id') + 1 ;
        }
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
            //set changed to save
            this.model.save({
                name: this.model.get('order')
                ,order: this.model.get('name')
            });

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
            //_.bindAll(this, 'render', 'addItem', 'appendItem');
            this.collection =  new List();
            this.collection.fetch();
            //TODO 隐式传递了单个model参数？
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
            var order = this.collection.nextId();
            this.collection.create({
                id: order
                ,name: 'Alex'
                ,order: 'order is ' + order
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
