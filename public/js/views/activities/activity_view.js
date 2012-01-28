chorus.views.Activity = chorus.views.Base.extend({

    className:"activity",
    tagName:"li",


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
        $(this.el).
            attr("data-activity-type", this.model.get("type")).
            attr("data-activity-id", this.model.get("id"))
    }
});