;(function($, ns) {
    ns.WorkfileContent = ns.Base.extend({
        className : "workfile_content"
    },
    {
        buildFor : function(model) {
            if (model.isImage()) {
                return new ns.ImageWorkfileContent({ model : model });
            } else {
                return new ns.WorkfileContent({ model : model });
            }
        }
    });

})(jQuery, chorus.views);