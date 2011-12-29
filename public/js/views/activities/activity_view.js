;(function($, ns) {
    ns.views.Activity = chorus.views.Base.extend({

        className : "activity",
        tagName :  "li",


        subviews: {
            ".comment_list": "commentList"
        },

        context : function() {
            var presenter = new chorus.presenters.Activity(this.model)
            return _.extend({}, presenter, { headerHtml : this.headerHtml(presenter) })
        },

        headerHtml : function(presenter) {
            var type = this.model.get("type");
            if (!I18n.lookup('activity_stream.header.html.' + type)) type = "DEFAULT";
            return t('activity_stream.header.html.' + type, presenter.header)
        },

        setupSubviews: function() {
            this.commentList = new ns.views.CommentList({ collection: this.model.comments() });
        },


        postRender : function(){
            $(this.el).
                attr("data-activity-type", this.model.get("type")).
                attr("data-activity-id", this.model.get("id"))
        }
    });
})(jQuery, chorus);
