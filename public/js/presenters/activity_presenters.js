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
                isNote: model.isNote()
            };

            if (this.author) {
                obj.iconSrc = this.author.imageUrl();
                obj.iconHref = this.author.showUrl();
                obj.isOwner = this.author.id == chorus.session.user().id;
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

            if (this.presenter.versionName && this.presenter.versionUrl) {
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


            return header;
        },

        headerHtml: function() {
            return t(this.headerTranslationKey(), this.presenter.header)
        },

        headerTranslationKey: function() {
            var prefix = 'activity_stream.header.html.';
            var type = this.model.get("type");
            if (_.include(["RECEIVE_NOTE", "INSIGHT_CREATED"], type)) type = "NOTE";
            if (!I18n.lookup(prefix + type)) type = 'DEFAULT';
            prefix = prefix + type + '.';

            if (this.options.isNotification) prefix += "notification.";

            var styles = _.flatten([
                this.options.displayStyle,
                this.workspace && (this.workspace != this.noteObject) ? 'default' : 'without_workspace'
            ]);
            var style = _.find(styles, function(potentialStyle) {
                return I18n.lookup(prefix + potentialStyle);
            });

            return prefix + style;
        },

        NOTE: showNote,
        INSIGHT_CREATED: showNote,
        RECEIVE_NOTE: showNote,

        IMPORT_SUCCESS: function(model) {
            var ctx = importIsObject(model);
            ctx.iconClass = ''
            ctx.iconSrc = "/images/import_icon.png";
            return ctx;
        },

        IMPORT_FAILED: function(model) {
            var ctx = importIsObject(model);
            ctx.iconClass = ''
            ctx.iconSrc = "/images/med_red_alert.png";

            var destinationTable = new chorus.models.Dataset(model.get("databaseObject"));

            ctx.detailsLink = chorus.helpers.linkTo('#', t("activity_stream.view_error_details"), {
                "class": 'alert',
                "data-alert": "ImportFailed",
                "data-id": model.has("file") ? model.get("file").name : destinationTable.get("id"),
                "data-workspace-id": model.workspace().get("id"),
                "data-import-type": model.has("file") ? "CSV" : "DATASET"
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
                iconSrc: "/images/table_large.png",
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
                iconSrc: "/images/version_large.png",
                iconHref: model.workfile().showUrl(),
                iconClass: '',
                versionName: t("workfile.version_title", { versionNum: model.get("version")}),
                versionUrl: model.workfile().showUrl({version: model.get("version")}),
                body: model.get("commitMessage")
            }
        },

        INSTANCE_CREATED: function(model) {
            var instance = model.instance();
            return {
                objectName: instance.get("name"),
                objectUrl: new chorus.models.Instance({id: instance.get("id")}).showUrl()
            }
        },

        USER_ADDED: function(model) {
            var user = new chorus.models.User({id: model.get("user").id});
            return {
                objectName: model.get("user").name,
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
                tableName: model.sourceDataset().get("objectName"),
                tableUrl: model.sourceDataset().showUrl()
            };
        },

        DATASET_CHANGED_QUERY: function(model) {
            return {
                objectName: this.noteObject.get('objectName'),
                objectUrl: this.noteObject.showUrl()
            };
        }
    });

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
            objectUrl: destinationObject.showUrl()
        });

        return ctx;
    }
})();
