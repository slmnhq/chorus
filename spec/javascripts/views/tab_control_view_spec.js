describe("chorus.views.TabControl", function() {
    beforeEach(function() {
        this.tab1Spy = jasmine.createSpy('tab1Spy');
        this.tab2Spy = jasmine.createSpy('tab2Spy');
        this.view = new chorus.views.TabControl([{name: 'tab1'}, {name: 'tab2', selector: '.other_tab'}]);
        this.view.bind('tab1:selected', this.tab1Spy);
        this.view.bind('tab2:selected', this.tab2Spy);
        $('#jasmine_content').append(this.view.el);
        $('#jasmine_content').append('<div class="tabbed_area"><div class="tab1"></div><div class="other_tab"></div></div>')

        this.view.render();
    });

    it("renders has the first tab as selected", function() {
        expect(this.view.$('li.tab1.selected').length).toBe(1);
        expect(this.view.$('li.tab2.selected').length).toBe(0);
        expect(this.tab1Spy).toHaveBeenCalled();
    });

    it("makes the first tabbed area visible", function() {
        expect($('.tabbed_area .tab1')).toBeVisible();
    });

    it("hides the other tabbed areas", function() {
        expect($('.tabbed_area .other_tab')).not.toBeVisible();
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

        it("unhides the appropriate tabbed_area and hides the others", function() {
            expect($('.tabbed_area .tab1')).not.toBeVisible();
            expect($('.tabbed_area .other_tab')).toBeVisible();
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

            it("keeps the correct tabbed_area visibilities", function() {
                expect($('.tabbed_area .tab1')).not.toBeVisible();
                expect($('.tabbed_area .other_tab')).toBeVisible();
            });
        })
    });

    describe("#removeTab", function() {
        beforeEach(function() {
            this.view.removeTab("tab1");
        });

        it("removes the specified tab", function() {
            expect(this.view.$("li.tab1")).not.toExist();
        });
    });
});