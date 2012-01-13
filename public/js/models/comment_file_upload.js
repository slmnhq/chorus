;(function(ns) {
    ns.models.CommentFileUpload = ns.models.Base.extend({
        initialize: function(data) {
            this.data = data;
        },

        cancelUpload: function() {
            if(this.data.jqXHR) {
                this.data.jqXHR.abort();
            }
        }
    });
})(chorus);