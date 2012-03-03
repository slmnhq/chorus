describe("chorus.views.ImportSchedule", function() {
    beforeEach(function() {
        this.view = new chorus.views.ImportSchedule();
        this.view.render();
    });

    describe("#fieldValues", function() {
        beforeEach(function() {
            this.view.$(".start input[name='year']").val("2012");
            this.view.$(".start input[name='month']").val("02");
            this.view.$(".start input[name='day']").val("29");

            this.view.$(".end input[name='year']").val("2012");
            this.view.$(".end input[name='month']").val("03");
            this.view.$(".end input[name='day']").val("21");

            this.view.$("select.ampm").val("PM");
            this.view.$("select.hours").val("1");
            this.view.$("select.minutes").val("09");

            this.view.$("select.frequency").val("MONTHLY");

            this.attrs = this.view.fieldValues();
        });

        it("returns a properly formatted start time and end time", function() {
            expect(this.attrs.scheduleStartTime).toBe("2012-02-29 13:09:00.0");
            expect(this.attrs.scheduleEndTime).toBe("2012-03-21")
        });

        it("handles the case of '12 pm' correctly", function() {
            this.view.$("select.ampm option").val("PM");
            this.view.$("select.hours option").val("12");

            expect(this.view.fieldValues().scheduleStartTime).toBe("2012-02-29 12:09:00.0");
        });

        it("handles the case of '12 am' correctly", function() {
            this.view.$("select.ampm option").val("AM");
            this.view.$("select.hours option").val("12");

            expect(this.view.fieldValues().scheduleStartTime).toBe("2012-02-29 00:09:00.0");
        });

        it("has the right frequency value", function() {
            expect(this.attrs.scheduleFrequency).toBe("MONTHLY");
        });
    });

    describe("#setFieldValues(model)", function() {
        beforeEach(function() {
            var importModel = fixtures.datasetImport({
                id: '12',
                truncate: true,
                scheduleInfo: {
                    endTime: "2013-05-27",
                    startTime: "2013-02-21 13:30:00.0",
                    frequency: "MONTHLY"
                }
            });
            this.view.setFieldValues(importModel);
        });

        it("selects the right frequency", function() {
            expect(this.view.$(".frequency").val()).toBe("MONTHLY");
        });

        it("selects the right start date", function() {
            expect(this.view.$(".start input[name='year']").val()).toBe("2013");
            expect(this.view.$(".start input[name='month']").val()).toBe("2");
            expect(this.view.$(".start input[name='day']").val()).toBe("21");
            expect(this.view.$("select.hours").val()).toBe("1");
            expect(this.view.$("select.minutes").val()).toBe("30");
            expect(this.view.$("select.ampm").val()).toBe("PM");
        });

        it("selects the right end date", function() {
            expect(this.view.$(".end input[name='year']").val()).toBe("2013");
            expect(this.view.$(".end input[name='month']").val()).toBe("5");
            expect(this.view.$(".end input[name='day']").val()).toBe("27");
        });
    });

    it("should have a select with daily, weekly, monthly as options", function() {
        expect(this.view.$(".frequency option[value=DAILY]")).toContainTranslation("import.frequency.daily");
        expect(this.view.$(".frequency option[value=WEEKLY]")).toContainTranslation("import.frequency.weekly");
        expect(this.view.$(".frequency option[value=MONTHLY]")).toContainTranslation("import.frequency.monthly");

        expect(this.view.$(".frequency").val()).toBe("WEEKLY");
    });

    it("should have an hour picker", function() {
        expect(this.view.$(".hours option").length).toBe(12);
        expect(this.view.$(".hours").val()).toBe("1");
        expect(this.view.$(".hours option:selected").text().trim()).toBe("1");
    });

    it("should have an minute picker", function() {
        expect(this.view.$(".minutes option").length).toBe(60);
        expect(this.view.$(".minutes").val()).toBe("00");
        expect(this.view.$(".minutes option:selected").text().trim()).toBe("00");
    });

    it("should have AM/PM picker", function() {
        expect(this.view.$(".ampm option").length).toBe(2);
        expect(this.view.$(".ampm").val()).toBe("AM");
        expect(this.view.$(".ampm option:selected").text().trim()).toBe("AM");
    });

    describe("enable/disable schedule", function() {
        beforeEach(function() {
            this.view.disable();
        });

        itShouldDisableTheControls();

        context("when the controls are disabled", function() {
            beforeEach(function() {
                this.view.enable();
            });

            itShouldEnableTheControls();
        });
    });

    describe("the start date picker", function() {
        it("should have a label", function() {
            expect(this.view.$(".date.start .label")).toContainTranslation("import.start.label");
        });

        it("should have the correct placeholder text", function() {
            expect(this.view.$(".date.start input[name='month']").attr("placeholder")).toContainTranslation("datepicker.placeholder.month");
            expect(this.view.$(".date.start input[name='day']").attr("placeholder")).toContainTranslation("datepicker.placeholder.day");
            expect(this.view.$(".date.start input[name='year']").attr("placeholder")).toContainTranslation("datepicker.placeholder.year");
        });

        it("should have the default date set to today", function() {
            var now = new Date();
            expect(this.view.$(".date.start input[name='month']").val()).toBe((now.getMonth() + 1).toString());
            expect(this.view.$(".date.start input[name='day']").val()).toBe((now.getDate()).toString());
            expect(this.view.$(".date.start input[name='year']").val()).toBe((now.getFullYear()).toString());
        });
    });

    describe("the end date picker", function() {
        it("should have a label", function() {
            expect(this.view.$(".date.end .label")).toContainTranslation("import.end.label");
        });

        it("should have the correct placeholder text", function() {
            expect(this.view.$(".date.end input[name='month']").attr("placeholder")).toContainTranslation("datepicker.placeholder.month");
            expect(this.view.$(".date.end input[name='day']").attr("placeholder")).toContainTranslation("datepicker.placeholder.day");
            expect(this.view.$(".date.end input[name='year']").attr("placeholder")).toContainTranslation("datepicker.placeholder.year");
        });

        it("should have the default date set to three months from today", function() {
            var now = new Date();
            now.setMonth(now.getMonth() + 3);
            expect(this.view.$(".date.end input[name='month']").val()).toBe((now.getMonth() + 1).toString());
            expect(this.view.$(".date.end input[name='day']").val()).toBe((now.getDate()).toString());
            expect(this.view.$(".date.end input[name='year']").val()).toBe((now.getFullYear()).toString());
        });
    });

    function itShouldEnableTheControls() {

        it("should enable the start date picker", function() {
             expect(this.view.$(".date.start input[name='year']")).toBeEnabled();
             expect(this.view.$(".date.start input[name='month']")).toBeEnabled();
             expect(this.view.$(".date.start input[name='day']")).toBeEnabled();
        });

        it("should enable the end date picker", function() {
             expect(this.view.$(".date.end input[name='year']")).toBeEnabled();
             expect(this.view.$(".date.end input[name='month']")).toBeEnabled();
             expect(this.view.$(".date.end input[name='day']")).toBeEnabled();
        });

        it("should enable the time picker", function() {
            expect(this.view.$(".frequency")).toBeEnabled();
            expect(this.view.$(".hours")).toBeEnabled();
            expect(this.view.$(".minutes")).toBeEnabled();
            expect(this.view.$(".ampm")).toBeEnabled();
        });
    }

    function itShouldDisableTheControls() {

        it("should disable the start date picker", function() {
             expect(this.view.$(".date.start input[name='year']")).toBeDisabled();
             expect(this.view.$(".date.start input[name='month']")).toBeDisabled();
             expect(this.view.$(".date.start input[name='day']")).toBeDisabled();
        });

        it("should disable the end date picker", function() {
             expect(this.view.$(".date.end input[name='year']")).toBeDisabled();
             expect(this.view.$(".date.end input[name='month']")).toBeDisabled();
             expect(this.view.$(".date.end input[name='day']")).toBeDisabled();
        });

        it("should disable the time picker", function() {
            expect(this.view.$(".frequency")).toBeDisabled();
            expect(this.view.$(".hours")).toBeDisabled();
            expect(this.view.$(".minutes")).toBeDisabled();
            expect(this.view.$(".ampm")).toBeDisabled();
        });
    }
});
