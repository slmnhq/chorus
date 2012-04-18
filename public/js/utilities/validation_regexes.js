chorus.ValidationRegexes = (function(){
    var chorusIdentifier64 = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;
    var chorusIdentifierLower64 = /^[a-z][a-z0-9_]{0,63}$/;
    var chorusIdentifier = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    var safePgName = /^[a-z_][a-z0-9_"]*$|^".*"$/; // TODO: catch quoted strings that contain unescaped quotes
    var allWhitespace = /^\s*$/;
    var time = /^(\d{1,2}(:\d{2}){1,2})?$/;
    var year = /^[0-9]{1,4}$/;
    var month = /^(0?[1-9]|1[0-2])$/;
    var day = /^(0?[1-9]|[12][0-9]|3[01])$/;
    var boolean = /^(true|false)$/;
    var onlyDigits = /^\d+$/

    return {
        ChorusIdentifier64: function() {
            return chorusIdentifier64;
        },

        ChorusIdentifierLower64: function() {
            return chorusIdentifierLower64;
        },

        ChorusIdentifier: function(length) {
            if (length) {
                return new RegExp("^[a-zA-Z][a-zA-Z0-9_]{0," + (length - 1) + "}$");
            }

            return chorusIdentifier;
        },

        ChorusIdentifierLower: function(length) {
            if (length) {
                return new RegExp("^[a-z][a-z0-9_]{0," + (length - 1) + "}$");
            }

            return chorusIdentifier;
        },

        Password: function(options) {
            if (options) {
                var min = options.min || "0";
                var max = options.max || "";
                return new RegExp("^.{" + min + "," + max + "}$");
            }
        },

        SafePgName: function() {
            return safePgName;
        },

        AllWhitespace: function() {
            return allWhitespace;
        },

        Time: function() {
            return time;
        },

        Year: function() {
            return year;
        },

        Month: function() {
            return month;
        },

        Day: function() {
            return day;
        },

        Boolean: function() {
            return boolean;
        },

        OnlyDigits: function() {
            return onlyDigits;
        }
    }
})();