$(function () {
    var Todo = Backbone.Model.extend({
        defaults: function () {
            return {
                title: "empty todo...",
                order: myTodolist.nextOrder(),
                done: false
            };
        }
    });

    var Todolist = Backbone.Collection.extend({
        model: Todo,
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
    var myTodolist = new Todolist;

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
            this.listenTo(this.model, 'destroy', function () {
                this.el.remove();
            });
            //上面的代码可以简化。调用view自身的remove 方法
            //this.listenTo(this.model, 'destroy', this.remove);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.toggleClass('done', this.model.get('done'));
            this.input = this.$('.edit');
            return this;
        },

        toggleDone: function () {
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
            // 默认情况下，fetch会调用set方法（而set方法出触发add事件）。
            // 但设置reest:true选项后，collection将会触发reset事件
            this.listenTo(myTodolist, 'add', this.addOne);
            this.listenTo(myTodolist, 'all', this.render);
            // demo中没有触发reset的场景
            // this.listenTo(myTodolist, 'reset', this.addAll);
            
            this.footer = this.$('footer');
            this.main = $('#main');

            myTodolist.fetch();
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            var done = myTodolist.done().length;
            var remaining = myTodolist.remaining().length;

            if (myTodolist.length) {
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
            var view = new TodoView({
                model: todo
            });
            this.$("#todoList").append(view.render().el);
        },

        addAll: function () {
            myTodolist.each(this.addOne, this);
        },

        createOnEnter: function (e) {
            if (e.keyCode != 13) return;
            if (!this.input.val()) return;

            myTodolist.create({
                title: this.input.val()
            });
            this.input.val('');
        },

        // Clear all done todo items, destroying their models.
        clearCompleted: function () {
            _.invoke(myTodolist.done(), 'destroy');
            return false;
        },

        toggleAllComplete: function () {
            var done = this.allCheckbox.checked;
            myTodolist.each(function (todo) {
                todo.save({
                    'done': done
                });
            });
        }
    });

    var App = new AppView;
});
