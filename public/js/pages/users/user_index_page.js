(function($, ns) {
    ns.UserIndexPage = chorus.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home"), url: "#/" },
            { label: t("breadcrumbs.users") }
        ],

        setup : function() {
            this.collection = new chorus.modelmUserSet();
            this.collection.sortAsc("lastName");
            this.collection.fetch();

            var buttons = [];
            if (chorus.session.user().get("admin")) {
                buttons.push({
                        url : "#/users/new",
                        text : t("actions.add_user")
                    }
                )
            }

            this.mainContent = new chorus.views.MainContentList({
                modelClass : "User",
                collection : this.collection,
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
                buttons : buttons
            })

            this.mainContent.contentHeader.bind("choice:sort", function(choice) {
                this.collection.sortAsc(choice)
                this.collection.fetch();
            }, this)
        }
    });
})
    (jQuery, chorus.pages);
