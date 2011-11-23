(function($, ns) {
    ns.WorkfilesImport = chorus.dialogs.Base.extend({
        className : "workfiles_import",
        title : t("workfiles.import_dialog.title"),

        persistent: true,

        events : {
            "click button.submit" : "upload",
            "click button.cancel" : "cancelUploadAndClose"
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.Workfile({workspaceId : this.options.workspaceId})
        },

        upload : function(e) {
            e.preventDefault();
            if (this.uploadObj) {
                this.request = this.uploadObj.submit();
            }
            this.$("button.submit").attr("disabled", "disabled");
        },

        cancelUploadAndClose : function(e) {
            e.preventDefault();
            if (this.request) {
                this.request.abort();
            }

            this.closeDialog();
        },

        postRender : function() {
            var self = this;
            var updateName = function(e,data) {
                if (data.files.length > 0) {
                    self.$("button.submit").removeAttr("disabled");
                    self.uploadObj = data;
                    var filename = data.files[0].fileName;
                    var iconSrc = chorus.urlHelpers.fileIconUrl(_.last(filename.split('.')));
                    self.$('img').attr('src', iconSrc);
                    self.$('span.fileName').text(filename);
                }
            }

            var uploadFinished = function(){
                self.closeDialog();
                chorus.router.navigate("/workspace/" + self.options.workspaceId + "/workfiles", true);
            }
            
            this.$("input[type=file]").fileupload({
                change : updateName,
                add : updateName,
                done : uploadFinished
            });
        }
    });
})(jQuery, chorus.dialogs);
