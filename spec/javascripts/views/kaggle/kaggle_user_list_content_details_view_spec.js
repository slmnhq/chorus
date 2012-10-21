describe("chorus.views.KaggleUserListContentDetails", function () {
    beforeEach(function () {
        this.collection = rspecFixtures.kaggleUserSet();
        this.view = new chorus.views.KaggleUserListContentDetails({collection:this.collection});
    });

    it("sets up the KaggleFilterWizard", function () {
        expect(this.view.filterWizardView).toBeA(chorus.views.KaggleFilterWizard);
    });

    describe("render", function () {
        beforeEach(function () {
            this.view.render();
        });

        it("puts the filter wizard subview in the filters div", function () {
            expect($(this.view.el).find(this.view.filterWizardView.el).length).toBeGreaterThan(0);
        });

        it("displays the kaggle users count", function () {
            expect(this.view.$(".count").text()).toContainTranslation("entity.name.User", {count:this.collection.models.length});
        });
        describe("#submitSearch", function () {
            beforeEach(function () {
                this.view.filterWizardView.collection = new chorus.collections.KaggleFilterSet([
                    new chorus.models.KaggleFilter({column: new chorus.models.KaggleColumn({name: "column_1"}),
                                                    comparator: "greater",
                                                    input: { value : "||123"}})]);
            });

            it("send the params as format filter|comparator|value", function () {
                this.view.$(".search_kaggle_user").click();
                expect(this.view.collection).toHaveBeenFetched();
                var url = this.server.lastFetchFor(this.view.collection).url;
                expect(url).toContainQueryParams({'kaggleUser[]':encodeURIComponent("column_1") + "|" + encodeURIComponent("greater") + "|" + encodeURIComponent("||123") });
            });
        });

        describe("#convertKey", function() {
           it("replaces spaces with '_", function(){
               var key = this.view.convertKey("Hi All You")
               expect(key).toBe("hi_all_you");
           }) ;
        });
    });
});