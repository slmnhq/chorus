jasmine.sharedExamples.DatasetVisualizationSidebarLimiter = function(selector) {
    selector = (selector || '.limiter')

    describe("picking a limit for " + selector, function() {
        beforeEach(function() {
            this.menuQtip = stubQtip(".limiter a");
            this.view.render();
            this.view.$(selector + ' a').click();
            this.menuQtip.find("li:eq(2)").click();
        })

        it("selects the new value", function() {
            expect(this.view.$(selector + ' a .selected_value')).toContainText('3');
        });

        it("only selects for the current limiter", function() {
            var otherLimiters = this.view.$('.limiter').not(this.view.$(selector));
            if(otherLimiters.length) {
                expect(otherLimiters.find('.selected_value')).not.toContainText('3');
            }
        })
    })

}
