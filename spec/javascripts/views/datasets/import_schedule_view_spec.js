describe("chorus.views.ImportSchedule", function() {
    beforeEach(function() {
        this.view = new chorus.views.ImportSchedule();
        this.view.render();
    });

    it("should have a select with daily, weekly, monthly as options", function() {
        expect(this.view.$(".frequency option[value=DAILY]")).toContainTranslation("import_now.frequency.daily");
        expect(this.view.$(".frequency option[value=WEEKLY]")).toContainTranslation("import_now.frequency.weekly");
        expect(this.view.$(".frequency option[value=MONTHLY]")).toContainTranslation("import_now.frequency.monthly");

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
        expect(this.view.$(".ampm").val()).toBe("0");
        expect(this.view.$(".ampm option:selected").text().trim()).toBe("AM");
    });

    describe("the start date picker", function() {
        it("should have a label", function() {
            expect(this.view.$(".date.start .label")).toContainTranslation("import_now.start.label");
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
            expect(this.view.$(".date.end .label")).toContainTranslation("import_now.end.label");
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
});