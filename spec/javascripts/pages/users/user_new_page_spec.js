describe("chorus.pages.UserNewPage", function() {
    beforeEach(function() {
        this.config = new chorus.models.Config(); // avoid fetch
        this.page = new chorus.pages.UserNewPage()
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("user_new")
    });

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(this.page, 'render').andCallThrough();
        });

        it("fetches the chorus configuration information", function() {
            expect(this.config).toHaveBeenFetched();
        });

        describe("when the configuration fetch completes", function() {
            context("when external auth is enabled", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.config, { externalAuth: true });
                });

                it("re-renders", function() {
                    expect(this.page.render).toHaveBeenCalled();
                });

                it("instantiates a user new ldap view", function() {
                    expect(this.page.mainContent.content).toBeA(chorus.views.UserNewLdap);
                });
            });

            context("when external auth is *not* enabled", function() {
                beforeEach(function() {
                    this.server.completeFetchFor(this.config, { externalAuth: false });
                });

                it("re-renders", function() {
                    expect(this.page.render).toHaveBeenCalled();
                });

                it("instantiates the normal user new view", function() {
                    expect(this.page.mainContent.content).toBeA(chorus.views.UserNew);
                });
            });
        });

    });

    describe("#render", function(){
        it("renders successfully", function() {
            this.page.render();
        });
    });
})
