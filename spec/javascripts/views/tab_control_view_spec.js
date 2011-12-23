describe("chorus.views.TabControl", function() {
    beforeEach(function() {
        this.tab1Spy = jasmine.createSpy();
        this.tab2Spy = jasmine.createSpy();
        this.view = new chorus.views.TabControl(['tab1', 'tab2']);
        this.view.render();
        this.view.bind('tab1:selected', this.tab1Spy);
        this.view.bind('tab2:selected', this.tab2Spy);
        $('#jasmine_content').append(this.view.el);

    });

    it("renders has the first tab as selected", function() {
        expect(this.view.$('li.tab1.selected').length).toBe(1);
        expect(this.view.$('li.tab2.selected').length).toBe(0);
    });

    context("clicking on a tab", function() {
        beforeEach(function() {
            this.view.$('li.tab2').click();
        });

        it("triggers the correct callbacks", function() {
            expect(this.tab2Spy).toHaveBeenCalled();
            expect(this.tab1Spy).not.toHaveBeenCalled();
        });

        it("updates the selected class", function() {
            expect(this.view.$('.tab1')).not.toHaveClass('selected');
            expect(this.view.$('.tab2')).toHaveClass('selected');
        });
    });
});