chorus.views.Activity = chorus.views.Base.extend({
    constructorName: "ActivityView",
    className:"activity",
    tagName:"li",

    events: {
        "click a.promote": "promote",
        "click a.publish": "publish",
        "click a.unpublish": "unpublish"
    },

    subviews:{
        ".comment_list":"commentList",
        ".truncated_text": "htmlContent"
    },

    context:function () {
        return new chorus.presenters.Activity(this.model, this.options)
    },

    setupSubviews:function () {
        this.commentList = new chorus.views.CommentList({ collection: this.model.comments(), currentUserOwnsWorkspace: this.model.workspace() && this.model.workspace().currentUserIsOwner() });
        if (this.model.isUserGenerated()) {
            this.model.loaded = true;
            this.htmlContent = new chorus.views.TruncatedText({model: this.model, attribute: "text", attributeIsHtmlSafe: true});
        }
    },

    promote: function(e) {
        e.preventDefault();
        this.model.promoteToInsight({
            success: _.bind(function() {
                chorus.PageEvents.broadcast("insight:promoted", this.model)
            }, this)
        });
    },

    publish: function(e) {
        e.preventDefault();
        var alert = new chorus.alerts.PublishInsight({model: this.model, publish: true});
        alert.launchModal();
    },

    unpublish: function(e) {
        e.preventDefault();
        var alert = new chorus.alerts.PublishInsight({model: this.model, publish: false});
        alert.launchModal();
    },

    postRender:function () {
        $(this.el).attr("data-activity-type", this.model.get("type"));
        $(this.el).attr("data-activity-id", this.model.get("id"));
        this.$("a.delete_link, a.edit_link").data("activity", this.model);
        if (this.model.get("isInsight")) {
            $(this.el).addClass("insight");
        }
    },

    show: function() {
        this.htmlContent && this.htmlContent.show();
    }
});
