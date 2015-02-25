$(function () {
    //model single data model?
    var Todo = Backbone.Model.extend({
        defaults: function () {
            return {
                title: "empty todo...",
                order: Todos.nextOrder(),
                done: false
            };
        }
    });

    //collection: multiple data? obj ?
    var TodoList = Backbone.Collection.extend({
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

    var Todos = new TodoList;
    // console.debug(Todos)
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

            this.listenTo(Todos, 'add', this.addOne);
            this.listenTo(Todos, 'reset', this.addAll);
            this.listenTo(Todos, 'all', this.render);

            this.footer = this.$('footer');
            this.main = $('#main');

            Todos.fetch();
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function () {
            var done = Todos.done().length;
            var remaining = Todos.remaining().length;

            if (Todos.length) {
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

        // todo是哪里传来的参数
        addOne: function (todo) {
            var view = new TodoView({
                model: todo
            });
            this.$("#todoList").append(view.render().el);
        },

        // Add all items in the **Todos** collection at once.
        addAll: function () {
            Todos.each(this.addOne, this);
        },

        // If you hit return in the main input field, create new **Todo** model,
        // persisting it to *localStorage*.
        createOnEnter: function (e) {
            if (e.keyCode != 13) return;
            if (!this.input.val()) return;

            Todos.create({
                title: this.input.val()
            });
            this.input.val('');
        },

        // Clear all done todo items, destroying their models.
        clearCompleted: function () {
            _.invoke(Todos.done(), 'destroy');
            return false;
        },

        toggleAllComplete: function () {
            var done = this.allCheckbox.checked;
            Todos.each(function (todo) {
                todo.save({
                    'done': done
                });
            });
        }
    });

    var App = new AppView;
});
