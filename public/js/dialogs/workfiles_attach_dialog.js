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
            if(this.$('li.selected').length > 0) {
                this.$('button.submit').removeAttr('disabled');
            } else {
                this.$('button.submit').attr('disabled', 'disabled');
            }

        },

        submit : function() {
            var workfiles = _.map(this.$("li.selected"), function(li) {
                var id = $(li).data("id");
                return this.collection.get(id);
            }, this);

            this.selectedFiles = new ns.models.WorkfileSet(workfiles, { workspaceId : this.collection.get("workspaceId") });
            this.trigger("files:selected", this.selectedFiles);
            this.closeModal();
        },

        postRender: function() {
            if(!this.options.selectedFiles) {
                return;
            }
            _.each(this.$('li'), function(li) {
                if(this.options.selectedFiles.get($(li).data('id'))) {
                    $(li).addClass('selected');
                }
            }, this);
        },

        additionalContext: function(ctx) {
            return {
                models : _.sortBy(ctx.models, function(model) {
                    return -(Date.parseFromApi(model.lastUpdatedStamp).getTime())
                })
            }
        }
    })
})(chorus)
