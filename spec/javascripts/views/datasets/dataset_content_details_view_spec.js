describe("chorus.views.DatasetContentDetails", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.qtipMenu = stubQtip();
            this.collection = fixtures.databaseColumnSet();
            this.dataset = fixtures.datasetChorusView();
            this.view = new chorus.views.DatasetContentDetails({dataset: this.dataset, collection: this.collection});
            this.view.render();
        });

        it("renders the title", function() {
            expect(this.view.$(".data_preview h1").text().trim()).toMatchTranslation("dataset.data_preview")
        });

        it("renders the definition bar", function() {
            expect(this.view.$(".definition")).toExist();
        })

        it("renders the 'Preview Data' button", function() {
            expect(this.view.$(".column_count .preview").text().trim()).toMatchTranslation("dataset.data_preview");
        })

        context("when 'Preview Data' is clicked", function() {
            beforeEach(function() {
                this.view.$(".column_count .preview").click();
            })

            it("should hide the column count bar", function() {
                expect(this.view.$(".column_count")).toHaveClass("hidden");
            })

            it("should display the data preview bar", function() {
                expect(this.view.$(".data_preview")).not.toHaveClass("hidden");
            })

            describe("data preview bar", function() {
                it("should display a close button", function() {
                    expect(this.view.$(".data_preview .close")).toExist();
                })

                context("when the close button is clicked", function() {
                    beforeEach(function() {
                        this.view.$(".data_preview .close").click();
                    });

                    it("should hide the data preview bar", function() {
                        expect(this.view.$(".data_preview")).toHaveClass("hidden");
                    });

                    it("should show the column count bar", function() {
                        expect(this.view.$(".column_count")).not.toHaveClass("hidden");
                    });
                });

                context("when the preview data button is clicked", function() {
                    beforeEach(function() {
                        spyOn(this.view.preview, "fetch");
                        this.view.$(".preview").click();
                    });

                    it("should fetch the database preview model", function() {
                        expect(this.view.preview.fetch).toHaveBeenCalled();
                    });
                });
            })
        })
        
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
