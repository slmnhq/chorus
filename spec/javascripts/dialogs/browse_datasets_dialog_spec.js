describe("chorus.dialogs.BrowseDatasets", function () {
    beforeEach(function () {
        this.instance = fixtures.instance();
        this.launchElement = $("<a data-dialog='BrowseDatasets'></a>")
        this.view = new chorus.dialogs.BrowseDatasets({
            launchElement: this.launchElement,
            pageModel: this.instance
        });
        spyOn(this.view, 'navigate');
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
                this.view.$(".submit").click();
            });

            it("should navigate away", function () {
                expect(this.view.navigate).toHaveBeenCalled();
            })
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