chorus.views.ImportSchedule = chorus.views.Base.extend({
    className: "import_schedule",

    postRender: function() {
        chorus.datePicker({
            "%Y": this.$(".date.year"),
            "%m": this.$(".date.month"),
            "%d": this.$(".date.day")
        });
    },

    additionalContext: function() {
        return {
            hours: _.range(1, 13),
            minutes: _.map(_.range(60), function(num) {
                return _.lpad(num, 2, "0");
            })
        }
    }
});