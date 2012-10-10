chorus.views.InstanceList = chorus.views.Base.extend({
    constructorName: "InstanceListView",
    templateName:"instance_list",

    events:{
        "click li":"selectItem"
    },

    makeModel: function() {
        this.greenplumInstances = this.options.greenplumInstances;
        this.hadoopInstances = this.options.hadoopInstances;
        this.gnipInstances = this.options.gnipInstances;

        this.bindings.add(this.greenplumInstances, "change", this.render);
        this.bindings.add(this.hadoopInstances, "change", this.render);
        this.bindings.add(this.gnipInstances, "change", this.render);

        this.bindings.add(this.greenplumInstances, "reset", this.render);
        this.bindings.add(this.hadoopInstances, "reset", this.render);
        this.bindings.add(this.gnipInstances, "reset", this.render);
    },

    setup: function() {
        chorus.PageEvents.subscribe("instance:added", function (instance) {
            this.greenplumInstances.fetchAll();
            this.hadoopInstances.fetchAll();
            this.gnipInstances.fetchAll();
            this.selectedInstance = instance;
        }, this);
        this.bindings.add(this.greenplumInstances, "remove", this.instanceDestroyed);
        this.bindings.add(this.hadoopInstances, "remove", this.instanceDestroyed);
        this.bindings.add(this.gnipInstances, "remove", this.instanceDestroyed);
    },

    instanceDestroyed: function(model) {
        if (this.selectedInstance.get("id") === model.get("id")) delete this.selectedInstance;
        this.render();
    },

    postRender: function() {
        if (this.selectedInstance) {
            this.$('.instance_provider li[data-instance-id=' + this.selectedInstance.get("id") + ']').click();
        } else {
            if(this.greenplumInstances.loaded) {
                this.$('.instance_provider li:first').click();
            }
        }
    },

    context: function() {
        var presenter = new chorus.presenters.InstanceList({
            hadoop: this.hadoopInstances,
            greenplum: this.greenplumInstances,
            gnip: this.gnipInstances
        });
        return presenter.present();
    },

    selectItem:function (e) {
        var target = $(e.currentTarget);
        if (target.hasClass("selected")) {
            return;
        }

        this.$("li").removeClass("selected");
        target.addClass("selected");

        var map = {greenplum: this.greenplumInstances, hadoop: this.hadoopInstances, gnip: this.gnipInstances};
        var collection = map[target.data("type")];

        var instance = collection.get(target.data("instanceId"));
        this.selectedInstance = instance;
        chorus.PageEvents.broadcast("instance:selected", instance);
    }
});
