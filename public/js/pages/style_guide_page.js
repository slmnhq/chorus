(function($, ns) {
    ns.StyleGuidePage = chorus.pages.Bare.extend({
        className : "style_guide",

        setup : function() {
            var loadingCollection = new chorus.models.UserSet();

            var userCollection = new chorus.models.UserSet([
                new chorus.models.User({ userName: "edcadmin", fullName: "Johnny Danger", admin : false}),
                new chorus.models.User({ userName: "edcadmin", fullName: "Laurie Blakenship", admin : true}),
                new chorus.models.User({ userName: "edcadmin", fullName: "George Gorilla", admin : false})
            ]);
            userCollection.loaded = true;

            var workfileCollection = new chorus.models.WorkfileSet([
                new chorus.models.Workfile({ fileType: "sql", fileName: "topsecret.sql", description: "Don't tell anytone about this"}),
                new chorus.models.Workfile({ fileType: "txt", fileName: "contacts.txt", description: "Ma peeps"}),
                new chorus.models.Workfile({ fileType: "Java", fileName: "boxplot.java", description: "This is rad, yo"})
            ])
            workfileCollection.loaded = true;

            var loadingWorkspace = new chorus.models.Workspace()

            var workspace = new chorus.models.Workspace({ description: "One awesome workspace"})
            workspace.loaded = true;

            var emptyView = new chorus.views.StaticTemplate("plain_text", {text: ""});

            var showPageStub = chorus.views.MainContentView.extend({
                setup : function() {
                    this.content = emptyView;
                    this.contentHeader = new chorus.views.StaticTemplate("default_content_header", {title: t("users.new_user")});
                    this.contentDetails = new chorus.views.StaticTemplate("plain_text", {text: t("users.details")});
                }
            });

            this.views = {
                "Header" : new chorus.views.Header(),

                breadcrumbs : new chorus.views.BreadcrumbsView({
                    breadcrumbs: [
                        { label: t("breadcrumbs.home"), url: "/" },
                        { label: t("breadcrumbs.users"), url: "/users" },
                        { label : t("breadcrumbs.new_user") }
                    ]
                }),

                "Show Page Header" : new showPageStub(),

                "List Page (loading)" : new chorus.views.MainContentList({modelClass : "User", collection : loadingCollection}),

                "List Page" : new chorus.views.MainContentList({modelClass : "User", collection : userCollection}),

                "SubNav View" : new chorus.views.SubNavContentView({
                    modelClass : "Workspace",
                    tab : "summary",
                    model : workspace,
                    content : emptyView
                }),

                "SubNav View (rightmost tab)" : new chorus.views.SubNavContentView({
                    modelClass : "Workspace",
                    tab : "workfiles",
                    model : workspace,
                    content : emptyView
                }),

                "SubNav List (loading)" : new chorus.views.SubNavContentList({
                    modelClass : "Workfile",
                    tab : "workfiles",
                    collection : loadingCollection,
                    model : workspace}),

                "SubNav List" : new chorus.views.SubNavContentList({
                    modelClass : "Workfile",
                    tab : "workfiles",
                    collection : workfileCollection,
                    model : workspace})
            }
        },

        postRender : function() {
            var self = this;

            _.each(this.views, function(view, name) {
                self.$("ul.views").append("<li class='view'><h1>" + name + "</h1><div class='view_guts'/></li>")
                view.el = self.$(".view_guts:last");
                view.delegateEvents();
                view.render();
            })
        }
    });
})(jQuery, chorus.pages);
