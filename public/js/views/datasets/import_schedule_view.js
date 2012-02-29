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

        _.defer(_.bind(function() {
            this.applyStyleToSelect();
        }, this));
    },

    fieldValues: function() {
        var startTime = new Date();
        var endTime   = new Date();

        startTime.set({
            year:   parseInt(this.$(".start input[name='year']").val(), 10),
            month:  parseInt(this.$(".start input[name='month']").val(), 10) - 1,
            day:    parseInt(this.$(".start input[name='day']").val(), 10),
            hour:   parseInt(this.$("select.hours").val(), 10),
            minute: parseInt(this.$("select.minutes").val(), 10)
        });

        var isPM = this.$("select.ampm").val() === "PM";
        if (isPM && startTime.getHours() < 12) startTime.addHours(12);
        if (!isPM && startTime.getHours() === 12) startTime.addHours(-12);

        endTime.set({
            year:   parseInt(this.$(".end input[name='year']").val()),
            month:  parseInt(this.$(".end input[name='month']").val()) - 1,
            day:    parseInt(this.$(".end input[name='day']").val())
        });

        return {
            scheduleStartTime : startTime.toString("yyyy-MM-dd HH:mm" + ":00.0"),
            scheduleEndTime   : endTime.toString("yyyy-MM-dd"),
            scheduleFrequency : this.$("select.frequency").val()
        }
    },

    setFieldValues: function(model) {
        var startTime = Date.parse(model.startTime());
        this.$(".start input[name='year']").val(startTime.toString("yyyy"));
        this.$(".start input[name='month']").val(startTime.toString("M"));
        this.$(".start input[name='day']").val(startTime.toString("dd"));
        this.$("select.hours").val(startTime.toString("h"));
        this.$("select.minutes").val(startTime.toString("mm"));
        this.$("select.ampm").val((startTime.getHours() > 12) ? "PM" : "AM");

        var endTime = Date.parse(model.endTime());
        this.$(".end input[name='year']").val(endTime.toString("yyyy"));
        this.$(".end input[name='month']").val(endTime.toString("M"));
        this.$(".end input[name='day']").val(endTime.toString("dd"));

        this.$(".frequency option").val(model.get("scheduleFrequency"));
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
