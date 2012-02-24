chorus.views.SearchResultList = chorus.views.Base.extend({
    className: "search_result_list",

    subviews: {
        ".workfile_list": "workfileList"
    },

    setup: function() {
        this.workfileList = new chorus.views.SearchWorkfileList({workfileResults : this.options.searchResult.get("workfile")});
    }
})