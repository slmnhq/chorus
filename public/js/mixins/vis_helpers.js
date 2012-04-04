chorus.Mixins.VisHelpers = {
    labelFormat : function(label, maxLength) {
        maxLength = maxLength || (typeof label == "number" ? 6 : 15)

        if (!label) {
            return "";
        } else if ((typeof label == "number") && label.toString().length > maxLength){
            return label.toExponential(2)
        } else if(label.toString().length > maxLength) {
            return label.toString().slice(0, maxLength-1) + "..."
        } else {
            return label.toString();
        }
    },

    labelFormatKeepPercentage: function(label, maxLength) {
        if (/.*\(\d*%\)/.test(label)){
            var percentage = label.match(/\(\d*%\)/)[0];
            var name = label.split(/\(\d*%\)/)[0].trim();
            return this.labelFormat(name, 6) + " " + percentage;
        } else {
            return this.labelFormat(label, maxLength);
        }
    }
};
