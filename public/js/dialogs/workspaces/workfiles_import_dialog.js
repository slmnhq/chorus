(function($, ns) {
    ns.WorkfilesImport = chorus.dialogs.Base.extend({
        className : "workfiles_import",
        title : t("workfiles.import_dialog.title"),

        persistent: true,

        events : {
            "click button.submit" : "upload",
            "submit form": "upload",
            "click button.cancel" : "cancelUploadAndClose"
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.Workfile({workspaceId : this.options.launchElement.data("workspace-id")})
        },

        setup : function() {
            var self = this;
            $(document).one('close.facebox', function() {
                if (self.request) {
                    self.request.abort();
                }
            });
        },

        upload : function(e) {
            if(e) {e.preventDefault();}
            if (this.uploadObj) {
                this.request = this.uploadObj.submit();
                var spinner = new Spinner({
                    lines: 12,
                    length: 3,
                    width: 2,
                    radius: 3,
                    color: '#000',
                    speed: 1,
                    trail: 75,
                    shadow: false
                }).spin();
                this.$("button.submit").
                    text(t("workfiles.import_dialog.uploading")).
                    append(spinner.el).
                    attr("disabled", "disabled").
                    addClass("expanded");
            }
        },

        cancelUploadAndClose : function(e) {
            e.preventDefault();
            if (this.request) {
                this.request.abort();
            }

            this.closeModal();
        },

        chooseFile : function(e) {
            e.preventDefault();
            this.$("input").click();
        },

        postRender : function() {
            var self = this;
            // FF3.6 fails tests with multipart true, but it will only upload in the real world with multipart true
            var multipart = !window.jasmine;

            // dataType: 'text' is necessary for FF3.6
            // see https://github.com/blueimp/jQuery-File-Upload/issues/422
            // see https://github.com/blueimp/jQuery-File-Upload/blob/master/jquery.iframe-transport.js
            this.$("input[type=file]").fileupload({
                change : fileChosen,
                add : fileChosen,
                done : uploadFinished,
                multipart : multipart,
                dataType : "text"
            });

            function fileChosen(e, data) {
                if (data.files.length > 0) {
                    self.$("button.submit").removeAttr("disabled");
                    self.uploadObj = data;
                    var filename = data.files[0].name;
                    self.uploadExtension = _.last(filename.split('.'));
                    var iconSrc = chorus.urlHelpers.fileIconUrl(self.uploadExtension, "medium");
                    self.$('img').attr('src', iconSrc);
                    self.$('.fileName').text(filename);
                    self.$("form").addClass("chosen");
                }
            }

            function uploadFinished(e, data) {
                var json = $.parseJSON(data.result)
                if (json.status == "ok") {
                    self.model.set({id: json.resource[0].id});
                    self.closeModal();
                    var url;
                    if (self.uploadExtension.toLowerCase() == "txt" || self.uploadExtension.toLowerCase() == "sql") {
                        url = self.model.showUrl();
                    } else {
                        url = self.model.workspace.showUrl() + "/workfiles"
                    }

                    chorus.router.navigate(url, true);
                }
                else {
                    e.preventDefault();
                    self.resource.serverErrors = json.message;
                    self.$("button.submit").
                        text(t("workfiles.button.import")).
                        removeClass("expanded");

                    // $.text(val) clears the selected element, so .text here kills the spinner inside the button.

                    self.resource.trigger("saveFailed");
                }
            }
        }
    });
})(jQuery, chorus.dialogs);
