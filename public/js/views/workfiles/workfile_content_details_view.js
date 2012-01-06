(function($, ns) {
    ns.WorkfileContentDetails = ns.Base.extend({
            className : "workfile_content_details",
            events : {
                "click .edit_file" : "startEdit",
                "click .save_as"   : "saveChanges"
            },

            setup : function() {
                this.bind("autosaved", this.updateAutosaveText);
            },

            updateAutosaveText: function() {
                var time = this.formatTime(new Date());
                this.$("span.auto_save").removeClass("hidden");
                this.$("span.auto_save").text(t("workfile.content_details.auto_save", {time: time}))
            },

            startEdit: function(e) {
                e.preventDefault();
                this.trigger("file:edit");
                this.$(".save_as").removeAttr("disabled");
                this.$(".edit_file").attr("disabled", "disabled");
            },

            saveChanges: function(e) {
                e.preventDefault();
                this.trigger("file:save");
                this.$(".save_as").attr("disabled", "disabled");
                this.$(".edit_file").attr("disabled", "disabled");
                this.$("span.auto_save").addClass("hidden");
            },

            formatTime: function(time) {
                var hours = time.getHours();
                var minutes = time.getMinutes();

                var suffix = "AM";
                if (hours >= 12) {
                    suffix = "PM";
                    hours = hours - 12;
                }
                if (hours == 0) {
                    hours = 12;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                return hours + ":" + minutes + " " + suffix;
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
