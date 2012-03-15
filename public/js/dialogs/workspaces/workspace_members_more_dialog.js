chorus.dialogs.WorkspaceMembersMore = chorus.dialogs.Base.extend({
    className:"workspace_members_more",
    title:t("workspace.members"),
    persistent:true,

    setup:function () {
        this.members = this.pageModel.members();
        this.sortMenu = new chorus.views.ListHeaderView({
            linkMenus:{
                sort:{
                    title:t("users.header.menu.sort.title"),
                    options:[
                        {data:"firstName", text:t("users.header.menu.sort.first_name")},
                        {data:"lastName", text:t("users.header.menu.sort.last_name")}
                    ],
                    event:"sort",
                    chosen: "lastName"
                }
            }
        });

        this.choice = "lastName";
        this.sortMenu.bind("choice:sort", function (choice) {
            this.choice = choice;
            this.render();
        }, this)

    },

    subviews:{
        ".sort_menu":"sortMenu"
    },

    additionalContext:function () {
        var self = this
        var sortedMembers = _.sortBy(self.members.models, function (member) {
            return member.get(self.choice);
        });
        return {
            members:_.map(sortedMembers, function (member) {
                return {
                    displayName:member.displayName(),
                    imageUrl:member.imageUrl({size:'icon'}),
                    showUrl:member.showUrl()
                };
            })
        }
    }
})
