describe("chorus.views.Sidebar", function() {
    beforeEach(function() {
        stubDefer();
        chorus.page = new chorus.pages.Base();
        this.page = chorus.page;
        this.page.sidebar = new chorus.views.Sidebar();
        this.page.sidebar.className = "user_show_sidebar"
        this.page.sidebar.subviews = {
            '.foo' : 'fooView'
        }
        this.page.sidebar.fooView = new chorus.views.Base();
        this.page.sidebar.fooView.className = "plain_text";
    })

    describe("scrollbar handling", function() {
        beforeEach(function() {
            spyOn(this.page.sidebar, "setupScrolling").andCallThrough();
            spyOn(this.page.sidebar, "recalculateScrolling")
            this.page.render();
        })

        it("sets up custom scrolling", function() {
            expect(this.page.sidebar.setupScrolling).toHaveBeenCalled();
        })


        context("when a subview is re-rendered", function(){
            beforeEach(function() {
                this.page.sidebar.fooView.render()
            });

            it("recalculates scrolling", function() {
                expect(this.page.sidebar.recalculateScrolling).toHaveBeenCalled()
            })
        })
    })
})