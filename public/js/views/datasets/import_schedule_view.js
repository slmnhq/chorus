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

        _.defer(_.bind(function() {
            this.applyStyleToSelect();
        }, this));
    },

    additionalContext: function() {
        var now = new Date();
        var later = new Date(now);
        later.setMonth(now.getMonth() + 3);

        return {
            hours: _.range(1, 13),
            minutes: _.map(_.range(60), function(num) {
                return _.lpad(num, 2, "0");
            }),
            enable: this.options.enable,
            start: {
                month: now.getMonth() + 1,
                day: now.getDate(),
                year: now.getFullYear()
            },
            end: {
                 month: later.getMonth() + 1,
                 day: later.getDate(),
                 year: later.getFullYear()
             }
         }
    },

    enable: function() {
        this.$("select").prop("disabled", false);
        this.$("input:text").prop("disabled", false);

        var $start = this.$(".date.start input[name='year']");
        datePickerController.enable($start.attr("id"));

        var $end = this.$(".date.end input[name='year']");
        datePickerController.enable($end.attr("id"));

        this.applyStyleToSelect();
    },

    disable: function() {
        this.$("select").prop("disabled", true);
        this.$("input:text").prop("disabled", true);

        var $start = this.$(".date.start input[name='year']");
        datePickerController.disable($start.attr("id"));

        var $end = this.$(".date.end input[name='year']");
        datePickerController.disable($end.attr("id"));

        this.applyStyleToSelect();
    },

    applyStyleToSelect: function() {
        chorus.styleSelect(this.$("select.frequency"));
        chorus.styleSelect(this.$("select.hours"));
        chorus.styleSelect(this.$("select.minutes"));
        chorus.styleSelect(this.$("select.ampm"));
    }
});