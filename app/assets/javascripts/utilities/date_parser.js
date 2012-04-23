Date.parseFromApi = function(str) {
    var match = str && str.match(/^(\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{2}:\d{2})/)
    return match && match[1] && Date.parse(match[1], "yyyy-mm-dd H:m:s")
}

