describe("chorus.views.Sidebar", function() {
    beforeEach(function() {
        this.realSetTimeout = window.setTimeout;
        window.setTimeout = function(fn, delay) {
            fn.call();
        }
        this.page = new chorus.pages.Base();
        chorus.page = this.page;
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
            spyOn($.fn, "jScrollPane");
            this.page.render();
        })

        it("sets up custom scrolling", function() {
            expect($.fn.jScrollPane).toHaveBeenCalled();
        })

        describe("resizing", function() {
            beforeEach(function() {
                $.fn.jScrollPane.reset();
                this.page.trigger("window:resized")
            })

            it("resets the custom scroller", function() {
                expect($.fn.jScrollPane).toHaveBeenCalled()
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
                $.fn.jScrollPane.reset();
                this.page.sidebar.fooView.render()
            });

            it("resets the custom scroller", function() {
                expect($.fn.jScrollPane).toHaveBeenCalled()
            })
        })
    })
})