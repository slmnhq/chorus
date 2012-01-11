describe("chorus.views.Sidebar", function() {
    beforeEach(function() {
        this.realSetTimeout = window.setTimeout;
        window.setTimeout = function(fn, delay) {
            fn.call();
        }
        this.page = new chorus.pages.Base();
        this.page.sidebar = new chorus.views.Sidebar();
        this.page.sidebar.className = "user_show_sidebar"
        this.page.sidebar.subviews = {
            '.foo' : 'fooView'
        }
        this.page.sidebar.fooView = new chorus.views.Base();
        this.page.sidebar.fooView.className = "plain_text";
    })

    afterEach(function() {
        window.setTimeout = this.realSetTimeout;
    })

    describe("scrollbar handling", function() {
        beforeEach(function() {
            spyOn($.fn, "lionbars");
            this.page.render();
        })

        it("sets up lionbars (rooooooar)", function() {
            expect($.fn.lionbars).toHaveBeenCalled();
        })

        describe("resizing", function() {
            beforeEach(function() {
                $.fn.lionbars.reset();
                $(window).trigger('resize');
            })

            it("resets the lionbars", function() {
                expect($.fn.lionbars).toHaveBeenCalled()
            })
        })

        describe("re-rendering", function() {
            beforeEach(function() {
                this.page.$('#sidebar').css('font-variant', 'small-caps');
                this.page.render();
            })

            it("should clear the styles on #sidebar", function() {
                // Chrome will return a falsy value, but Firefox will return the "actual" CSS,
                // which in this case will be the default value of "normal".
                expect(this.page.$('#sidebar').css('font-variant')).not.toBe('small-caps');
            });
        })

        context("when a subview is re-rendered", function(){
            beforeEach(function() {
                $.fn.lionbars.reset();
                this.page.sidebar.fooView.render()
            });

            it("resets the lionbars", function() {
                expect($.fn.lionbars).toHaveBeenCalled()
            })
        })
    })
})