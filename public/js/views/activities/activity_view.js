chorus.views.Activity = chorus.views.Base.extend({
    className:"activity",
    tagName:"li",

    events: {
        "click a.promote": "promote"
    },

    subviews:{
        ".comment_list":"commentList"
    },

    context:function () {
        return new chorus.presenters.Activity(this.model, this.options)
    },

    setupSubviews:function () {
        this.commentList = new chorus.views.CommentList({ collection:this.model.comments() });
    },

    promote: function(e) {
        e.preventDefault();
        this.model.promoteToInsight();
    },

    postRender:function () {
        $(this.el).attr("data-activity-type", this.model.get("type"));
        $(this.el).attr("data-activity-id", this.model.get("id"));
        this.$("a.delete_link").data("activity", this.model);
    }
});
