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
    }
};
