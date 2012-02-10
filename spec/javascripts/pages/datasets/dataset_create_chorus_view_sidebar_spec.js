describe("chorus.views.CreateChorusViewSidebar", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetChorusView({name : "my_chorus"});
        this.filters = {};
        this.view = new chorus.views.CreateChorusViewSidebar({model: this.dataset});
        this.view.filters = this.filters;
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });
        it("displays correct title", function() {
            expect(this.view.$("legend").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.title")
        });

        it("displays the preview SQL link", function() {
            expect(this.view.$("a.preview")).toExist();
            expect(this.view.$("a.preview")).toHaveClass("dialog");
            expect(this.view.$("a.preview").data("dialog")).toBe("SqlPreview");
            expect(this.view.$("a.preview").text()).toContainTranslation("dataset.preview_sql");
        });

        it("adds the filters to the preview SQL link's data", function() {
           expect(this.view.$("a.preview").data("filters")).toBe(this.filters);
        });

        context("when there is no filters or columns selected", function() {
            it("hides the non-empty selection section and shows the empty selection section", function() {
                expect(this.view.$(".selected_columns .non_empty_selection")).toHaveClass("hidden");
                expect(this.view.$(".selected_columns .empty_selection")).not.toHaveClass("hidden");
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

        describe("column:selected event", function() {
            beforeEach(function(){
                this.databaseColumn = fixtures.databaseColumn();
                this.view.trigger("column:selected", this.databaseColumn);
            });

            it("displays the name of that column", function() {
                expect(this.view.$(".empty_selection")).toHaveClass("hidden");
                expect(this.view.$(".non_empty_selection")).not.toHaveClass("hidden");
                expect(this.view.$(".non_empty_selection .columns li").length).toBe(1)
                expect(this.view.$(".non_empty_selection .columns li")).toContainText(this.databaseColumn.get("name"));
            });

            it("includes a remove link in the li", function() {
                expect(this.view.$(".columns li a.remove")).toExist();
                expect(this.view.$(".columns li a.remove").text().trim()).toMatchTranslation("dataset.chorusview.sidebar.remove");
            })

            describe("selecting another column", function() {
                beforeEach(function(){
                    this.databaseColumn2 = fixtures.databaseColumn();
                    this.view.trigger("column:selected", this.databaseColumn2);
                });

                it("adds that column too", function() {
                    expect(this.view.$(".non_empty_selection .columns li").length).toBe(2)
                    expect(this.view.$(".non_empty_selection .columns li")).toContainText(this.databaseColumn.get("name"));
                    expect(this.view.$(".non_empty_selection .columns li")).toContainText(this.databaseColumn2.get("name"));
                });

                describe("deselecting one column", function() {
                    beforeEach(function(){
                        this.view.trigger("column:deselected", this.databaseColumn);
                    });

                    it("removes the name of that column", function() {
                        expect(this.view.$(".empty_selection")).toHaveClass("hidden");
                        expect(this.view.$(".non_empty_selection")).not.toHaveClass("hidden");
                        expect(this.view.$(".non_empty_selection .columns li").length).toBe(1)
                    });

                    describe("deselecting the other column", function() {
                        beforeEach(function(){
                            this.view.trigger("column:deselected", this.databaseColumn2);
                        });

                        it("removes the name of that column, and displays the empty selection div", function() {
                            expect(this.view.$(".empty_selection")).not.toHaveClass("hidden");
                            expect(this.view.$(".non_empty_selection")).toHaveClass("hidden");
                            expect(this.view.$(".non_empty_selection .columns li").length).toBe(0)
                        });
                    });
                });
            });
        });

        describe("clicking the 'Remove' link", function() {
            beforeEach(function() {
                spyOnEvent(this.view, "column:removed");
                this.column = fixtures.databaseColumn();
                this.view.trigger("column:selected", this.column);
                this.view.$("a.remove").click();
            })

            it("should trigger the column:removed event", function() {
                expect("column:removed").toHaveBeenTriggeredOn(this.view, [this.column]);
            })
        })
    })
});