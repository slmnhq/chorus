;
(function($, ns) {
    ns.ImageUpload = chorus.views.Base.extend({
        className: "image_upload",

        additionalContext: function() {
            return {
                imageUrl: this.model.imageUrl({ size : "original" })
            }
        },

        postRender : function() {
            var self = this;

            var multipart = !window.jasmine;
            this.$("input[type=file]").fileupload({
                url : this.model.imageUrl(),
                type: 'POST',
                add : fileSelected,
                done: uploadFinished,
                multipart: multipart,
                dataType: "text"
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

                self.$("img").addClass("disabled");
                self.$("input[type=file]").attr("disabled", "disabled");
                self.$("a.action").addClass("disabled");

                data.submit();
            }

            function uploadFinished(e, data) {
                var originalUrl = self.model.imageUrl();
                self.spinner.stop();
                self.$("img").removeClass("disabled");
                self.$("input[type=file]").removeAttr("disabled");
                self.$("a.action").removeClass("disabled");
                self.$("img").attr('src', originalUrl + "&buster=" + (new Date().getTime()));

                var json = $.parseJSON(data.result);
                if (json.status == "ok") {
                    self.resource.serverErrors = [];
                    self.resource.trigger("validated");
                } else {
                    self.resource.serverErrors = json.message;
                    self.resource.trigger("saveFailed");
                }
            }
        }
    });
})(jQuery, chorus.views);
