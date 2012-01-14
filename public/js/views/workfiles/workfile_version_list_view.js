(function($, ns) {
    ns.views.WorkfileVersionList = ns.views.Base.extend({
        className : "workfile_version_list",

        collectionModelContext : function(workfileVersion) {
            var author = workfileVersion.modifier();
            var date = Date.parseFromApi(workfileVersion.get("lastUpdatedStamp"));
            var formattedDate = date.toString("MMMM dd, yyyy");
            return {
                authorName : author.displayName(),
                formattedDate : formattedDate,
                showUrl : workfileVersion.showUrl()
            }
        }
    });
})(jQuery, chorus);