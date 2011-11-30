(function($, ns) {
    ns.StyleGuidePage = chorus.pages.Bare.extend({
        className : "style_guide",

        setup : function() {
            this.loadingCollection = new chorus.models.UserSet();

            this.userCollection = new chorus.models.UserSet([
                new chorus.models.User({ userName: "edcadmin", fullName: "Johnny Danger", admin : false}),
                new chorus.models.User({ userName: "edcadmin", fullName: "Laurie Blakenship", admin : true}),
                new chorus.models.User({ userName: "edcadmin", fullName: "George Gorilla", admin : false})
            ]);
            this.userCollection.loaded = true;

            this.workspace = new chorus.models.Workspace({ description: "One awesome workspace"})
            this.workspace.loaded = true;
        },

        postRender : function() {
            var self = this;

            this.elements = {
                "Header" : new chorus.views.Header(),

                breadcrumbs : new chorus.views.BreadcrumbsView({
                    breadcrumbs: [
                        { label: t("breadcrumbs.home"), url: "/" },
                        { label: t("breadcrumbs.users"), url: "/users" },
                        { label : t("breadcrumbs.new_user") }
                    ]
                }),

                "Sub Nav" : new chorus.views.SubNav({model : this.workspace, tab : "workfiles"}),
            }

            this.views = {
                "Basic Main Content Stucture" : new chorus.views.MainContentView({
                    content : new chorus.views.StaticTemplate("style_guide_content"),
                    contentHeader : new chorus.views.StaticTemplate("default_content_header", {title: 'Content Header'}),
                    contentDetails : new chorus.views.StaticTemplate("plain_text", {text: 'Content Details'})
                }),
                "Link Menu" : new chorus.views.LinkMenu({title : "Link Menu", options : [
                    {data : "first", text : "Text of first option"},
                    {data : "second", text : "Text of second option"}
                ]}),

                "List Page (loading)" : new chorus.views.MainContentList({modelClass : "User", collection : this.loadingCollection}),

                "List Page" : new chorus.views.MainContentList({modelClass : "User", collection : this.userCollection})
            }

            _.each(this.elements, function(element, name) {
                self.$("ul.views").append("<li class='view'><h1>" + name + "</h1><div class='element_guts'/></li>")
                element.el = self.$(".element_guts:last");
                element.delegateEvents();
                element.render();
            })

            _.each(this.views, function(view, name) {
                self.$("ul.views").append("<li class='view'><h1>" + name + "</h1><div class='view_guts'/></li>")
                view.el = self.$(".view_guts:last");
                view.delegateEvents();
                view.render();
            })
        }
    });
})(jQuery, chorus.pages);
