chorus.views.InstanceList = chorus.views.Base.extend({
    constructorName: "InstanceListView",
    templateName:"instance_list",

    events:{
        "click li":"selectItem"
    },

    setup:function () {
        chorus.PageEvents.subscribe("instance:added", function (id) {
            this.collection.fetchAll();
            this.selectedInstanceId = id;
        }, this);
        this.bindings.add(this.collection, "remove", function(model) {
            if (this.selectedInstanceId === model.get("id")) delete this.selectedInstanceId;
            this.render();
        });
    },

    postRender: function() {
        if (this.selectedInstanceId) {
            this.$('.instance_provider li[data-instance-id= ' + this.selectedInstanceId + ']').click();
        } else {
            this.$('.instance_provider li:first').click();
        }
    },

    additionalContext: function(originalContext) {
        var models = _.clone(originalContext.models);
        models.sort(function (a, b) {
            return naturalSort(a.name.toLowerCase(), b.name.toLowerCase());
        });

        return {
            models: models,
            hasHadoop: this.collection.any(function(model) { return model.isHadoop(); }),
            hasGreenplum: this.collection.any(function(model) { return model.isGreenplum(); }),
            hasOther: this.collection.any(function(model) { return !(model.isGreenplum() || model.isHadoop()); })
        }
    },

    collectionModelContext: function(model) {
        return {
            stateUrl: model.stateIconUrl(),
            showUrl: model.showUrl(),
            stateText: _.str.capitalize(model.get("state") || "unknown"),
            providerUrl: model.providerIconUrl(),
            isGreenplum: model.isGreenplum(),
            isHadoop: model.isHadoop(),
            isOther: !(model.isHadoop() || model.isGreenplum())
        }
    },

    selectItem:function (e) {
        var target = $(e.currentTarget);
        if (target.hasClass("selected")) {
            return;
        }

        this.$("li").removeClass("selected");
        target.addClass("selected");
        var instance = this.collection.get(target.data("instanceId"));
        this.selectedInstanceId = instance.get("id");
        chorus.PageEvents.broadcast("instance:selected", instance);
    }
});
