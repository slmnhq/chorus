(function($, ns) {
    ns.StyleGuidePage = chorus.pages.Base.extend({
        setup : function() {
            this.mainContent = new chorus.views.MainContentView({
                content : new chorus.views.StaticTemplate("style_guide"),
                contentHeader : new chorus.views.StaticTemplate("default_content_header", {title: 'Style Guide Page'}),
                contentDetails : new chorus.views.StaticTemplate("plain_text", {text: 'Design rules for a happy family.'})
            });

            //sidebar is optional
            this.sidebar = new chorus.views.StaticTemplate("plain_text", {text: "sidebar is 250px wide"})

            //subnavs require a workspace and are optional
            this.workspace = new chorus.models.Workspace({ description: "One awesome workspace"})
            this.workspace.loaded = true;
            this.subNav = new chorus.views.SubNav({model : this.workspace, tab : "workfiles"})
        },

        postRender : function() {
            var siteElements = new ns.StyleGuidePage.SiteElementsView()
            $(this.el).append(siteElements.render().el)
        }
    });

    ns.StyleGuidePage.SiteElementsView = Backbone.View.extend({
        tagName : "ul",
        className : "views",

        initialize : function(){
            this.workspace = new chorus.models.Workspace({ description: "One awesome workspace"})
            this.workspace.loaded = true;
            this.subNav = new chorus.views.SubNav({model : this.workspace, tab : "workfiles"})

            //necessary for collection views down at the bottom 
            this.loadingCollection = new chorus.models.UserSet();
            this.userCollection = new chorus.models.UserSet([
                new chorus.models.User({ userName: "edcadmin", fullName: "Johnny Danger", admin : false, id: "InitialUser"}),
                new chorus.models.User({ userName: "edcadmin", fullName: "Laurie Blakenship", admin : true, id: "InitialUser"}),
                new chorus.models.User({ userName: "edcadmin", fullName: "George Gorilla", admin : false, id: "InitialUser"})
            ]);

            this.userCollection.loaded = true;

            this.views = {
                "Header" : new chorus.views.Header(),

                "Bredcrumbs" : new chorus.views.BreadcrumbsView({
                    breadcrumbs: [
                        { label: t("breadcrumbs.home"), url: "#/" },
                        { label: t("breadcrumbs.users"), url: "#/users" },
                        { label : t("breadcrumbs.new_user") }
                    ]
                }),

                "Sub Nav" : new chorus.views.SubNav({model : this.workspace, tab : "summary"}),

                "Link Menu" : new chorus.views.LinkMenu({title : "Link Menu", options : [
                                                        {data : "first", text : "Text of first option"},
                                                        {data : "second", text : "Text of second option"}
                ]}),

                "Basic Main Content View" : new chorus.views.MainContentView({
                    contentHeader : new chorus.views.StaticTemplate("default_content_header", {title: 'Content Header'}),
                    contentDetails : new chorus.views.StaticTemplate("plain_text", {text: 'Content Details'}),
                    content : new chorus.views.StaticTemplate("ipsum")
                }),


                "List Page (loading)" : new chorus.views.MainContentList({modelClass : "User", collection : this.loadingCollection}),

                "List Page" : new chorus.views.MainContentList({
                    modelClass : "User",
                    collection : this.userCollection,
                    linkMenus : {
                        sort : {
                            title : t("users.header.menu.sort.title"),
                            options : [
                                {data : "firstName", text : t("users.header.menu.sort.first_name")},
                                {data : "lastName", text : t("users.header.menu.sort.last_name")}
                            ],
                            event : "sort",
                            chosen : t("users.header.menu.sort.last_name")
                        }
                    },
                    buttons : [
                        {
                            url : "#/users/new",
                            text : "Create Thing"
                        },
                        {
                            url : "#/users/new",
                            text : "Create Other Thing"
                        }
                    ]
                })
            }
        },

        render : function(){
            $(this.el).empty()

            var self = this;
            _.each(this.views, function(view, name) {
                $(self.el).append("<li class='view'><h1>" + name + "</h1><div class='view_guts'/></li>")
                view.el = self.$(".view_guts:last");
                view.delegateEvents();
                view.render();
            })

            return this
        }
    });
})(jQuery, chorus.pages);
