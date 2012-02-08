describe("chorus.views.CreateChorusViewSidebar", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView({name : "my_chorus"});
        this.view = new chorus.views.CreateChorusViewSidebar({model: this.dataset});
    });
    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });
        it("displays correct title", function() {
            expect(this.view.$("legend").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.title")
        });


        context("when there is no filters or columns selected", function() {
            it("hides the non-empty selection section and shows the empty selection section", function() {
                expect(this.view.$(".selected_columns .non_empty_selection")).not.toExist();
                expect(this.view.$(".selected_columns .empty_selection")).toExist();
            });

            it("display the default message title", function() {
                expect(this.view.$(".selected_columns .empty_selection .top label").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.empty_selection.title");
            })
            it("display the default message", function() {
                expect(this.view.$(".selected_columns .empty_selection .bottom ").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.empty_selection.text");
            })
            it("disabled the create dataset button", function() {
                expect(this.view.$("button")).toHaveClass("disabled");
            });

        })

        context("when there are columns selected", function() {
            beforeEach(function() {
                this.view.collection = fixtures.databaseColumnSet();
                this.view.render();
            });

            it("hides the empty selection section and shows the non-empty selection section", function() {
                expect(this.view.$(".selected_columns .non_empty_selection")).toExist();
                expect(this.view.$(".selected_columns .empty_selection")).not.toExist();
            });

            it("display selected column section", function() {
                expect(this.view.$(".selected_columns .title").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.selected_columns");
            });
            it("enables the create dataset button", function() {
            expect(this.view.$("button")).not.toHaveClass("disabled");
        });
        })
    })
});