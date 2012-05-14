chorus.views.InstanceList = chorus.views.Base.extend({
    constructorName: "InstanceListView",
    templateName:"instance_list",

    events:{
        "click li":"selectItem"
    },

    makeModel: function() {
        this.greenplumInstances = this.options.greenplumInstances;
        this.hadoopInstances = this.options.hadoopInstances;

        this.bindings.add(this.greenplumInstances, "reset", this.render);
        this.bindings.add(this.hadoopInstances, "reset", this.render);
    },

    setup: function() {
        chorus.PageEvents.subscribe("instance:added", function (id) {
            this.greenplumInstances.fetchAll();
            this.hadoopInstances.fetchAll();
            this.selectedInstanceId = id;
        }, this);
        this.bindings.add(this.greenplumInstances, "remove", this.instanceDestroyed);
        this.bindings.add(this.hadoopInstances, "remove", this.instanceDestroyed);
    },

    instanceDestroyed: function(model) {
        if (this.selectedInstanceId === model.get("id")) delete this.selectedInstanceId;
        this.render();
    },

    postRender: function() {
        if (this.selectedInstanceId) {
            this.$('.instance_provider li[data-instance-id= ' + this.selectedInstanceId + ']').click();
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
        var instance = collection.get(target.data("instanceId"));
        this.selectedInstanceId = instance.get("id");
        chorus.PageEvents.broadcast("instance:selected", instance);
    }
});
