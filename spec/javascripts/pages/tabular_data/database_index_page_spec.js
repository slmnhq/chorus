describe("chorus.pages.DatabaseIndexPage", function() {
    beforeEach(function() {
        this.instance = fixtures.instance({id: "1234", name: "instance Name"});
        this.page = new chorus.pages.DatabaseIndexPage("1234");
        this.page.render();
    });

    it("fetches the instance", function() {
        expect(this.page.instance).toHaveBeenFetched();
    });

    it("fetches the databases for that instance", function() {
        expect(this.page.collection).toHaveBeenFetched();
    });

    describe("when all of the fetches complete", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.instance);
            this.server.completeFetchAllFor(this.page.collection, [fixtures.database(), fixtures.database()]);
        });

        it("should have title in the mainContentList", function() {
            expect(this.page.mainContent.contentHeader.$("h1")).toContainText(this.instance.get("name"));
        });

        it("should have the correct instance icon in the header ", function() {
            expect(this.page.mainContent.contentHeader.$("img")).toHaveAttr("src", this.instance.providerIconUrl());
        });

        it("should have the correct breadcrumbs", function() {
            expect(this.page.$(".breadcrumb").length).toBe(3);

            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)")).toContainTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)")).toContainTranslation("breadcrumbs.instances");

            expect(this.page.$(".breadcrumb:eq(2)")).toContainText(this.instance.get("name"));
        });

        it("has a sidebar", function() {
            expect(this.page.sidebar).toBeA(chorus.views.DatabaseListSidebar);
            expect(this.page.$(this.page.sidebar.el)).toExist();
        })
    });

    describe("when the user does not have permission to view the databases", function() {
        beforeEach(function() {
            spyOn(chorus.Modal.prototype, "launchModal")
            spyOn(Backbone.history, "loadUrl")

            this.server.completeFetchFor(this.instance);
            this.server.lastFetchFor(this.page.collection).fail([{
                description: null,
                message: "Account map is needed.",
                msgcode: "E_4_0109",
                msgkey: "ACCOUNTMAP.NO_ACTIVE_ACCOUNT",
                severity: "error"
            }]);
        });

        it("does not go to the 404 page", function() {
            expect(Backbone.history.loadUrl).not.toHaveBeenCalled()
        });

        it("launches the 'add credentials' dialog, and reloads after the credentials have been added", function() {
            expect(chorus.Modal.prototype.launchModal).toHaveBeenCalled()
            var dialog = chorus.Modal.prototype.launchModal.mostRecentCall.object;
            expect(dialog).toBeA(chorus.dialogs.InstanceAccount);
            expect(dialog.options.reload).toBeTruthy();
            expect(dialog.options.title).toMatchTranslation("instances.account.add.title");
        });
    });
})
