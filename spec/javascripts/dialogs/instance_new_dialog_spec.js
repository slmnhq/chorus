describe("InstanceNewDialog", function() {
    beforeEach(function() {
        this.launchElement = $("<button/>");
        this.dialog = new chorus.dialogs.InstancesNew({launchElement : this.launchElement});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });

        it("starts with no radio buttons selected", function() {
            expect(this.dialog.$("input[type=radio]:checked").length).toBe(0);
        });

        it("starts with all fieldsets collapsed", function() {
            expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(0);
        });

        describe("selecting a radio button", function() {
            beforeEach(function() {
                // Only setting attr("checked", true) doesn't raise change event.
                this.dialog.$("input[type=radio]").eq(0).attr('checked', true).change();
            });

            it("removes the collapsed class from only that radio button", function() {
                expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(1);
                expect(this.dialog.$("input[type=radio]:checked").closest("fieldset")).not.toHaveClass("collapsed");
            });

            context("clicking another radio", function() {
                it("has only one that is not collapsed", function() {
                    this.dialog.$("input[type=radio]").eq(0).attr('checked', false).change();
                    this.dialog.$("input[type=radio]").eq(1).attr('checked', true).change();

                    expect(this.dialog.$("fieldset").not(".collapsed").length).toBe(1);
                    expect(this.dialog.$("input[type=radio]:checked").closest("fieldset")).not.toHaveClass("collapsed");
                });
            });
        });
    });
});