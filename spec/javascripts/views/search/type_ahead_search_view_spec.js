describe("chorus.views.TypeAheadSearch", function() {
    beforeEach(function() {
        this.result = fixtures.typeAheadSearchResult();
        this.result.set({query: "test"});
        this.view = new chorus.views.TypeAheadSearch();
        this.view.searchFor("test");
    });

    it("should fetch the search result", function() {
        expect(this.result).toHaveBeenFetched();
    });

    describe("when the fetch completes with results", function() {
        beforeEach(function() {
            this.view.resultLimit = 10;
            this.server.completeFetchFor(this.result);
        });

        it("should have one entry for each item in the result", function() {
            expect(this.view.$("li.result").length).toBe(this.result.get("typeAhead").docs.length);
        });

        it("should show the link to show all search result", function() {
            expect(this.view.$("li:eq(0)").text()).toMatchTranslation("type_ahead.show_all_results", {query: "test"});
            expect(this.view.$("li:eq(0) a").attr("href")).toBe("#/search/test");
        });

        it("should display the correct name and type for user", function() {
            var user = this.result.get("typeAhead").docs[0];
            expect(this.view.$("li.result:eq(0) .name").html()).toBe(user.firstName + ' ' + user.lastName);
            expect(this.view.$("li.result:eq(0) .name").attr("href")).toBe((new chorus.models.User(user)).showUrl());
            expect(this.view.$("li.result:eq(0) .type").text()).toMatchTranslation("type_ahead.entity.user");
        })

        it("should display the correct name and type for workfile", function() {
            var workfile = this.result.get("typeAhead").docs[1];
            expect(this.view.$("li.result:eq(1) .name").html()).toBe(workfile.name);
            expect(this.view.$("li.result:eq(1) .name").attr("href")).toBe((new chorus.models.Workfile(workfile)).showUrl());
            expect(this.view.$("li.result:eq(1) .type").text()).toMatchTranslation("type_ahead.entity.workfile");
        })

        it("should display the correct name and type for workspace", function() {
            var workspace = this.result.get("typeAhead").docs[2];
            expect(this.view.$("li.result:eq(2) .name").html()).toBe(workspace.name);
            expect(this.view.$("li.result:eq(2) .name").attr("href")).toBe((new chorus.models.Workspace(workspace)).showUrl());
            expect(this.view.$("li.result:eq(2) .type").text()).toMatchTranslation("type_ahead.entity.workspace");
        })

        it("should display the correct name and type for hdfs", function() {
            var hdfs = this.result.get("typeAhead").docs[3];
            expect(this.view.$("li.result:eq(3) .name").html()).toBe(hdfs.name);
            expect(this.view.$("li.result:eq(3) .name").attr("href")).toBe('#/instances/10010/browse/');
            expect(this.view.$("li.result:eq(3) .type").text()).toMatchTranslation("type_ahead.entity.hdfs");
        })

        it("should display the correct name and type for databaseObject", function() {
            var databaseObject = this.result.get("typeAhead").docs[4];
            expect(this.view.$("li.result:eq(4) .name").html()).toBe(databaseObject.objectName);
            expect(this.view.$("li.result:eq(4) .name").attr("href")).toBe((new chorus.models.DatabaseObject(databaseObject)).showUrl());
            expect(this.view.$("li.result:eq(4) .type").text()).toMatchTranslation("type_ahead.entity.databaseObject");
        })

        it("should display the correct name and type for chorusView", function() {
            var chorusView = this.result.get("typeAhead").docs[5];
            expect(this.view.$("li.result:eq(5) .name").html()).toBe(chorusView.objectName);
            expect(this.view.$("li.result:eq(5) .name").attr("href")).toBe((new chorus.models.ChorusView(chorusView)).showUrl());
            expect(this.view.$("li.result:eq(5) .type").text()).toMatchTranslation("type_ahead.entity.chorusView");
        })

        context("when search results return more than 5 rows", function() {
            beforeEach(function() {
                this.view.resultLimit = 5;
                this.result.get("typeAhead").docs =
                    this.result.get("typeAhead").docs.concat(fixtures.typeAheadSearchResultJson().typeAhead.docs);

                this.view.model.set(this.result.attributes);
            });

            it("should only display maximum 5 rows", function() {
                expect(this.view.$('li.result').length).toBe(5);
            })
        });
    })

    describe("when the fetch completes and there are no results", function() {
        beforeEach(function() {
            this.result.get("typeAhead").docs = [];
            this.result.get("typeAhead").numFound = 0;

            this.server.completeFetchFor(this.result);
        });

        it("should have no result entries", function() {
            expect(this.view.$("li.result").length).toBe(0);
        });

        it("should show the link to show all search result", function() {
            expect(this.view.$("li:eq(0)").text()).toMatchTranslation("type_ahead.show_all_results", {query: "test"});
            expect(this.view.$("li:eq(0) a").attr("href")).toBe("#/search/test");
        });
    });
})