;(function() {
    chorus.presenters.Activity = chorus.presenters.Base.extend({
        timestamp: function() {
            return chorus.helpers.relativeTimestamp(this.model.get("timestamp"));
        },

        headerHtml: function() {
            return new Handlebars.SafeString(t(headerTranslationKey(this), headerParams(this)));
        },

        iconSrc: function() {
            return getActor(this).fetchImageUrl({ size: "icon" });
        },

        iconHref: function() {
            return getActor(this).showUrl();
        },

        iconClass: "profile"
    });

    function getActor(self) {
        return self.model.getModel("actor");
    }

    function headerTranslationKey(self) {
        return "activity.header." + self.model.get("action") + ".without_workspace";
    }

    function headerParams(self) {
        var model = self.model;
        var action = model.get("action");
        var actor = getActor(self);

        switch (action) {
            case "GREENPLUM_INSTANCE_CREATED":
                var instance = model.getModel("greenplumInstance");
                return {
                    actorLink:    modelLink(actor),
                    instanceLink: modelLink(instance)
                };
                break;

            case "HADOOP_INSTANCE_CREATED":
                var instance = model.getModel("hadoopInstance");
                return {
                    actorLink:    modelLink(actor),
                    instanceLink: modelLink(instance)
                };
                break;

            case "GREENPLUM_INSTANCE_CHANGED_OWNER":
                var instance = model.getModel("greenplumInstance");
                var newOwner = model.getModel("newOwner");
                return {
                    actorLink:    modelLink(actor),
                    instanceLink: modelLink(instance),
                    newOwnerLink: modelLink(newOwner)
                };
                break;
        }
    }

    function modelLink(model) {
        return chorus.helpers.linkTo(model.showUrl(), model.name());
    }
})();
