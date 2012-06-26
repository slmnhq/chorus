;(function() {
    chorus.presenters.Activity = chorus.presenters.Base.extend({
        headerHtml: function() {
            var string = t(private.headerTranslationKey(this), private.headerParams(this));
            return new Handlebars.SafeString(string);
        },

        timestamp: function() {
            return chorus.helpers.relativeTimestamp(this.model.get("timestamp"));
        },

        iconSrc: function() {
            return this.model.actor().fetchImageUrl({ size: "icon" });
        },

        iconHref: function() {
            return this.model.actor().showUrl();
        },

        iconClass: "profile"
    });

    var private = {

        headerParamOptions: {
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
            },

            USER_ADDED: {
                links: [ "newUser"]
            }
        },

        headerParams: function(self) {
            var model = self.model;
            var action = model.get("action");

            var params = {};
            var options = private.headerParamOptions[action];

            _.each(options.links, function(name) {
                var associatedModel = model[name]();
                params[name + "Link"] = private.modelLink(associatedModel);
            });

            _.each(options.attrs, function(name) {
                params[name] = model.get(name);
            });

            _.each(options.computed, function(name) {
                params[name] = private[name](self);
            });

            return params;
        },

        headerTranslationKey: function(self) {
            return "activity.header." + self.model.get("action") + ".default";
        },

        datasetType: function(self) {
            var type = self.model.dataset().metaType();
            return t("dataset.types." + type);
        },

        modelLink: function(model) {
            return chorus.helpers.linkTo(model.showUrl(), model.name());
        }

    };

})();
