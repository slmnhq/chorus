(function($, ns) {
    ns.WorkfileContentDetails = ns.Base.extend({
        className : "workfile_content_details",
        events : {
            "click .edit_file" : "startEdit",
            "click .save_as"   : "saveChanges"
        },
        startEdit: function(e){
            e.preventDefault();
            this.trigger("file:edit");
            this.$(".save_as").removeAttr("disabled");
            this.$(".edit_file").attr("disabled", "disabled");
        },
        saveChanges: function(e){
            e.preventDefault();
            this.trigger("file:save");
            this.$(".save_as").attr("disabled", "disabled");
            this.$(".edit_file").attr("disabled", "disabled");
        }
    },
    {
        buildFor : function(model) {
            if (model.isImage()) {
                return new ns.ImageWorkfileContentDetails({ model : model });
            }

            return new ns.WorkfileContentDetails({ model : model });
        }
    });
})(jQuery, chorus.views);
