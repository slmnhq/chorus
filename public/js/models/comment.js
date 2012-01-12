;
(function(ns) {
    ns.models.Comment = ns.models.Activity.extend({
        urlTemplate : "comment/{{entityType}}/{{entityId}}",

        initialize: function() {
            this.files = [];
        },

        declareValidations: function(newAttrs) {
            this.require('body', newAttrs);
        },

        attrToLabel : {
            "body" : "notes.body"
        },

        beforeSave: function() {
            if (this.workfiles) {
                var workfileIds = this.workfiles.map(
                    function(workfile) {
                        return workfile.get("id");
                    }).join(",");
                this.set({ workfileIds: workfileIds }, { silent: true });
            }
        },

        note: function() {
            return !!this.get('type');
        },

        addFileUpload: function(uploadModel) {
            this.files.push(uploadModel);
        },

        removeFileUpload: function(uploadModel) {
            this.files.splice(this.files.indexOf(uploadModel), 1);
        },

        uploadSuccess: function() {
            this.filesToBeSaved--;
            this.uploadComplete();
        },

        uploadFailed: function () {
            this.filesToBeSaved--;
            this.fileUploadErrors++;
            this.uploadComplete();
        },

        uploadComplete: function() {
            if (this.filesToBeSaved == 0) {
                if(this.fileUploadErrors > 0) {
                    this.trigger('fileUploadFailed');
                } else {
                    this.trigger('fileUploadSuccess');
                }
            }
        },

        saveFiles : function() {
            this.fileUploadErrors = 0;
            this.filesToBeSaved = this.files.length;
            _.each(this.files, _.bind(function(file) {
                file.data.url = this.url() + "/" + this.get('id') + "/file";
                file.data.submit().done(_.bind(this.uploadSuccess, this))
                    .fail(_.bind(this.uploadFailed, this));
            }, this));
        }
    });
})(chorus);
