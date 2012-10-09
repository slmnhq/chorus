chorus.models.TypeAheadSearchResult = chorus.models.SearchResult.extend({
    constructorName: "TypeAheadSearchResult",
    urlTemplate: "search/type_ahead/",
    numResultsPerPage: 3,

    results: function() {
        var typeAhead = this.get('typeAhead');

        if (!typeAhead) { return []; }
        return _.compact(_.map(typeAhead.results, function(result) {
            switch (result.entityType) {
                case "user":
                    return new chorus.models.User(result);
                    break;
                case "workspace":
                    return new chorus.models.Workspace(result);
                    break;
                case "workfile":
                    return new chorus.models.Workfile(result);
                    break;
                case "hdfs_file":
                    return new chorus.models.HdfsEntry(result);
                    break;
                case "dataset":
                    return new chorus.models.Dataset(result);
                    break;
                case "chorus_view":
                    return new chorus.models.ChorusView(result);
                    break;
                case "greenplum_instance":
                    return new chorus.models.GreenplumInstance(result);
                    break;
                case "hadoop_instance":
                    return new chorus.models.HadoopInstance(result);
                    break;
                case "attachment":
                    return new chorus.models.Attachment(result);
                default:
                    break;
            }
        }));
    },

    isPaginated: function() {
        return true;
    }
});
