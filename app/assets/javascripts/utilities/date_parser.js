Date.formatForApi = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ");

Date.parseFromApi = function(str) {
    if(str) {
        return Date.formatForApi.parse(str);
    }
}
