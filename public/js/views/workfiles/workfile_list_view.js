(function($, ns) {
    ns.WorkfileList = chorus.views.Base.extend({
        tagName : "ul",
        className : "workfile_list",
        additionalClass : "list",
        events : {
            "click li" : "selectItem"
        },

        selectItem : function selectItem(e){
            if ($(e.currentTarget).hasClass("selected")) {
                // don't repeatedly raise events for the same item
                // e.g. the user clicks the item to highlight text
                return;
            }

            this.$("li").removeClass("selected");
            $(e.currentTarget).addClass("selected");
            var workfileId = $(e.currentTarget).data("id");
            var workfile = this.collection.get(workfileId);
            this.trigger("workfile:selected", workfile);
        },

        collectionModelContext : function(model) {
            var ctx = new chorus.presenters.Artifact(model, {iconSize : 'large'});

            var lastComment = model.lastComment();
            if (lastComment) {
                var date = Date.parseFromApi(lastComment.get("commentCreatedStamp"))

                ctx.lastComment = {
                    body : lastComment.get("body"),
                    creator : lastComment.creator(),
                    on : date && date.toString("MMM d")
                }

                ctx.otherCommentCount = parseInt(model.get("commentCount")) - 1;
            }

            return ctx;
        },

        filter: function(type){
            this.collection.attributes.type = type;
            this.collection.fetch();
            return this;
        },

        postRender : function() {
            this.$("li:first-child").click();
        }
    });
})(jQuery, chorus.views);
