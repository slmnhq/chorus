describe("chorus.views.SearchTabularDataList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();
        this.models = this.result.tabularData();
        this.view = new chorus.views.SearchTabularDataList({collection: this.models});
        this.view.render();
    });

    it("should have a title", function() {
        expect(this.view.$(".title")).toContainTranslation("dataset.title_plural");
    });

    describe("search result count", function() {
        it("should show the number of results", function() {
            expect(this.view.$(".count")).toContainTranslation("search.count", {shown: this.models.length, total: this.models.attributes.total});
        });

        context("when there are three or fewer results", function() {
            beforeEach(function() {
                this.models = new chorus.collections.TabularDataSet([
                    fixtures.tabularDataJson(),
                    fixtures.tabularDataJson()
                ]);
                this.view = new chorus.views.SearchTabularDataList({collection: this.models});
                this.view.render();
            });

            it("should show the short count", function() {
                expect(this.view.$(".count")).toContainTranslation('search.count_short', {shown: 2});
            });
        });
    });

    it("renders an li for each model", function() {
        expect(this.view.$("li").length).toBe(10);
    });

    it("displays the items name", function() {
        expect(this.view.$("li:eq(0) .name")).toContainText(this.models.at(0).get("objectName"));
    });

    it("displays a link to the item", function() {
        expect(this.view.$("li:eq(0) .name")).toHaveAttr("href", this.models.at(0).showUrl());
    });

    context("for a chorus view", function() {
        beforeEach(function() {
            expect(this.models.at(1).get("datasetType")).toBe('CHORUS_VIEW');
        });

        it("links to the correct dataset url", function() {
            expect(this.view.$('li:eq(1) .name').attr('href')).toMatch(/workspace/);
        })
    });
});