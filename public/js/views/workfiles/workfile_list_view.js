(function($, ns) {
    ns.WorkfileList = chorus.views.Base.extend({
        tagName : "ul",
        className : "workfile_list",
        additionalClass : "list",
        events : {
            "click li" : "selectItem"
        },

        selectItem : function selectItem(e){
            this.$("li").removeClass("selected");
            $(e.currentTarget).addClass("selected");
            var workfileId = $(e.currentTarget).data("id");
            var workfile = this.collection.get(workfileId);
            this.trigger("workfile:selected", workfile);
        },

        collectionModelContext : function(model) {
            var isOther = !(model.isImage() || model.isText());
            var lastComment = model.lastComment();
            return {
                iconUrl : chorus.urlHelpers.fileIconUrl(model.get('fileType')),
                showUrl : isOther ? model.downloadUrl() : model.showUrl(),
                lastComment : lastComment && {
                    body : lastComment.get("body"),
                    creatorName : lastComment.creator().displayName()
                }
            };
        },

        filter: function(type){
            this.collection.attributes.type = type;
            this.collection.fetch();
            return this;
        }
    });
})(jQuery, chorus.views);
