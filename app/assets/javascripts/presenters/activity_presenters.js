;(function() {
    var private, TYPE_OPTIONS = {
        GREENPLUM_INSTANCE_CHANGED_NAME: {
            links: [ "actor", "greenplumInstance" ],
            attrs: [ "newName", "oldName" ]
        },

        HADOOP_INSTANCE_CHANGED_NAME: {
            links: [ "actor", "hadoopInstance" ],
            attrs: [ "newName", "oldName" ]
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
        },

        WORKSPACE_ADD_SANDBOX: {
            links: [ "actor", "sandbox_schema", "workspace" ]
        },

        SOURCE_TABLE_CREATED: {
            links: [ "actor", "dataset", "workspace" ],
            computed: [ "datasetType" ]
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

    private = {
        datasetType: function(self) {
            var type = self.model.dataset().metaType();
            return t("dataset.types." + type);
        }
    };


    function headerTranslationKey(self) {
        return "activity.header." + self.model.get("action") + ".default";
    }

    function headerParams(self) {
        var model = self.model;
        var action = model.get("action");

        var params = {};
        var options = TYPE_OPTIONS[action];

        _.each(options.links, function(name) {
            var associatedModel = model[name]();
            params[name + "Link"] = modelLink(associatedModel);
        });

        _.each(options.attrs, function(name) {
            params[name] = model.get(name);
        });

        _.each(options.computed, function(name) {
            params[name] = private[name](self);
        });

        return params;
    }

    function actor(self) {
        return self.model.actor();
    }

    function modelLink(model) {
        return chorus.helpers.linkTo(model.showUrl(), model.name());
    }
})();
