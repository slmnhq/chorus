describe("chorus.dialogs.Visualization", function() {
    beforeEach(function() {
        this.launchElement = $('<a data-name="Foo"/>')
        this.dialog = new chorus.dialogs.Visualization({launchElement : this.launchElement});
    });

    describe("#render", function() {
        beforeEach(function() {
            this.dialog.render();
        });
        
        it("should have a title", function() {
            expect(this.dialog.title).toMatchTranslation("visualization.title", {name: "Foo"});
        });

        it("should have a 'Show Data Table' link", function() {
            expect(this.dialog.$(".controls a.show").text().trim()).toMatchTranslation("visualization.show_table")
        });

        it("should have a 'Hide Data Table' link", function() {
            expect(this.dialog.$(".controls a.hide").text().trim()).toMatchTranslation("visualization.hide_table");
        });

        it("should have a 'Save As' button", function() {
            expect(this.dialog.$("button.save").text().trim()).toMatchTranslation("actions.save_as");
        });

        it("should have a 'Close' button", function() {
            expect(this.dialog.$("button.close_dialog").text().trim()).toMatchTranslation("actions.close");
        });

        describe("the results console", function() {
            it("should be hidden", function() {
                expect(this.dialog.$(".results_console")).toHaveClass("hidden");
            });

            it("should show a 'Show Data Table' link", function() {
                expect(this.dialog.$(".controls a.show")).not.toHaveClass("hidden");
            });

            it("should hide the 'Hide Data Table' link", function() {
                expect(this.dialog.$(".controls a.hide")).toHaveClass("hidden");
            });
        });
    })

    describe("show and hide tabular data", function() {
        beforeEach(function() {
            this.dialog.render();
        });
        
        describe("clicking on the 'Show Data Table' link", function() {
            beforeEach(function() {
                this.dialog.$(".controls a.show").click();
            });

            it("should show the data table", function() {
                expect(this.dialog.$(".results_console")).not.toHaveClass("hidden");
            })

            it("should hide the show table link", function() {
                expect(this.dialog.$(".controls a.show")).toHaveClass("hidden");
            })

            it("should show the hide table link", function() {
                expect(this.dialog.$(".controls a.hide")).not.toHaveClass("hidden");
            })

            describe("clicking on the 'Hide Chart Data' link", function() {
                beforeEach(function() {
                    this.dialog.$(".controls a.hide").click();
                });

                it("should hide the data table", function() {
                    expect(this.dialog.$(".results_console")).toHaveClass("hidden");
                });

                it("should show the 'Show Data Table' link", function() {
                    expect(this.dialog.$(".controls a.show")).not.toHaveClass("hidden");
                });

                it("should hide the 'Hide Data Table' link", function() {
                    expect(this.dialog.$(".controls a.hide")).toHaveClass("hidden");
                });
            });
        });
    });
});