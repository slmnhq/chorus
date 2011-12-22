;
(function(ns) {
    ns.dialogs.WorkfilesAttach = ns.dialogs.Base.extend({
        className : "workfiles_attach",
        title : t("workfiles.attach"),

        events : {
            "click li a" : "toggleSelection",
            "click .submit" : "submit"
        },

        makeModel : function() {
            this.collection = new ns.models.WorkfileSet([], {workspaceId: this.options.workspaceId || this.options.launchElement.data("workspace-id")});
            this.collection.fetchAll();
        },

        toggleSelection: function(event) {
            event.preventDefault();
            $(event.target).closest("li").toggleClass("selected");
        },

        submit : function() {
            var workfiles = _.map(this.$("li.selected"), function(li) {
                return new ns.models.Workfile({ id : $(li).attr("data-id")});
            })

            this.selectedFiles = new ns.models.WorkfileSet(workfiles, { workspaceId : this.collection.get("workspaceId") });
            this.closeModal();
        },

        additionalContext: function(ctx) {
            return {
                models : _.sortBy(ctx.models, function(model) {
                    return -(Date.parseFromApi(model.lastUpdatedStamp).getTime())
                })
            }
        }
        
//        setup : function() {
//            this.members = this.pageModel.members();
//            this.sortMenu = new chorus.views.ListHeaderView({
//                linkMenus : {
//                    sort : {
//                        title : t("users.header.menu.sort.title"),
//                        options : [
//                            {data : "firstName", text : t("users.header.menu.sort.first_name")},
//                            {data : "lastName", text : t("users.header.menu.sort.last_name")}
//                        ],
//                        event : "sort",
//                        chosen : t("users.header.menu.sort.last_name")
//                    }
//                }
//            });
//        },
//
//        additionalContext: function() {
//            var self = this
//            var sortedMembers = _.sortBy(self.members.models, function(member) {
//                return member.get(self.choice);
//            });
//            return {
//                members : _.map(sortedMembers, function(member) {
//                    return {
//                        displayName : member.displayName(),
//                        imageUrl : member.imageUrl({size : 'icon'}),
//                        showUrl : member.showUrl()
//                    };
//                })
//            }
//        }
    })
})(chorus)
