describe("chorus.dialogs.BrowseDatasets", function () {
    context("when falling back to the page model", function() {
        beforeEach(function () {
            this.instance = fixtures.instance();
            this.launchElement = $("<a data-dialog='BrowseDatasets'></a>")
            this.view = new chorus.dialogs.BrowseDatasets({
                launchElement: this.launchElement,
                pageModel: this.instance
            });
            spyOn(this.view, 'navigate').andCallThrough();
            this.view.render();
        });

        it("should have the instance provided", function () {
            expect(this.view.$('.instance .title')).toContainText(this.instance.get('name'));
        });

        context("after selecting database and schema", function () {
            beforeEach(function () {
                this.view.schemaPicker.databases.reset([ fixtures.database({ id: '5' }) ]);
                this.view.$(".database select").val("5").change();
                this.view.schemaPicker.schemas.reset([ fixtures.schema({ id: '6' }) ]);
                this.view.$(".schema select").val("6").change();
            });

            describe("clicking show datasets", function () {
                beforeEach(function () {
                    spyOn(chorus.router, "navigate");
                    this.view.$(".submit").click();
                });

                it("should navigate away", function () {
                    expect(this.view.navigate).toHaveBeenCalled();
                    expect(chorus.router.navigate).toHaveBeenCalledWith(this.view.schemaPicker.selectedSchema.showUrl(), true);
                });
            })
        });

        context("without database and schema selected", function () {
            describe("clicking show datasets", function () {
                beforeEach(function () {
                    this.view.$(".submit").click();
                });

                it("should not navigate away", function () {
                    expect(this.view.navigate).not.toHaveBeenCalled();
                })
            })
        })
    });

    context("when the launch element provides the instance", function() {
        beforeEach(function () {
            this.instance = fixtures.instance();
            this.launchElement = $("<a data-dialog='BrowseDatasets'></a>");
            this.launchElement.data("instance", this.instance.attributes);

            this.view = new chorus.dialogs.BrowseDatasets({
                launchElement: this.launchElement,
                pageModel: null
            });

            this.view.render();
        });

        it("should have the instance provided", function () {
            expect(this.view.$('.instance .title')).toContainText(this.instance.get('name'));
        });
    });

    context("when the launch element provides the instance and the database", function() {
        beforeEach(function () {
            this.instance = fixtures.instance();
            this.database = fixtures.database({instanceId: this.instance.get("id")});

            this.launchElement = $("<a data-dialog='BrowseDatasets'></a>");
            this.launchElement.data("instance", this.instance.attributes);
            this.launchElement.data("databaseName", this.database.get("name"));

            this.view = new chorus.dialogs.BrowseDatasets({
                launchElement: this.launchElement,
                pageModel: null
            });

            this.view.render();
        });

        it("should have the instance provided", function () {
            expect(this.view.$('.instance .title')).toContainText(this.instance.get('name'));
        });

        it("should have the database provided", function () {
            expect(this.view.$('.database .title')).toContainText(this.database.get('name'));
        });
    });
});