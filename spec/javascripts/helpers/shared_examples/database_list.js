jasmine.sharedExamples.DatabaseSidebarList = function() {
    it("should have data-cid on the list elements", function() {
        expect(this.view.$('ul.list li')).toExist();
        expect(this.view.$('ul.list li').data('cid')).toBeTruthy();
    });

    it("should have a collection defined", function() {
        expect(this.view.collection).toBeTruthy();
    });

    it("should call super if overriding postRender", function() {
        spyOn(chorus.views.DatabaseSidebarList.prototype, 'postRender');
        this.view.render();
        expect(chorus.views.DatabaseSidebarList.prototype.postRender).toHaveBeenCalled();
    });

}
