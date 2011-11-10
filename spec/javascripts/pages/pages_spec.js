describe("chorus.pages.Base", function() {
    beforeEach(function() {
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        });

    });

    describe("initialize", function() {
        beforeEach(function() {
            spyOn(chorus.user, "bind");
            this.view = new chorus.pages.Base();
            this.view.mainContent = Backbone.View;
        });

        it("binds to change on chorus.user", function() {
            expect(chorus.user.bind).toHaveBeenCalledWith("change", this.view.render);
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.pages.Base();

            this.view.mainContent = new Backbone.View();
        })

        context("when supplied with an explicit header", function() {
            it("uses the supplied header", function() {
                var header = stubView("I is yr header")
                this.view.header = header
                this.view.render();
                expect(this.view.$("#header").text()).toBe("I is yr header")
            });
        });

        context("when not supplied a header", function() {
            it("creates a Header view", function() {
                this.view.render();
                expect(this.view.$("#header.header")).toExist();
                expect(this.view.header instanceof chorus.views.Header).toBeTruthy();
            });
        });

        it("creates a BreadcrumbsView", function() {
            this.view.crumbs = [
                {label : "Home"}
            ]
            this.view.render();
            expect(this.view.$("#breadcrumbs.breadcrumbs .breadcrumb")).toExist();
        });

        it("populates the #main_content", function() {
            this.view.mainContent = stubView("OH HAI BARABARA");

            this.view.render();

            expect(this.view.$("#main_content").text()).toBe("OH HAI BARABARA");
        });

        it("creates a Sidebar view", function() {
            this.view.sidebar = stubView("VROOOOOOOOOM");
            this.view.render();
            expect(this.view.$("#sidebar").text()).toBe("VROOOOOOOOOM")
        });

        it("makes an empty sidebar when not provided with a sideBarContent function", function() {
            this.view.render();
            delete this.view.sidebar;
            this.view.render();
            expect(this.view.$("#sidebar").html().length).toBe(0)
        });

        it("instantiates dialogs from dialog buttons", function() {

            var fooDialogSpy = {
                initFacebox : jasmine.createSpy()
            }

            chorus.dialogs.Foo = function() {
                return fooDialogSpy
            };

            this.view.sidebar = stubView("<button type='button' class='dialog' data-dialog='Foo'>Create a Foo</button>");
            this.view.render();
            this.view.$("button.dialog").click();
            expect(fooDialogSpy.initFacebox).toHaveBeenCalled();
        })
    })
});
