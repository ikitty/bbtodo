$(function () {
    //data mode
    //为collection提供数据
    var mTodo = Backbone.Model.extend({
        defaults: function () {
            return {
                title: "empty todo...",
                order: cTodo.nextOrder(),
                done: false
            };
        }
    });

    //数据以及数据的处理
    var cTodoOrg = Backbone.Collection.extend({
        model: mTodo,
        localStorage: new Backbone.LocalStorage("todos-backbone"),

        done: function () {
            return this.where({
                done: true
            });
        },

        remaining: function () {
            return this.where({
                done: false
            });
        },

        nextOrder: function () {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        comparator: 'order'
    });
    //collection可以被model和view调用
    var cTodo = new cTodoOrg;
    // console.log(cTodoOrg) ;
    //console.log(cTodo) ;

    //单个列表项的view
    var TodoView = Backbone.View.extend({
        tagName: "li",
        template: _.template($('#itemTpl').html()),
        events: {
            "click .toggle": "toggleDone",
            "dblclick .view": "edit",
            "click a.destroy": "clear",
            "keypress .edit": "updateOnEnter",
            "blur .edit": "close"
        },

        initialize: function () {
            //如果model层有变化，则调整view层
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('done', this.model.get('done'));
            this.input = this.$('.edit');
            return this;
        },

        toggleDone: function () {
            //this.model.toggle();
            this.model.save({
                'done': !this.model.get('done')
            });
        },

        edit: function () {
            this.$el.addClass("editing");
            this.input.focus();
        },

        close: function () {
            var value = this.input.val();
            if (!value) {
                this.clear();
            } else {
                this.model.save({
                    title: value
                });
                this.$el.removeClass("editing");
            }
        },

        updateOnEnter: function (e) {
            if (e.keyCode == 13) this.close();
        },

        clear: function () {
            this.model.destroy();
        }
    });

    //整个app的view
    var AppView = Backbone.View.extend({
        el: $("#todoapp"),
        statsTemplate: _.template($('#infoTpl').html()),

        events: {
            "keypress #newItem": "createOnEnter",
            "click #clearMarked": "clearCompleted",
            "click #toggleAll": "toggleAllComplete"
        },

        initialize: function () {
            this.input = this.$("#newItem");
            this.allCheckbox = this.$("#toggleAll")[0];

            //这里监听collection(数据)
            // cTodo.fetch会触发add
            this.listenTo(cTodo, 'add', this.addOne);
            this.listenTo(cTodo, 'reset', this.addAll);
            this.listenTo(cTodo, 'all', this.render);

            this.footer = this.$('footer');
            this.main = $('#main');

            cTodo.fetch();
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            var done = cTodo.done().length;
            var remaining = cTodo.remaining().length;

            if (cTodo.length) {
                this.main.show();
                this.footer.show();
                this.footer.html(this.statsTemplate({
                    done: done,
                    remaining: remaining
                }));
            } else {
                this.main.hide();
                this.footer.hide();
            }

            this.allCheckbox.checked = !remaining;
        },

        addOne: function (todo) {
            //初始化view是需要传递model
            var view = new TodoView({
                model: todo
            });
            this.$("#todoList").append(view.render().el);
        },

        // Add all items in the **cTodo** collection at once.
        addAll: function () {
            cTodo.each(this.addOne, this);
        },

        // If you hit return in the main input field, create new **Todo** model,
        // persisting it to *localStorage*.
        createOnEnter: function (e) {
            if (e.keyCode != 13) return;
            if (!this.input.val()) return;

            //collection实例的自带方法
            cTodo.create({
                title: this.input.val()
            });
            this.input.val('');
        },

        // Clear all done todo items, destroying their models.
        clearCompleted: function () {
            _.invoke(cTodo.done(), 'destroy');
            return false;
        },

        toggleAllComplete: function () {
            var done = this.allCheckbox.checked;
            cTodo.each(function (todo) {
                todo.save({
                    'done': done
                });
            });
        }
    });

    var App = new AppView;
});
