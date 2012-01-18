;(function(ns) {
    ns.models.Comment = ns.models.Activity.extend({
        urlTemplate: function() {
            if (this.isNew()) {
                return "comment/{{entityType}}/{{entityId}}"
            } else {
                return "comment/{{entityType}}/{{entityId}}/{{id}}";
            }
        },
        
        initialize: function() {
            this._super('initialize', arguments);
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

        uploadSuccess: function(file, response) {
            if (response && response.status == "fail") {
                this.fileUploadErrors++;
                this.serverErrors || (this.serverErrors = []);
                this.serverErrors = this.serverErrors.concat(response.message);
                file.serverErrors = response.message;
            }
            this.filesToBeSaved--;
            this.uploadComplete();
        },

        uploadFailed: function (file, e, response) {
            this.filesToBeSaved--;
            this.fileUploadErrors++;
            if (response == "abort") {
                this.message = this.message || t('notes.new_dialog.upload_cancelled')
                this.serverErrors = [{message: this.message}];
            }
            this.uploadComplete();
        },

        uploadComplete: function() {
            if (this.filesToBeSaved == 0) {
                if(this.fileUploadErrors > 0) {
                    this.trigger('fileUploadFailed');
                } else {
                    this.trigger('fileUploadSuccess');
                }
                this.trigger('fileUploadDone');
            }
        },

        saveFiles : function() {
            this.fileUploadErrors = 0;
            this.filesToBeSaved = this.files.length;
            _.each(this.files, _.bind(function(file) {
                file.data.url = this.url() + "/file";
                file.data.submit().done(_.bind(this.uploadSuccess, this, file))
                    .fail(_.bind(this.uploadFailed, this, file));
            }, this));
        }
    });
})(chorus);
