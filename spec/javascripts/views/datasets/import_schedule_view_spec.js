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
    })
});