jasmine.sharedExamples.DatasetVisualizationSidebar = function() {

    describe("picking a category limit", function() {
        beforeEach(function() {
            this.menuQtip = stubQtip(".category_limit a");
            this.view.render();
            this.view.$('.category_limit a').click();
            this.menuQtip.find("li:eq(2)").click();
        })

        it("selects the new value", function() {
            expect(this.view.$('.category_limit a .selected_value')).toContainText('3');
        })
    })

}
