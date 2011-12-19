;
(function(ns) {
    var entityTitles = {
        "DEFAULT" : t("comments.title.ACTIVITY"),
        "NOTE" : t("comments.title.NOTE")
    };

    ns.presenters.Activity = ns.presenters.Base.extend({
        present : function(model) {
            var constructor = ns.presenters.Activity[model.get("type")] || ns.presenters.Activity.Base;
            this.model = model
            this.presenter = constructor.make(model)
            this.presenter.header = _.extend(this.header(), this.presenter.header);
            this.presenter.subComments = this.subComments();

            return this.presenter
        },

        header : function() {
            return {
                type: this.model.get("type"),
                authorUrl: this.model.author().showUrl(),
                authorName: this.model.author().displayName(),
                objectUrl: this.presenter.objectUrl,
                objectName: this.presenter.objectName,
                workspaceUrl: this.presenter.workspaceUrl,
                workspaceName: this.presenter.workspaceName
            }
        },

        subComments : function() {
            return _.map(this.model.get("comments"), function(comment) {
                comment = new chorus.models.Comment(comment);
                var user = comment.creator();
                return  {
                    imageUrl : user.imageUrl({ size : "icon" }),
                    authorShowUrl : user.showUrl(),
                    displayName : user.displayName(),
                    timestamp : comment.get("timestamp"),
                    id : comment.get("id"),
                    body : comment.get("text")
                };

            });
        }
    });

    ns.presenters.Activity.Base = {
        make : function(model) {
            var type = model.get("type");
            var author = model.author();
            var workspace = model.get("workspace") && new ns.models.Workspace(model.get("workspace"));

            return {
                body : model.get("text"),
                entityTitle : entityTitles[type] || entityTitles["DEFAULT"],
                entityType : type == "NOTE" ? "comment" : "activitystream",
                objectName : "don't know object name for activity type: " + type,
                objectUrl : "/NEED/OBJECT/URL/FOR/TYPE/" + type,
                workspaceName : workspace ? workspace.get("name") : "no workspace name for activity type: " + type,
                workspaceUrl : workspace ? workspace.showUrl() : "no workspace URL for activity type: " + type,
                iconSrc : author.imageUrl(),
                iconHref : author.showUrl()
            };
        }
    };


    ns.presenters.Activity.NOTE = {
        make : function(model) {
            return extendBase(model, { objectUrl : 'foo' })
        }
    };

    ns.presenters.Activity.WORKSPACE_DELETED = {
        make : function(model) {
            var original = extendBase(model);
            return extendBase(model, {
                objectName : original.workspaceName
            })
        }
    };

    var workspaceIsObject = {
        make : function(model) {
            var original = extendBase(model);
            return extendBase(model, {
                objectName : original.workspaceName,
                objectUrl : original.workspaceUrl
            })
        }
    };

    ns.presenters.Activity.WORKSPACE_CREATED = workspaceIsObject;
    ns.presenters.Activity.WORKSPACE_MAKE_PRIVATE = workspaceIsObject;
    ns.presenters.Activity.WORKSPACE_MAKE_PUBLIC = workspaceIsObject;

    ns.presenters.Activity.WORKFILE_CREATED = {
        make : function(model) {
            return extendBase(model, {
                objectName : model.get("workfile").name,
                objectUrl : new ns.models.Workfile({id: model.get("workfile").id, workspaceId : model.get("workspace").id}).showUrl()
            })
        }
    };

    ns.presenters.Activity.USER_ADDED = {
        make : function(model) {
            var user = new ns.models.User({id: model.get("user").id});
            return extendBase(model, {
                objectName : model.get("user").name,
                objectUrl : user.showUrl(),
                iconSrc : user.imageUrl(),
                iconHref : user.showUrl()
            })
        }
    };

    ns.presenters.Activity.USER_DELETED = {
        make : function(model) {
            return extendBase(model, {
                objectName : model.get("user").name
            })
        }
    };

    ns.presenters.Activity.MEMBERS_ADDED = {
        make : function(model) {
            var user = new ns.models.User(model.get("user")[0]);
            return extendBase(model, {
                objectName : user.get("name"),
                objectUrl : user.showUrl(),
                header : {
                    others : _.rest(model.get("user"))
                }
            });
        }
    }

    function extendBase(model, overrides) {
        return _.extend(ns.presenters.Activity.Base.make(model), overrides)
    }
})(chorus);