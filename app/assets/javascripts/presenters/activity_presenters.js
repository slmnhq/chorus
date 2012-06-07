(function() {
    chorus.presenters.Activity = chorus.presenters.Base.extend({
        present: function(model, options) {
            this.options = options;

            this.model = model
            this.author = model.author();
            this.workspace = model.workspace();
            this.workfile = model.workfile();
            this.noteObject = model.noteworthy();
            this.activityType = model.get("type")

            this.presenter = this.defaultPresenter(this.model)
            this.extensions = this[this.activityType] && this[this.activityType](model)
            _.extend(this.presenter, this.extensions)
            this.presenter.header = _.extend(this.defaultHeader(), this.presenter.header) //presenter.header includes extensions.header
            this.presenter.headerHtml = new Handlebars.SafeString(this.headerHtml());
            this.presenter.isNotification = options.isNotification;
            this.presenter.isReadOnly = options.isReadOnly || options.isNotification;

            this.presenter._impl = this;

            return this.presenter
        },

        defaultPresenter: function(model) {
            var entityTitles = {
                "DEFAULT": t("comments.title.ACTIVITY"),
                "NOTE": t("comments.title.NOTE")
            };

            var activityTypeToEntityType = {
                "NOTE": "comment",
                "NOTE_COMMENT": "comment",
                "INSIGHT_CREATED": "comment",
                "RECEIVE_NOTE": "comment"
            }
            var entityType = activityTypeToEntityType[this.activityType] || "activitystream";

            var obj = {
                body: model.get("text"),
                entityTitle: entityTitles[this.activityType] || entityTitles["DEFAULT"],
                entityType: entityType,
                objectName: "don't know object name for activity type: " + this.activityType,
                objectUrl: "/NEED/OBJECT/URL/FOR/TYPE/" + this.activityType,
                workspaceName: this.workspace ? this.workspace.get("name") : "no workspace name for activity type: " + this.activityType,
                workspaceUrl: this.workspace ? this.workspace.showUrl() : "no workspace URL for activity type: " + this.activityType,
                iconClass: 'profile',
                promoterLink: model.get("promotionActioner") ? chorus.helpers.userProfileLink(new chorus.models.User(model.get("promotionActioner"))) : null,
                promotionTimestamp: model.get("promotionTime") ? chorus.helpers.relativeTimestamp(model.get("promotionTime")) : null,
                isNote: model.isNote(),
                isUserGenerated: model.isUserGenerated()
            };

            if (this.author) {
                obj.iconSrc = this.author.imageUrl();
                obj.iconHref = this.author.showUrl();
                obj.isOwner = this.author.id == chorus.session.user().id || (this.workspace && this.workspace.currentUserIsOwner());
            }

            return obj;
        },

        defaultHeader: function() {
            function objectType(object) {
                if (object instanceof chorus.models.Instance) {
                    return t("instances.title_lower");
                } else if (object instanceof chorus.models.Workfile) {
                    return t("workfiles.title_lower")
                } else if (object instanceof chorus.models.Workspace) {
                    return t("workspaces.title_lower")
                } else if (object instanceof chorus.models.Dataset) {
                    return t("dataset.title_lower")
                } else if (object instanceof chorus.models.DatabaseObject) {
                    return t("database_object." + object.get("objectType"));
                } else if (object instanceof chorus.models.HdfsEntry) {
                    return t("hdfs.file_lower");
                }
            }

            var header = {
                type: this.model.get("type"),
                objectLink: chorus.helpers.linkTo(this.presenter.objectUrl, this.presenter.objectName, {'class': 'object_link'}).toString(),
                workspaceLink: chorus.helpers.linkTo(this.presenter.workspaceUrl, this.presenter.workspaceName).toString()
            }

            if (this.author) {
                header.authorLink = chorus.helpers.linkTo(this.author.showUrl(), this.author.displayName(), { 'class': "author" }).toString()
            }

            if (this.noteObject) {
                header.objectType = objectType(this.noteObject)
            }

            if (this.presenter.versionName) {
                header.versionLink = chorus.helpers.linkTo(this.presenter.versionUrl, this.presenter.versionName).toString()
            }

            if (this.presenter.tableName && this.presenter.tableUrl) {
                header.tableLink = chorus.helpers.linkTo(this.presenter.tableUrl, this.presenter.tableName).toString();
            }

            if (this.presenter.importType) {
                header.importType = this.presenter.importType;
                header.objectType = this.presenter.objectType;
            }

            if (this.presenter.importSourceName) {
                header.importSourceLink = this.presenter.importSourceUrl ? chorus.helpers.linkTo(this.presenter.importSourceUrl, this.presenter.importSourceName).toString()
                    : this.presenter.importSourceName;
            }

            if (this.presenter.hdfsName) {
                header.hdfsLink = chorus.helpers.linkTo(this.presenter.hdfsUrl, this.presenter.hdfsName).toString();
            }

            if (this.presenter.chorusViewName) {
                header.chorusViewLink = chorus.helpers.linkTo(this.presenter.chorusViewUrl, this.presenter.chorusViewName).toString();
            }

            if (this.presenter.instanceAddress){
                header.instanceAddress = this.presenter.instanceAddress
            }

            if (this.presenter.objectName){
                header.objectName = this.presenter.objectName
            }

            if (this.presenter.sourceType) {
                header.sourceType = t('activity_stream.chorus_view.type.' + this.presenter.sourceType);
            }

            if (this.presenter.sourceName && this.presenter.sourceUrl) {
                header.sourceLink = chorus.helpers.linkTo(this.presenter.sourceUrl, this.presenter.sourceName).toString();
            }

            return header;
        },

        headerHtml: function() {
            return t(this.headerTranslationKey(), this.presenter.header)
        },

        defaultStyle: function(type) {
            var isSandboxMessage  = (type === "WORKSPACE_ADD_SANDBOX");
            var isSameAsWorkspace = (this.workspace !== this.noteObject);

            if (this.workspace && (isSandboxMessage || isSameAsWorkspace)) {
                return 'default';
            } else {
                return 'without_workspace';
            }
        },

        headerTranslationKey: function() {
            var prefix  = 'activity_stream.header.html';
            var type    = getType(this.model, prefix);
            var mainKey = [prefix, type].join(".");
            if (this.options.isNotification) mainKey += ".notification";
            var possibleStyles = _.compact(_.flatten([this.options.displayStyle, this.defaultStyle(type)]));

            var key, n = possibleStyles.length;
            for (var i = 0; i < n; i++) {
                key = [mainKey, possibleStyles[i]].join(".");
                if (I18n.lookup(key)) return key;
            }

            return mainKey;
        },

        NOTE: showNote,
        INSIGHT_CREATED: showNote,
        RECEIVE_NOTE: showNote,
        NOTE_COMMENT: showNote,

        IMPORT_SUCCESS: function(model) {
            var ctx = importIsObject(model);
            ctx.iconClass = ''
            ctx.iconSrc = "/images/import_icon.png";
            return ctx;
        },

        IMPORT_FAILED: function(model) {
            var ctx = importIsObject(model);
            ctx.iconClass = '';
            ctx.iconSrc = "/images/med_red_alert.png";
            ctx.iconHref = "javascript:void()";

            ctx.detailsLink = chorus.helpers.linkTo('#', t("activity_stream.view_error_details"), {
                "class": 'alert',
                "data-alert": "ImportFailed",
                "data-task-id": model.get("task").id
            });

            return ctx;
        },

        IMPORT_CREATED: importIsObject,
        IMPORT_UPDATED: importIsObject,

        WORKSPACE_CREATED: workspaceIsObject,
        WORKSPACE_MAKE_PRIVATE: workspaceIsObject,
        WORKSPACE_MAKE_PUBLIC: workspaceIsObject,
        WORKSPACE_ARCHIVED: workspaceIsObject,
        WORKSPACE_UNARCHIVED: workspaceIsObject,

        WORKSPACE_ADD_TABLE: function(model) {
            var datasetAdded = model.databaseObject().asDataset();
            return {
                objectName: datasetAdded.get("objectName"),
                objectUrl: datasetAdded.showUrl(),
                iconSrc: datasetAdded.iconUrl(),
                iconClass: ''
            }
        },

        WORKSPACE_ADD_HDFS_AS_EXT_TABLE: function(model) {
            var datasetAdded = model.databaseObject().asDataset();
            var hdfs = model.hdfs();
            return {
                objectName: datasetAdded.get("objectName"),
                objectUrl: datasetAdded.showUrl(),
                hdfsName: hdfs.get("name"),
                hdfsUrl: hdfs.showUrl()
            }
        },

        WORKSPACE_ADD_HDFS_DIRECTORY_AS_EXT_TABLE: function(model) {
            var datasetAdded = model.databaseObject().asDataset();
            var hdfs = model.hdfs();
            return {
                objectName: datasetAdded.get("objectName"),
                objectUrl: datasetAdded.showUrl(),
                hdfsUrl: hdfs.showUrl(),
                hdfsName: hdfs.name()
            }
        },

        WORKSPACE_ADD_HDFS_PATTERN_AS_EXT_TABLE: function(model) {
            var datasetAdded = model.databaseObject().asDataset();
            var hdfs = model.hdfs();
            var parentDir = hdfs.parent();
            return {
                objectName: datasetAdded.get("objectName"),
                objectUrl: datasetAdded.showUrl(),
                hdfsUrl: hdfs.showUrl(),
                header: {
                    pattern: hdfs.get("name"),
                    directoryLink: chorus.helpers.linkTo(parentDir.showUrl(), parentDir.name())
                }
            }
        },

        WORKSPACE_CHANGE_NAME: function(model) {
            return {
                objectName: model.workspace().get("name"),
                objectUrl: model.workspace().showUrl()
            }
        },

        WORKFILE_CREATED: function(model) {
            return {
                objectName: model.workfile().get("name"),
                objectUrl: model.workfile().showUrl({ version: 1})
            }
        },

        WORKFILE_UPGRADED_VERSION: function(model) {
            return {
                objectName: model.workfile().get("name"),
                objectUrl: model.workfile().showUrl(),
                iconSrc: "/images/new_version_icon.png",
                iconHref: model.workfile().showUrl(),
                iconClass: '',
                versionName: t("workfile.version_title", { versionNum: model.get("version")}),
                versionUrl: model.workfile().showUrl({version: model.get("version")}),
                body: model.get("commitMessage")
            }
        },

        START_PROVISIONING: function(model){
            var instance = model.instance();
            instance.set({instanceProvider: "Greenplum Database"});
            return {
                objectName: instance.get("name"),
                objectUrl: instance.showUrl(),
                iconClass: '',
                iconSrc: instance.providerIconUrl(),
                iconHref: instance.showUrl()
            }
        },

        PROVISIONING_SUCCESS: function(model){
            var instance = model.instance();
            instance.set({instanceProvider: "Greenplum Database"});
            return {
                objectName: instance.get("name"),
                objectUrl: instance.showUrl(),
                instanceAddress: instance.get("host") + ":" + instance.get("port"),
                iconClass: '',
                iconSrc: instance.providerIconUrl(),
                iconHref: instance.showUrl()
            }
        },

        PROVISIONING_FAIL: function(model){
            var instance = model.instance();
            var ctx = {};
            ctx.detailsLink = chorus.helpers.linkTo('#', t("activity_stream.view_error_details"), {
                "class": 'alert',
                "data-alert": "Error",
                "data-title": t("provisioning.failed.alert.title"),
                "data-body": model.get("errorMessage").errorMessage
            });

            ctx.iconClass = '';
            ctx.iconSrc = "/images/med_red_alert.png";
            ctx.iconHref = "javascript:void()"
            ctx.objectName =  instance.get("name");

            return ctx;
        },

        INSTANCE_CREATED: function(model) {
            var instance = model.instance();
            return {
                objectName: instance.get("name"),
                objectUrl: instance.showUrl()
            }
        },

        INSTANCE_DELETED: function(model) {
            var instance = model.instance();
            return {
                objectName: instance.get("name"),
                objectUrl: null
            }
        },

        USER_ADDED: function(model) {
            var user = new chorus.models.User(model.get("user"));
            return {
                objectName: user.get("name"),
                objectUrl: user.showUrl(),
                iconSrc: user.imageUrl(),
                iconHref: user.showUrl()
            }
        },

        USER_DELETED: function(model) {
            return  {
                objectName: model.get("user").name,
                header: { objectName: model.get("user").name }
            }
        },

        MEMBERS_ADDED: memberExtension,
        MEMBERS_DELETED: memberExtension,

        WORKSPACE_DELETED: function(model) {
            return {
                objectName: this.presenter.workspaceName,
                header: { objectName: this.presenter.workspaceName }
            }
        },

        SOURCE_TABLE_CREATED: function(model) {
            return {
                objectName: this.noteObject.get('objectName'),
                objectUrl: this.noteObject.showUrl(),
                header: {
                    type: t(this.noteObject.tableOrViewTranslationKey())
                }
            }
        },

        CHORUS_VIEW_CREATED: function(model) {
            return {
                objectName: this.noteObject.get('objectName'),
                objectUrl: this.noteObject.showUrl(),
                sourceName: model.sourceObject().get("objectName"),
                sourceUrl: model.sourceObject().showUrl(),
                sourceType: model.sourceObject().get("type")
            };
        },

        DATASET_CHANGED_QUERY: function(model) {
            return {
                objectName: this.noteObject.get('objectName'),
                objectUrl: this.noteObject.showUrl()
            };
        },

        VIEW_CREATED: function(model) {
            return {
                objectName: this.noteObject.get('objectName'),
                objectUrl: this.noteObject.showUrl(),
                chorusViewName: model.chorusViewDataset().get("objectName"),
                chorusViewUrl: model.chorusViewDataset().showUrl()
            };
        }
    });

    function getType(model, prefix) {
        var type = model.get("type");
        if (_.include(["RECEIVE_NOTE", "INSIGHT_CREATED"], type)) type = "NOTE";
        if (I18n.lookup([prefix, type].join("."))) {
            return type;
        } else {
            return "DEFAULT";
        }
    }

    function showNote(model) {
        var attrs = {
            attachments: _.map(model.attachments(), function(artifact) {
                return new chorus.presenters.Artifact(artifact);
            })
        };

        if (this.noteObject) {
            attrs.objectName = this.noteObject.get("name") || this.noteObject.get("objectName");
            attrs.objectUrl = this.noteObject.showUrl();
        }

        return attrs
    }

    function workspaceIsObject(model) {
        return {
            objectName: this.presenter.workspaceName,
            objectUrl: this.presenter.workspaceUrl
        }
    }

    function memberExtension(model) {
        var user = new chorus.models.User(model.get("user")[0]);
        return {
            objectName: user.get("name"),
            objectUrl: user.showUrl(),
            header: {
                count: model.get("user").length - 1
            }
        }
    }

    function importIsObject(model) {
        var ctx = {};
        var destinationObject = model.dataset();
        if (model.has("file")) {
            ctx = {
                importType: t("dataset.import.types.file"),
                importSourceName: model.get('file').name
            }
        } else if (model.has("chorusView")) {
            var chorusView = model.chorusViewDataset();
            ctx = {
                importSourceName: chorusView.get("objectName"),
                importSourceUrl: chorusView.showUrl(),
                importType: t("dataset.import.types.chorus_view")
            }
        } else {
            var sourceTable = model.databaseObject().asDataset();
            ctx = {
                importSourceName: sourceTable.get("objectName"),
                importSourceUrl: sourceTable.showUrl()
            }

            var metaType = sourceTable.metaType();
            if (metaType == "table") ctx.importType = t("dataset.import.types.table");
            if (metaType == "view" || metaType == "query") ctx.importType = t("dataset.import.types.view");
        }

        _.extend(ctx, {
            objectName: destinationObject.get("objectName"),
            objectType: t("database_object.TABLE"),
            objectUrl: destinationObject.showUrl(),
            iconHref: destinationObject.showUrl()
        });

        return ctx;
    }
})();
