chorus.dialogs.WorkfilesImport = chorus.dialogs.Base.extend({
    constructorName: "WorkfilesImport",

    templateName: "workfiles_import",
    title: t("workfiles.import_dialog.title"),

    persistent: true,

    events: {
        "change input[name=workfile[description]]": "descriptionChanged",
        "paste input[name=workfile[description]]": "descriptionChanged",
        "keyup input[name=workfile[description]]": "descriptionChanged",
        "click button.submit": "upload",
        "submit form": "upload",
        "click button.choose": "chooseFile"
    },

    makeModel: function() {
        this.model = this.model || new chorus.models.Workfile({workspace: { id: this.options.workspaceId } });
    },

    setup: function() {
        var self = this;

        this.config = chorus.models.Config.instance();

        $(document).one('close.facebox', function() {
            if (self.request) {
                self.request.abort();
            }
        });

        this._super("setup");
    },

    upload: function(e) {
        if (e) {
            e.preventDefault();
        }
        if (this.uploadObj) {
            this.request = this.uploadObj.submit();
            this.$("button.submit").startLoading("workfiles.import_dialog.uploading");
        }
    },

    closeModal: function(e) {
        if (e) {
            e.preventDefault();
        }
        if (this.request) {
            this.request.abort();
        }
        this._super("closeModal");
    },

    chooseFile: function(e) {
        e.preventDefault();
        this.$("input").click();
    },

    descriptionChanged: function(e) {
        this.$("button.submit").prop("disabled", false);
    },

    postRender: function() {
        var self = this;

        // dataType: 'text' is necessary for FF3.6
        // see https://github.com/blueimp/jQuery-File-Upload/issues/422
        // see https://github.com/blueimp/jQuery-File-Upload/blob/master/jquery.iframe-transport.js
        this.$("input[type=file]").fileupload({
            change: fileChosen,
            add: fileChosen,
            done: uploadFinished,
            fail: uploadFailed,
            dataType: "text"
        });

        function fileChosen(e, data) {
            if (data.files.length > 0) {
                self.$(".defaultText").addClass("hidden");
                self.$("button.submit").prop("disabled", false);
                self.uploadObj = data;
                var filename = data.files[0].name;
                self.uploadExtension = _.last(filename.split('.'));
                var iconSrc = chorus.urlHelpers.fileIconUrl(self.uploadExtension, "medium");
                self.$('img').attr('src', iconSrc);
                self.$('.fileName').text(filename).attr('title', filename);
                self.$("form").addClass("chosen");

                validateFile(data.files);
            }
        }

        function validateFile(files) {
            self.clearErrors();
            if (!self.model) return;

            var maxFileSize = self.config.get("fileSizesMbWorkfiles");

            _.each(files, function(file) {
                if (file.size > (maxFileSize * 1024 * 1024)) {
                    self.model.serverErrors = {"fields":{"base":{"FILE_SIZE_EXCEEDED":{"count":maxFileSize}}}}
                    self.showErrors(self.model);
                }
            }, self);
        }

        // TODO: abstract away all of this JSON parsing into some model
        function uploadFinished(e, json) {
            self.model = new chorus.models.Workfile();
            self.model.set(self.model.parse(JSON.parse(json.result)));
            chorus.toast('workfiles.uploaded', {fileName: self.model.get("fileName")});
            self.closeModal();
            chorus.router.navigate(self.model.showUrl());
        }

        function uploadFailed(e, json) {
            e.preventDefault();
            try {
                self.resource.serverErrors = JSON.parse(json.jqXHR.responseText).errors;
            } catch(error) {
                var status = json.jqXHR.status;
                var statusText = json.jqXHR.statusText;
                self.displayNginxError(status, statusText);
            }
            self.$("button.submit").stopLoading();
            self.$("button.submit").prop("disabled", true);
            self.resource.trigger("saveFailed");
        }
    },

    displayNginxError: function(status, statusText) {
        this.model.serverErrors = {"fields":{"base":{GENERIC:{message: status + ": " + statusText }}}}
    }
});
