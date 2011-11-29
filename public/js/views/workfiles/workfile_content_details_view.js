(function($, ns) {
    ns.WorkfileContentDetails = ns.Base.extend({
        className : "workfile_content_details"
    },
    {
        buildFor : function(model) {
            if (model.isImage()) {
                return new ns.ImageWorkfileContentDetails({ model : model });
            } else {
                return new ns.WorkfileContentDetails({ model : model });
            }
        }
    });
})(jQuery, chorus.views);
