$(function () {
    var Child = Backbone.Model.extend({
        defaults: function () {
            return {
                name: 'Jim'
                ,age: 10
            } ;
        }
    });
    //###实例化模型
    var Jack = new Child({
        name: 'jack'
        ,age: 12
        ,fun: '<b>吃饭</b>'
    });
    //###获取数据
    console.log(Jack.attributes) ;
    console.log(Jack.get('name')) ;
    //escape entities
    console.log(Jack.escape('fun')) ;


    //###修改数据
    Jack.set({
        age: 13
        ,fun: 'football'
    })
    console.log(Jack.attributes) ;

    //事件监听（change event will be fired when model data was be modified）
    Jack.on('change', function (model, value) {
        console.log('model has been changed') ;
    });
    //属性事件监听
    //在监听事件的回调过程中，我们能获取数据的上一个状态（一般情况下，只有在回调中才能获取，但如果设置数据中启用了silent：true选项，则不是这样）
    Jack.on('change:age', function (model, value) {
        console.log('修改前的value是：', model.previous('age')) ;
        console.log('修改后的value是：', model.get('age')) ;
    });
    Jack.set({ age: 14 });
    //从结果可以看到，一个模型发生变化时，带属性的change事件先触发，change事件后触发

    //###删除数据
    Jack.unset('age');
    console.log('unset age', Jack.attributes) ;
    Jack.clear();
    console.log('clear all attr', Jack.attributes) ;


    //###数据验证validate
    //validate在数据发生变化前被调用(仅在save时触发，初始化和set不会触发)
    //如果validate验证通过，则会返回undfined；如果不通过，则会返回其他自定义值，此时会触发invalid事件（理解为只要不返回undefined，就会触发invalid）
    var Book = Backbone.Model.extend({
        validate: function (data) {
            if (data.price < 1) {
                return 'price is unavailable' ;
            }
        }
    });
    var jsBook = new Book( {price: 5});
    jsBook.on('invalid', function () {
        console.log('model data invalid .') ;
    })
    //save自动触发validate
    jsBook.save({price: 0.5});
    //set时需要手动指定validate参数才行
    //jsBook.set({price: 0.5}, {validate:true});
    
    //###数据同步
    //todo test
    var Girl = Backbone.Model.extend({
        urlRoot: 'http://localhost:3002'
        //localStorage: new Backbone.LocalStorage("bbhello")
    });
    var katarina = new Girl({
        name: 'kata'
        ,age: 18
    });
    //katarina.save();
    //katarina.fetch();
    //katarina.destroy();



    var Children = Backbone.Collection.extend({
        model: Child
        ,localStorage: new Backbone.LocalStorage("bbChild")
        //,comperator: age
    });

    var annies = new Children([
        {
            name: 'apple', age: 5
        }
        ,{
            name: 'pear', age: 5
        }
    ]);

});
