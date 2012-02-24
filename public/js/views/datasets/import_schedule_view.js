chorus.views.ImportSchedule = chorus.views.Base.extend({
    className: "import_schedule",

    postRender: function() {
        chorus.datePicker({
            "%Y": this.$(".date.start input[name='year']"),
            "%m": this.$(".date.start input[name='month']"),
            "%d": this.$(".date.start input[name='day']")
        });

        chorus.datePicker({
            "%Y": this.$(".date.end input[name='year']"),
            "%m": this.$(".date.end input[name='month']"),
            "%d": this.$(".date.end input[name='day']")
        });

        var $btn = this.$("a.date-picker-control");
        $btn.bind("click", function() {
            $(".date-picker").css("z-index", 20000);
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