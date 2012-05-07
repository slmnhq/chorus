/*
 *   based on a plugin found here:
 *   http://www.filamentgroup.com
 */

jQuery.download = function(url, data, method) {
    var form = $("<form/>").attr({
        "action": url,
        "method": method || "post"
    });

    $.each(data, function(key, val) {
        form.append($("<input/>").attr({
            "name": key,
            "value": val
        }));
    });

    form.appendTo("body").submit().remove();
};

