(function($, ns) {
    ns.WorkfileList = chorus.views.Base.extend({
        tagName : "ul",
        className : "workfile_list",
        events : {
            "click li" : "selectItem"
        },
        selectItem : function selectItem(e){
            e.preventDefault();
            this.$("li").removeClass("selected");
            $(e.currentTarget).addClass("selected");
        }
    });
})(jQuery, chorus.views);
