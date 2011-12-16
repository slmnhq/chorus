;
(function(ns) {
    ns.presenters.Activity = function(model){
        var constructor = ns.presenters.Activity[model.get("type")] || ns.presenters.Activity.Base;
        var presenter = constructor.make(model)
        presenter.header = {
            type: model.get("type"),
            authorUrl: model.author().showUrl(),
            authorName: model.author().displayName(),
            objectUrl: presenter.objectUrl,
            objectName: presenter.objectName,
            workspaceUrl: presenter.workspaceUrl,
            workspaceName: presenter.workspaceName
        }

        return presenter
    };

    ns.presenters.Activity.Base = {
        make : function(model) {
            var type = model.get("type");
            var author = model.author();
            var workspace = model.get("workspace") && new ns.models.Workspace(model.get("workspace"));

            var entityTitles = {
                "DEFAULT" : t("comments.title.ACTIVITY"),
                "NOTE" : t("comments.title.NOTE")
            }

            var presenter = _.extend({}, model.attributes, {
                imageUrl : author.imageUrl(),
                showUrl : author.showUrl(),
                body : model.get("text") || "",
                timestamp : model.get("timestamp"),
                entityType : model.get("entityType"),
                entityTitle : entityTitles[type] || entityTitles["DEFAULT"],
                objectName : "don't know object name for activity type: " + type,
                objectUrl : "/NEED/OBJECT/URL/FOR/TYPE/" + type,
                workspaceName : workspace ? workspace.get("name") : "no workspace name for activity type: " + type,
                workspaceUrl : workspace ? workspace.showUrl() : "no workspace URL for activity type: " + type,
                iconSource : author.imageUrl(),
                iconHref : author.showUrl()
            });

            presenter.subComments = this.subComments(model) || []

            return presenter
        },

        subComments : function(model){
            var comments = model.get("comments");
            return _.map(comments, function(comment) {
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
    };



    ns.presenters.Activity.NOTE = {
        make : function(model) {
            return extendBase(model, { objectUrl : 'foo' })
        }
    };

    ns.presenters.Activity.WORKSPACE_DELETED = {
        make : function(model){
            var original = extendBase(model);
            return extendBase(model, {
                objectName : original.workspaceName
            })
        }
    };

    ns.presenters.Activity.WORKSPACE_CREATED = {
        make : function(model){
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
                iconSource : user.imageUrl(),
                iconHref : user.showUrl()
            })
        }
    };

    function extendBase(model, overrides) {
        return _.extend(ns.presenters.Activity.Base.make(model) , overrides)
    }
})(chorus);