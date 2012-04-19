describe("chorus.views.Sidebar", function() {
    beforeEach(function() {
        stubDefer();
        chorus.page = new chorus.pages.Base();
        this.page = chorus.page;
        this.page.sidebar = new chorus.views.Sidebar();
        this.page.sidebar.templateName = "user/sidebar";
        this.page.sidebar.subviews = {
            '.foo' : 'fooView'
        };
        this.page.sidebar.fooView = new chorus.views.Base();
        this.page.sidebar.fooView.templateName = "plain_text";
    });

    describe("scrollbar handling", function() {
        beforeEach(function() {
            spyOn(this.page.sidebar, "setupScrolling").andCallThrough();
            spyOn(this.page.sidebar, "recalculateScrolling");
            this.page.render();
        });

        it("sets up custom scrolling", function() {
            expect(this.page.sidebar.setupScrolling).toHaveBeenCalled();
        });

        context("when a subview is re-rendered", function(){
            beforeEach(function() {
                this.page.sidebar.fooView.render();
            });

            it("recalculates scrolling", function() {
                expect(this.page.sidebar.recalculateScrolling).toHaveBeenCalled();
            });
        });
    });

    describe("#recalculateScrolling", function() {
        beforeEach(function() {
            spyOn(chorus.views.Bare.prototype, "recalculateScrolling")
            this.page.sidebar.recalculateScrolling();
        });

        it("calls super with the appropriate selector", function() {
            expect(chorus.views.Bare.prototype.recalculateScrolling).toHaveBeenCalledWith($(this.page.sidebar.el).closest(".custom_scroll"));
        });
    });

    describe("#jumpToTop", function() {
        beforeEach(function() {
            $('#jasmine_content').append(this.page.el);
            this.page.render();
            this.fakeApi = {
                scrollTo: jasmine.createSpy("scrollTo")
            }
            this.page.$("#sidebar").data("jsp", this.fakeApi)
            this.page.$('#sidebar_wrapper .jump_to_top').addClass("clickable");
            this.page.$('#sidebar_wrapper .jump_to_top').click();
        });

        it("should scroll to the top", function() {
            expect(this.fakeApi.scrollTo).toHaveBeenCalledWith(0, 0)
        });
    });
});
