;
(function($, ns) {
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
            return t(this.headerTranslationKey(), presenter.header)
        },

        headerTranslationKey : function() {
            var prefix = 'activity_stream.header.html.';
            var type = this.model.get("type");
            if (!I18n.lookup(prefix + type)) {
                type = 'DEFAULT';
            }
            var styles = _.flatten([this.options.displayStyle, 'default']);

            prefix = prefix + type + '.';
            return prefix +  _.find(styles, function(style) {
                return I18n.lookup(prefix + style);
            });
        },

        setupSubviews: function() {
            this.commentList = new ns.views.CommentList({ collection: this.model.comments() });
        },


        postRender : function() {
            $(this.el).
                attr("data-activity-type", this.model.get("type")).
                attr("data-activity-id", this.model.get("id"))
        }
    });
})(jQuery, chorus);
