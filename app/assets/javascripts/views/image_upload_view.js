chorus.views.ImageUpload = chorus.views.Base.extend({
    constructorName: "ImageUploadView",
    templateName:"image_upload",

    additionalContext:function () {
        return {
            imageUrl:this.model.fetchImageUrl(),
            hasImage:this.model.hasImage(),
            addImageKey:this.addImageKey,
            changeImageKey:this.changeImageKey,
            editable: this.editable
        }
    },

    setup:function (options) {
        this.addImageKey = options.addImageKey;
        this.changeImageKey = options.changeImageKey;
        this.spinnerSmall = options.spinnerSmall;
        this.editable = options.editable || !("editable" in options)
    },

    postRender:function () {
        var self = this;

        var multipart = !window.jasmine;
        this.$("input[type=file]").fileupload({
            url:this.model.createImageUrl(),
            type: 'PUT',
            add:fileSelected,
            done:uploadFinished,
            multipart:multipart,
            dataType:"text"
        });

        if(this.model.hasImage()) {
            this.$('img').removeClass('hidden')
        }

        function fileSelected(e, data) {
            if (self.spinnerSmall) {
                self.spinner = new Spinner({
                    lines:14,
                    length:8,
                    width:3,
                    radius:10,
                    color:'#000',
                    speed:1,
                    trail:75,
                    shadow:false
                }).spin(self.$(".spinner_container")[0]);
            } else {
                self.spinner = new Spinner({
                    lines:30,
                    length:40,
                    width:6,
                    radius:25,
                    color:'#000',
                    speed:0.5,
                    trail:75,
                    shadow:false
                }).spin(self.$(".spinner_container")[0]);
            }
            self.$("img").addClass("disabled");
            self.$("input[type=file]").prop("disabled", true);
            self.$("a.action").addClass("disabled");

            data.submit();

        }

        function uploadFinished(e, data) {
            self.spinner.stop();
            self.$("img").removeClass("disabled");
            self.$("input[type=file]").prop("disabled", false);
            self.$("a.action").removeClass("disabled");

            chorus.updateCachebuster();

            var json = $.parseJSON(data.result);
            if (json.status == "ok") {
                self.resource.serverErrors = [];
                self.resource.trigger("validated");
                self.model.trigger("image:change");
                self.$("img").attr('src', self.model.fetchImageUrl());
                self.$("img").removeClass("hidden");
            } else {
                self.resource.serverErrors = json.message;
                self.resource.trigger("saveFailed");
            }
        }
    }
});
