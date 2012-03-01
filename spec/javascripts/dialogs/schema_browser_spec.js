describe("chorus.dialogs.SchemaBrowser", function () {
    context("when falling back to the page model", function() {
        beforeEach(function () {
            this.instance = fixtures.instance();
            this.launchElement = $("<a data-dialog='SchemaBrowser'></a>")
            this.view = new chorus.dialogs.SchemaBrowser({
                launchElement: this.launchElement,
                pageModel: this.instance
            });
            spyOn(this.view, 'navigate').andCallThrough();
            this.view.render();
        });

        it("should have the instance provided", function () {
            expect(this.view.$('.instance .title')).toContainText(this.instance.get('name'));
        });

        it("should have the 'Browse Datasets' button disabled", function() {
            expect(this.view.$('button.submit')).toBeDisabled();
        });

        context("after selecting database and schema", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.view.schemaPicker.databases, [ fixtures.database({ id: '5' }), fixtures.database({ id: '6' }) ])
                this.view.$(".database select").val("5").change();
                this.server.completeFetchFor(this.view.schemaPicker.schemas, [ fixtures.schema({ id: '7' }) ])
                this.view.$(".schema select").val("7").change();
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
            });

            it("should have the 'Browse Datasets' button enabled", function() {
                expect(this.view.$('button.submit')).toBeEnabled();
            });

            describe("selecting a different database", function() {
                beforeEach(function() {
                    this.view.$(".database select").val("6").change();
                });

                it("should have the 'Browse Datasets' button disabled", function() {
                    expect(this.view.$('button.submit')).toBeDisabled();
                });
            });
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
            this.launchElement = $("<a data-dialog='SchemaBrowser'></a>");
            this.launchElement.data("instance", this.instance.attributes);

            this.view = new chorus.dialogs.SchemaBrowser({
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

            this.launchElement = $("<a data-dialog='SchemaBrowser'></a>");
            this.launchElement.data("instance", this.instance.attributes);
            this.launchElement.data("databaseName", this.database.get("name"));

            this.view = new chorus.dialogs.SchemaBrowser({
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