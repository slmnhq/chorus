chorus.views.WorkfileContent = chorus.views.Base.extend({
        templateName:"workfile_content"
    },
    {
        buildFor:function (model) {
            if (model.isImage()) {
                return new chorus.views.ImageWorkfileContent({ model:model });
            }

            if (model.isSql()) {
                return new chorus.views.SqlWorkfileContent({ model:model });
            }

            if (model.isText()) {
                return new chorus.views.TextWorkfileContent({ model:model });
            }

            if (model.isAlpine()) {
                return new chorus.views.AlpineWorkfileContent({ model:model });
            }

            return new chorus.views.WorkfileContent({ model:model });
        }
    });