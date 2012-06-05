chorus.views.InstanceList = chorus.views.Base.extend({
    constructorName: "InstanceListView",
    templateName:"instance_list",

    events:{
        "click li":"selectItem"
    },

    makeModel: function() {
        this.greenplumInstances = this.options.greenplumInstances;
        this.hadoopInstances = this.options.hadoopInstances;

        this.bindings.add(this.greenplumInstances, "change", this.render);
        this.bindings.add(this.hadoopInstances, "change", this.render);
        this.bindings.add(this.greenplumInstances, "reset", this.render);
        this.bindings.add(this.hadoopInstances, "reset", this.render);
    },

    setup: function() {
        chorus.PageEvents.subscribe("instance:added", function (instance) {
            this.greenplumInstances.fetchAll();
            this.hadoopInstances.fetchAll();
            this.selectedInstance = instance;
        }, this);
        this.bindings.add(this.greenplumInstances, "remove", this.instanceDestroyed);
        this.bindings.add(this.hadoopInstances, "remove", this.instanceDestroyed);
    },

    instanceDestroyed: function(model) {
        if (this.selectedInstance.get("id") === model.get("id")) delete this.selectedInstance;
        this.render();
    },

    postRender: function() {
        if (this.selectedInstance) {
            this.$('.instance_provider li[' + this.selectedInstance.dataBinding + '=' + this.selectedInstance.get("id") + ']').click();
        } else {
            this.$('.instance_provider li:first').click();
        }
    },

    context: function() {
        var presenter = new chorus.presenters.InstanceList({ hadoop: this.hadoopInstances, greenplum: this.greenplumInstances });
        return presenter.present();
    },

    selectItem:function (e) {
        var target = $(e.currentTarget);
        if (target.hasClass("selected")) {
            return;
        }

        this.$("li").removeClass("selected");
        target.addClass("selected");

        var collection = (target.data("type") === "hadoop") ? this.hadoopInstances : this.greenplumInstances;
        if(target.data("greenplumInstanceId")) {
            var instance = collection.get(target.data("greenplumInstanceId"))
            this.selectedInstance = instance;
            chorus.PageEvents.broadcast("instance:selected", instance);
        } else {
            var hadoopInstance = collection.get(target.data("hadoopInstanceId"));
            this.selectedInstance = hadoopInstance;
            chorus.PageEvents.broadcast("instance:selected", hadoopInstance);
        }
    }
});
