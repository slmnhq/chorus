chorus.views.WorkfileVersionList = chorus.views.Base.extend({
    constructorName: "WorkfileVersionListView",
    templateName: "workfile_version_list",
    tagName: "ul",

    collectionModelContext: function(workfileVersion) {
        var author = workfileVersion.modifier();
        var date = Date.parseFromApi(workfileVersion.get("versionInfo").updatedAt);
        var formattedDate = date.toString("MMMM dd, yyyy");
        return {
            authorName: author.displayName(),
            formattedDate: formattedDate,
            showUrl: workfileVersion.showUrl()
        }
    }
});
