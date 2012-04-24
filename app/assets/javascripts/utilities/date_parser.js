Date.parseFromApi = function(str) {
    var timezoneOffset = chorus.models.Config.instance().timezoneOffset();
    var match = str && str.match(/^(\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}:\d{2})/);
    if (match && match[1]) {
        var date = Date.parse(match[1], "yyyy-mm-dd H:m:s")
        if (timezoneOffset) date.setTimezoneOffset(timezoneOffset);
        return date;
    }
}

