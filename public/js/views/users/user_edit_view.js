;
(function($, ns) {
    ns.UserEdit = chorus.views.Base.extend({
        className: "user_edit",

        events : {
            "submit form" : 'saveEditUser',
            "click button.cancel" : "goBack"
        },

        additionalContext: function() {
            return {
                permission : ((this.model.get("userName") == chorus.user.get("userName"))|| chorus.user.get("admin")) ,
                imageUrl: this.model.imageUrl()
            }
        },

        setup : function() {
            this.model.bind("saved", userSuccessfullySaved, this);
        },

        saveEditUser : function saveEditUser(e) {
            e.preventDefault();
            var updates = {};
            _.each(this.$("input"), function(i) {
                var input = $(i);
                updates[input.attr("name")] = input.val().trim();
            });

            updates.admin = this.$("input#admin-checkbox").prop("checked") || false;
            updates.notes = this.$("textarea").val().trim()

            this.model.set(updates);
            this.model.save();
        },

        goBack : function() {
            window.history.back();
        },

        postRender : function() {
            var self = this;

            this.$("input[type=file]").fileupload({
                url : '/edc/userimage/' + this.model.get("userName"),
                type: 'POST',
                add : fileSelected,
                done: uploadFinished
            });

            function fileSelected(e, data) {
                self.spinner = new Spinner({
                    lines: 30,
                    length: 40,
                    width: 6,
                    radius: 25,
                    color: '#000',
                    speed: 0.5,
                    trail: 75,
                    shadow: false
                }).spin(self.$(".spinner_container")[0]);

                self.$(".edit_photo img").addClass("disabled");

                data.submit();
            }

            function uploadFinished(e, data) {
                originalUrl = self.model.imageUrl();
                self.spinner.stop();
                self.$(".edit_photo img").removeClass("disabled");
                self.$(".edit_photo img").attr('src', originalUrl + "&buster=" + (new Date().getTime()));
            }
        }
    });

    function userSuccessfullySaved() {
        chorus.router.navigate(this.model.showUrl(), true);
    }

})(jQuery, chorus.views);
