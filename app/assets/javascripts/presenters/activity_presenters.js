;(function() {
    var TYPE_OPTIONS = {
        GREENPLUM_INSTANCE_CHANGED_NAME: {
            links: [ "actor", "greenplumInstance" ],
            strings: [ "newName", "oldName" ]
        },

        HADOOP_INSTANCE_CHANGED_NAME: {
            links: [ "actor", "hadoopInstance" ],
            strings: [ "newName", "oldName" ]
        },

        GREENPLUM_INSTANCE_CREATED: {
            links: [ "actor", "greenplumInstance" ]
        },

        HADOOP_INSTANCE_CREATED: {
            links: [ "actor", "hadoopInstance" ]
        },

        GREENPLUM_INSTANCE_CHANGED_OWNER: {
            links: [ "actor", "greenplumInstance", "newOwner" ]
        },

        WORKFILE_CREATED: {
            links: [ "actor", "workfile", "workspace" ]
        }
    };

    chorus.presenters.Activity = chorus.presenters.Base.extend({
        timestamp: function() {
            return chorus.helpers.relativeTimestamp(this.model.get("timestamp"));
        },

        headerHtml: function() {
            var string = t(headerTranslationKey(this), headerParams(this));
            return new Handlebars.SafeString(string);
        },

        iconSrc: function() {
            return actor(this).fetchImageUrl({ size: "icon" });
        },

        iconHref: function() {
            return actor(this).showUrl();
        },

        iconClass: "profile"
    });

    function headerTranslationKey(self) {
        return "activity.header." + self.model.get("action") + ".without_workspace";
    }

    function headerParams(self) {
        var model = self.model;
        var action = model.get("action");

        var params = {};
        var options = TYPE_OPTIONS[action];

        _.each(options.links, function(name) {
            var associatedModel = model.getModel(name);
            params[name + "Link"] = modelLink(associatedModel);
        });

        _.each(options.strings, function(name) {
            params[name] = model.get(name);
        });

        return params;
    }

    function actor(self) {
        return self.model.getModel("actor");
    }

    function modelLink(model) {
        return chorus.helpers.linkTo(model.showUrl(), model.name());
    }
})();
