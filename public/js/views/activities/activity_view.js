;(function($, ns) {
    var compiledTemplates = {};
    var activityTemplateRegex = /^activity_stream\.header\.html\.(\w+)$/;

    // $.i18n.map isn't populated until the first call to t(), so let's call it here in case we run a scoped spec.
    t("");

    _.each($.i18n.map, function(value, key) {
        var match = key.match(activityTemplateRegex);
        if (match) {
             //get handlebars template from i!8n (not kidding, I'm serious)
            compiledTemplates[match[1]] = Handlebars.compile(t(match[0]));
        }
    });

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
            var template = compiledTemplates[type] || compiledTemplates['DEFAULT'];

            return template(presenter.header);
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
