chorus.views.Activity = chorus.views.Base.extend({
    className:"activity",
    tagName:"li",

    events:{
        "click a.delete_link":"deleteActivity"
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

    postRender:function () {
        $(this.el).attr("data-activity-type", this.model.get("type"));
        $(this.el).attr("data-activity-id", this.model.get("id"))
    },

    deleteActivity: function(e) {
        e && e.preventDefault();
        console.log(this.model)
        this.model.destroy();
        this.model.clear();
    }
});
