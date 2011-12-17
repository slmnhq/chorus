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
            this.presenter.header = this.header()
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

            return _.extend({}, {
                body : model.get("text"),
                entityTitle : entityTitles[type] || entityTitles["DEFAULT"],
                objectName : "don't know object name for activity type: " + type,
                objectUrl : "/NEED/OBJECT/URL/FOR/TYPE/" + type,
                workspaceName : workspace ? workspace.get("name") : "no workspace name for activity type: " + type,
                workspaceUrl : workspace ? workspace.showUrl() : "no workspace URL for activity type: " + type,
                iconSrc : author.imageUrl(),
                iconHref : author.showUrl()
            });
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

    ns.presenters.Activity.WORKSPACE_CREATED = {
        make : function(model) {
            var original = extendBase(model);
            return extendBase(model, {
                objectName : original.workspaceName,
                objectUrl : original.workspaceUrl
            })
        }
    };

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

    function extendBase(model, overrides) {
        return _.extend(ns.presenters.Activity.Base.make(model), overrides)
    }
})(chorus);