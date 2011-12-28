;
(function(ns) {
    ns.presenters.Activity = ns.presenters.Base.extend({
        present : function(model) {
            this.model = model
            this.author = model.author();
            this.workspace = model.get("workspace") && new ns.models.Workspace(model.get("workspace"));
            this.activityType = model.get("type")


            this.presenter = this.defaultPresenter(this.model)
            this.extensions = this[this.activityType] && this[this.activityType](model)
            _.extend(this.presenter, this.extensions)
            this.presenter.header = _.extend(this.defaultHeader(), this.presenter.header) //presenter.header includes extensions.header
            return this.presenter
        },

        defaultPresenter : function(model) {
            var entityTitles = {
                "DEFAULT" : t("comments.title.ACTIVITY"),
                "NOTE" : t("comments.title.NOTE")
            };

            return {
                body : model.get("text"),
                entityTitle : entityTitles[this.activityType] || entityTitles["DEFAULT"],
                entityType : this.activityType == "NOTE" ? "comment" : "activitystream",
                objectName : "don't know object name for activity type: " + this.activityType,
                objectUrl : "/NEED/OBJECT/URL/FOR/TYPE/" + this.activityType,
                workspaceName : this.workspace ? this.workspace.get("name") : "no workspace name for activity type: " + this.activityType,
                workspaceUrl : this.workspace ? this.workspace.showUrl() : "no workspace URL for activity type: " + this.activityType,
                iconSrc : this.author.imageUrl(),
                iconHref : this.author.showUrl()
            };
        },

        defaultHeader : function() {
            return {
                type: this.model.get("type"),
                authorUrl: this.author.showUrl(),
                authorName: this.author.displayName(),
                objectUrl: this.presenter.objectUrl,
                objectName: this.presenter.objectName,
                workspaceUrl: this.presenter.workspaceUrl,
                workspaceName: this.presenter.workspaceName
            }
        },

        NOTE : function(model) {
            var workfile = model.get("workfile") && new ns.models.Workfile(_.extend(model.get("workfile"), {
                workspaceId : this.workspace.get("id")
            }));

            var attrs = {
                attachments: _.map(model.attachments(), function(artifact) {
                    return new ns.presenters.Artifact(artifact);
                })
            };

            if (workfile) {
                attrs.objectName = workfile.get("name");
                attrs.objectUrl = workfile.showUrl();
            } else if (this.workspace) {
                attrs.objectName = this.workspace.get("name");
                attrs.objectUrl = this.workspace.showUrl();
            }

            return attrs
        },


        WORKSPACE_CREATED : workspaceIsObject,
        WORKSPACE_MAKE_PRIVATE : workspaceIsObject,
        WORKSPACE_MAKE_PUBLIC : workspaceIsObject,
        WORKSPACE_ARCHIVED : workspaceIsObject,
        WORKSPACE_UNARCHIVED : workspaceIsObject,

        WORKFILE_CREATED : function(model) {
            return {
                objectName : model.get("workfile").name,
                objectUrl : new ns.models.Workfile({id: model.get("workfile").id, workspaceId : this.workspace.id}).showUrl()
            }
        },

        USER_ADDED : function(model) {
            var user = new ns.models.User({id: model.get("user").id});
            return {
                objectName : model.get("user").name,
                objectUrl : user.showUrl(),
                iconSrc : user.imageUrl(),
                iconHref : user.showUrl()
            }
        },

        USER_DELETED : function(model) {
            return  {
                objectName : model.get("user").name
            }
        },

        MEMBERS_ADDED : memberExtension,
        MEMBERS_DELETED : memberExtension,


        WORKSPACE_DELETED : function(model) {
            return {
                objectName : this.presenter.workspaceName
            }
        }
    });

    function workspaceIsObject(model) {
        return {
            objectName : this.presenter.workspaceName,
            objectUrl : this.presenter.workspaceUrl
        }
    }

    function memberExtension(model) {
        var user = new ns.models.User(model.get("user")[0]);
        return {
            objectName : user.get("name"),
            objectUrl : user.showUrl(),
            header : {
                others : _.rest(model.get("user"))
            }
        }
    }
})(chorus);
