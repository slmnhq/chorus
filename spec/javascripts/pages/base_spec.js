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

            this.view.mainContent = function() {return new Backbone.View()};
        })

        it("creates a Header view", function() {
            this.view.render();
            expect(this.view.$("#header.header")).toExist();
        });

        it("creates a BreadcrumbsView", function() {
            this.view.crumbs = [
                {label : "Home"}
            ]
            this.view.render();
            expect(this.view.$("#breadcrumbs.breadcrumbs .breadcrumb")).toExist();
        });

        it("populates the #main_content", function() {
            stubView = Backbone.View.extend({
                initialize : function() {
                    _.bindAll(this, "render")
                },

                render :  function() {
                    this.$(this.el).html("OH HAI BARABARA")
                    return this;
                }
            })

            this.view.mainContent = function(){ return new stubView()};

            this.view.render();

            expect(this.view.$("#main_content").text()).toBe("OH HAI BARABARA");
        });
    })
});
