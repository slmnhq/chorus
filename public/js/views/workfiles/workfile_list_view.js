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
            return {
                iconUrl : chorus.urlHelpers.fileIconUrl(model.get('fileType')),
                showUrl : model.showUrl()
            }
        },

        filter: function(type){
            this.collection.attributes.type = type;
            this.collection.fetch();
            return this;
        }
    });
})(jQuery, chorus.views);
