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

        iconClass: function() {
            return "profile";
        }
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
            case "INSTANCE_CREATED":
                var instance = model.getModel("instance");
                return {
                    actorLink: chorus.helpers.linkTo(actor.showUrl(), actor.name()),
                    instanceLink: chorus.helpers.linkTo(instance.showUrl(), instance.name())
                };
                break;

            case "INSTANCE_CHANGED_OWNER":
                var instance = model.getModel("instance");
                var newOwner = model.getModel("newOwner");
                return {
                    actorLink: chorus.helpers.linkTo(actor.showUrl(), actor.name()),
                    instanceLink: chorus.helpers.linkTo(instance.showUrl(), instance.name()),
                    newOwnerLink: chorus.helpers.linkTo(newOwner.showUrl(), newOwner.name())
                };
                break;
        }
    }
})();
