(function($, ns) {
    ns.CopyWorkfile = chorus.dialogs.Base.extend({
        className : "copy_workfile",
        title : t("workfile.copy_dialog.title"),

        persistent: true,

        events : {
            "click button.submit" : "copyWorkfile"
        },

        additionalContext : function(ctx) {
            return {
                serverErrors : this.serverErrors
            }
        },

        makeModel : function() {
            this.collection = this.collection || new chorus.models.WorkspaceSet([], {user : chorus.session.user()});
            this.collection.fetchAll();
        },

        setup : function() {
            this.picklistView = new chorus.views.CollectionPicklist({ collection : this.collection });
            this.picklistView.bind("item:selected", this.itemSelected, this);
            this.workfile = new chorus.models.Workfile({ id : this.options.launchElement.data("workfile-id"), workspaceId : this.options.launchElement.data("workspace-id") });
            this.workfile.fetch();
        },

        postRender : function() {
            this.picklistView.render();
            this.$("#dialog_content .picklist").append(this.picklistView.el);
            this.picklistView.delegateEvents();
        },

        itemSelected : function(item) {
            if (item) {
                this.$("button.submit").removeAttr("disabled");
            }
            else {
                this.$("button.submit").attr("disabled", "disabled");
            }
        },

        copyWorkfile : function() {
            var self = this;

            var params = {
                source : "chorus",
                fileName : this.workfile.get("fileName"),
                workfileId : this.workfile.get("id")
            }

            var description = this.workfile.get("description");
            if (description) {
                params.description = description;
            }

            $.post("/edc/workspace/" + this.picklistView.selectedItem().get("id") + "/workfile", params,
                function(data) {
                    if (data.status == "ok") {
                        self.closeModal();
                    } else {
                        self.serverErrors = data.message;
                        self.render();
                    }
                }, "json");
        }
    });
})(jQuery, chorus.dialogs);
