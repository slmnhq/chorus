describe("chorus.views.DatasetContentDetails", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.qtipMenu = stubQtip();
            this.collection = fixtures.databaseColumnSet();
            this.view = new chorus.views.DatasetContentDetails({collection: this.collection});
            this.view.render();
        });

        describe("definition bar", function() {
            it("renders", function() {
                expect(this.view.$(".definition")).toExist();
            })

            it("renders the 'Transform' button", function() {
                expect(this.view.$("button.transform")).toExist();
                expect(this.view.$("button.transform").text()).toMatchTranslation("dataset.content_details.transform");
            })

            describe("the 'Transform' button is clicked", function() {
                beforeEach(function() {
                    this.view.$(".transform").click();
                })

                it("should show the qtip menu", function() {
                    expect(this.qtipMenu).toHaveVisibleQtip()
                })

                it("should render the qtip content", function() {
                    expect(this.qtipMenu).toContainTranslation("dataset.content_details.visualize")
                })

                context("and the visualize dataset link is clicked", function() {
                    beforeEach(function() {
                        spyOnEvent(this.view, "transform:visualize");
                        this.qtipMenu.find('.visualize').click();
                    })

                    it("triggers the transform:visualize event", function() {
                        expect("transform:visualize").toHaveBeenTriggeredOn(this.view);
                    })
                })
            })
        })

        describe("column count bar", function() {
            it("renders", function() {
                expect(this.view.$(".column_count")).toExist();
            })

            it("renders the column count", function() {
                expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count : this.collection.models.length })
            })
        })
    })
});
