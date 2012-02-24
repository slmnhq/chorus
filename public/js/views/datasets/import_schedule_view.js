chorus.views.ImportSchedule = chorus.views.Base.extend({
    className: "import_schedule",

    additionalContext: function() {
        return {
            hours: _.range(1, 13),
            minutes: _.map(_.range(60), function(num) {
                return _.lpad(num, 2, "0");
            })
        }
    }
});