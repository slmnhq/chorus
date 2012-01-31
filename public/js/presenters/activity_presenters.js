(function () {
    chorus.presenters.Activity = chorus.presenters.Base.extend({
        present:function (model, options) {
            this.options = options;

            this.model = model
            this.author = model.author();
            this.workspace = model.workspace();
            this.workfile = model.workfile();
            this.noteObject = model.instance() || this.workfile || this.workspace;
            this.activityType = model.get("type")

            this.presenter = this.defaultPresenter(this.model)
            this.extensions = this[this.activityType] && this[this.activityType](model)
            _.extend(this.presenter, this.extensions)
            this.presenter.header = _.extend(this.defaultHeader(), this.presenter.header) //presenter.header includes extensions.header
            this.presenter.headerHtml = this.headerHtml();


            this.presenter._impl = this;

            return this.presenter
        },

        defaultPresenter:function (model) {
            var entityTitles = {
                "DEFAULT":t("comments.title.ACTIVITY"),
                "NOTE":t("comments.title.NOTE")
            };

            return {
                body:model.get("text"),
                entityTitle:entityTitles[this.activityType] || entityTitles["DEFAULT"],
                entityType:this.activityType == "NOTE" ? "comment" : "activitystream",
                objectName:"don't know object name for activity type: " + this.activityType,
                objectUrl:"/NEED/OBJECT/URL/FOR/TYPE/" + this.activityType,
                workspaceName:this.workspace ? this.workspace.get("name") : "no workspace name for activity type: " + this.activityType,
                workspaceUrl:this.workspace ? this.workspace.showUrl() : "no workspace URL for activity type: " + this.activityType,
                iconSrc:this.author.imageUrl(),
                iconHref:this.author.showUrl(),
                iconClass:'profile'
            };
        },

        defaultHeader:function () {
            var header = {
                type:this.model.get("type"),
                authorLink:chorus.helpers.linkTo(this.author.showUrl(), this.author.displayName(), { 'class':"author" }),
                objectLink:chorus.helpers.linkTo(this.presenter.objectUrl, this.presenter.objectName),
                workspaceLink:chorus.helpers.linkTo(this.presenter.workspaceUrl, this.presenter.workspaceName)
            }

            if (this.presenter.versionName && this.presenter.versionUrl) {
                header.versionLink = chorus.helpers.linkTo(this.presenter.versionUrl, this.presenter.versionName)
            }

            return header;
        },

        headerHtml:function () {
            return t(this.headerTranslationKey(), this.presenter.header)
        },

        headerTranslationKey:function () {
            var prefix = 'activity_stream.header.html.';
            var type = this.model.get("type");
            if (!I18n.lookup(prefix + type)) {
                type = 'DEFAULT';
            }
            var styles = _.flatten([this.options.displayStyle, 'default']);

            prefix = prefix + type + '.';
            return prefix + _.find(styles, function (style) {
                return I18n.lookup(prefix + style);
            });
        },

        NOTE:function (model) {
            var attrs = {
                attachments:_.map(model.attachments(), function (artifact) {
                    return new chorus.presenters.Artifact(artifact);
                })
            };

            if(this.noteObject) {
                attrs.objectName = this.noteObject.get("name");
                attrs.objectUrl = this.noteObject.showUrl();
            }

            return attrs
        },

        WORKSPACE_CREATED:workspaceIsObject,
        WORKSPACE_MAKE_PRIVATE:workspaceIsObject,
        WORKSPACE_MAKE_PUBLIC:workspaceIsObject,
        WORKSPACE_ARCHIVED:workspaceIsObject,
        WORKSPACE_UNARCHIVED:workspaceIsObject,

        WORKFILE_CREATED:function (model) {
            return {
                objectName:model.workfile().get("name"),
                objectUrl:model.workfile().showUrlForVersion(1)
            }
        },

        WORKFILE_UPGRADED_VERSION:function (model) {
            return {
                objectName:model.workfile().get("name"),
                objectUrl:model.workfile().showUrl(),
                iconSrc:"/images/version_large.png",
                iconHref:model.workfile().showUrl(),
                iconClass:'',
                versionName:t("workfile.version_title", { versionNum:model.get("version")}),
                versionUrl:model.workfile().showUrl(),
                body:model.get("commitMessage")
            }
        },

        INSTANCE_CREATED:function (model) {
            var instance = model.instance();
            return {
                objectName:instance.get("name"),
                objectUrl:new chorus.models.Instance({id:instance.get("id")}).showUrl()
            }
        },

        USER_ADDED:function (model) {
            var user = new chorus.models.User({id:model.get("user").id});
            return {
                objectName:model.get("user").name,
                objectUrl:user.showUrl(),
                iconSrc:user.imageUrl(),
                iconHref:user.showUrl()
            }
        },

        USER_DELETED:function (model) {
            return  {
                objectName:model.get("user").name,
                header:{ objectName:model.get("user").name }
            }
        },

        MEMBERS_ADDED:memberExtension,
        MEMBERS_DELETED:memberExtension,


        WORKSPACE_DELETED:function (model) {
            return {
                objectName:this.presenter.workspaceName,
                header:{ objectName:this.presenter.workspaceName }
            }
        }
    });

    function workspaceIsObject(model) {
        return {
            objectName:this.presenter.workspaceName,
            objectUrl:this.presenter.workspaceUrl
        }
    }

    function memberExtension(model) {
        var user = new chorus.models.User(model.get("user")[0]);
        return {
            objectName:user.get("name"),
            objectUrl:user.showUrl(),
            header:{
                count:model.get("user").length - 1
            }
        }
    }
})();
