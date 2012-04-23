jasmine.sharedExamples.ChartConfigurationChooser = function(menuItemPosition, menuItemText, selector) {
    selector = (selector || '.limiter')

    describe("picking a limit for " + selector, function() {
        beforeEach(function() {
            this.menuQtip = stubQtip(selector + " a");
            this.view.render();
            this.view.$(selector + ' a').click();
            this.menuQtip.find("li").eq(menuItemPosition).click();
        })

        it("selects the new value", function() {
            expect(this.view.$(selector + ' a .selected_value')).toContainText(menuItemText);
        });

        it("only selects for the current limiter", function() {
            var otherLimiters = this.view.$(selector).not(this.view.$(selector));
            if(otherLimiters.length) {
                expect(otherLimiters.find('.selected_value')).not.toContainText(menuItemText);
            }
        })
    })
}

jasmine.sharedExamples.ChartConfigurationRangeChooser = function(selector) {
    describe("works", function() {
        itBehavesLike.ChartConfigurationChooser(2, "3", selector)
    })
}