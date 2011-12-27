describe("chorus.views.TabControl", function() {
    beforeEach(function() {
        this.tab1Spy = jasmine.createSpy('tab1Spy');
        this.tab2Spy = jasmine.createSpy('tab2Spy');
        this.view = new chorus.views.TabControl(['tab1', 'tab2']);
        this.view.bind('tab1:selected', this.tab1Spy);
        this.view.bind('tab2:selected', this.tab2Spy);
        this.view.render();
        $('#jasmine_content').append(this.view.el);

    });

    it("renders has the first tab as selected", function() {
        expect(this.view.$('li.tab1.selected').length).toBe(1);
        expect(this.view.$('li.tab2.selected').length).toBe(0);
        expect(this.tab1Spy).toHaveBeenCalled();
    });

    context("clicking on a tab", function() {
        beforeEach(function() {
            this.tab1Spy.reset()
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

        context("calling render a second time", function() {
            beforeEach(function() {
                this.tab1Spy.reset();
                this.tab2Spy.reset();
                this.view.render();
            })

            it("keeps the current tab selected", function() {
                expect(this.tab1Spy).not.toHaveBeenCalled();
                expect(this.tab2Spy).toHaveBeenCalled();
                expect(this.view.$('.tab2')).toHaveClass('selected');
            });
        })
    });
});