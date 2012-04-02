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

    it("should have the fullname on the list elements", function() {
        expect(this.view.$('ul.list li')).toExist();
        expect(this.view.$('ul.list li').data('fullname')).toBeTruthy();
    });

    it("should make the list elements draggable", function() {
        spyOn($.ui, "draggable");
        this.view.render();
        var $li = this.view.$("ul.list li");
        expect($.ui.draggable.callCount).toBe($li.length)
        _.each($.ui.draggable.calls, function(call, i){
            expect($(call.args[1])[0]).toBe($li.eq(i)[0]);
        });
    });

    it("the draggable helper has the name of the table", function() {
        var $li = this.view.$("ul.list li:eq(0)")
        e = {currentTarget: $li};
        var helper = this.view.dragHelper(e);
        expect(helper).toContainText($li.data("name"));
    });
}
