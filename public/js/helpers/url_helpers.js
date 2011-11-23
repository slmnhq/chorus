;(function($, ns){
    ns.urlHelpers = ns.urlHelpers || {};

    // This mapping actually maps file extensions AND workfile 'fileType' attributes to filename values.
    var map = {
        "c" : "c",
        "c++" : "cplusplus",
        "cpp" : "cplusplus",
        "java" : "java",
        "sql" : "sql",
        "txt" : "text",
        "html" : "html",
        "xml" : "xml"
    }

    ns.urlHelpers.fileIconUrl = function fileIconUrl(key) {
         return "/images/workfileIcons/" + (map[key.toLowerCase()] || "binary") + ".png";
    }
})(jQuery, chorus);