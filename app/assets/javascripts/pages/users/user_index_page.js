chorus.pages.UserIndexPage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.home"), url:"#/" },
        { label:t("breadcrumbs.users") }
    ],
    helpId: "users",

    setup:function () {
        this.collection = new chorus.collections.UserSet();
        this.collection.sortAsc("last_name");
        this.collection.fetch();

        var buttons = [];
        if (chorus.session.user().get("admin")) {
            buttons.push({
                    url:"#/users/new",
                    text:t("actions.add_user")
                }
            )
        }

        this.mainContent = new chorus.views.MainContentList({
            modelClass:"User",
            collection:this.collection,
            linkMenus:{
                sort:{
                    title:t("users.header.menu.sort.title"),
                    options:[
                        {data:"first_name", text:t("users.header.menu.sort.first_name")},
                        {data:"last_name", text:t("users.header.menu.sort.last_name")}
                    ],
                    event:"sort",
                    chosen: "last_name"
                }

            },
            buttons:buttons
        })

        this.mainContent.contentHeader.bind("choice:sort", function (choice) {
            this.collection.sortAsc(choice)
            this.collection.fetch();
        }, this);

        this.sidebar = new chorus.views.UserSidebar({listMode: true});
    }
});
