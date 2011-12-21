describe("chorus.pages.WorkfileIndexPage", function() {
    beforeEach(function() {
        fixtures.model = "Workfile";
    })

    describe("breadcrumbs", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
            this.page.mainContent.model.set({name: "Cool Workspace"});
            this.page.mainContent.model.loaded = true;
            this.page.render();
        });

        it("renders home > {workspace name} > All work files", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0) a").text()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/workspaces/4");
            expect(this.page.$(".breadcrumb:eq(1) a").text()).toBe("Cool Workspace");

            expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toMatchTranslation("breadcrumbs.workfiles.all");
        });
    });

    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/4");
        })

        it("defaults to alphabetical sorting", function() {
            expect(this.page.collection.sortIndex).toBe("fileName")
            expect(this.page.collection.sortOrder).toBe("asc");
        })

        it("defaults to all files", function() {
            expect(this.page.collection.fileType).toBe("");
        })

        it("fetches the first page of the collection", function() {
            expect(this.server.requests[1].url).toBe("/edc/workspace/4/workfile?page=1&rows=50&sidx=fileName&sord=asc")
        })
    });

    describe("when the workfile:selected event is triggered on the list view", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
            this.page.render();
        })

        it("triggers the event on the sidebar view", function() {
            var listView = this.page.mainContent.content;
            var sidebar = this.page.sidebar;
            var workfileSelectedSpy = jasmine.createSpy("workfile:selected");
            var workfile = fixtures.modelFor("fetch");
            sidebar.bind("workfile:selected", workfileSelectedSpy);
            listView.trigger("workfile:selected", workfile);

            expect(workfileSelectedSpy).toHaveBeenCalledWith(workfile);
        });

        it("sets the model of the page", function() {
            var listView = this.page.mainContent.content;
            var workfile = fixtures.modelFor("fetch");
            listView.trigger("workfile:selected", workfile);
            expect(this.page.model).toBe(workfile);
        })
    });

    describe("menus", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
            this.page.render();
        })

        describe("filtering", function() {
            beforeEach(function() {
                this.page.collection.fileType = undefined;
                spyOn(this.page.collection, "fetch");
            })

            it("has options for filtering", function() {
                expect(this.page.$("ul[data-event=filter] li[data-type=]")).toExist();
                expect(this.page.$("ul[data-event=filter] li[data-type=sql]")).toExist();
                expect(this.page.$("ul[data-event=filter] li[data-type=code]")).toExist();
                expect(this.page.$("ul[data-event=filter] li[data-type=text]")).toExist();
                expect(this.page.$("ul[data-event=filter] li[data-type=other]")).toExist();
            })

            it("can filter the list by 'all'", function() {
                this.page.$("li[data-type=] a").click();
                expect(this.page.collection.attributes.fileType).toBe("");
                expect(this.page.collection.fetch).toHaveBeenCalled();
            })

            it("has can filter the list by 'sql'" ,function(){
                this.page.$("li[data-type=sql] a").click();
                expect(this.page.collection.attributes.fileType).toBe("sql");
                expect(this.page.collection.fetch).toHaveBeenCalled();
            })

            it("has can filter the list by 'code'" ,function(){
                this.page.$("li[data-type=code] a").click();
                expect(this.page.collection.attributes.fileType).toBe("code");
                expect(this.page.collection.fetch).toHaveBeenCalled();
            })

            it("has can filter the list by 'text'" ,function(){
                this.page.$("li[data-type=text] a").click();
                expect(this.page.collection.attributes.fileType).toBe("text");
                expect(this.page.collection.fetch).toHaveBeenCalled();
            })

            it("has can filter the list by 'other'" ,function(){
                this.page.$("li[data-type=other] a").click();
                expect(this.page.collection.attributes.fileType).toBe("other");
                expect(this.page.collection.fetch).toHaveBeenCalled();
            })

        })

        describe("sorting", function() {
            beforeEach(function() {
                this.page.collection.sortOrder = this.page.collection.sortIndex = undefined;
                spyOn(this.page.collection, "fetch");
            })

            it("has options for sorting", function(){
                expect(this.page.$("ul[data-event=sort] li[data-type=alpha]")).toExist();
                expect(this.page.$("ul[data-event=sort] li[data-type=date]")).toExist();
            })

            it("can sort the list alphabetically", function() {
                this.page.$("li[data-type=alpha] a").click();
                expect(this.page.collection.sortIndex).toBe("fileName")
                expect(this.page.collection.sortOrder).toBe("asc")
                expect(this.page.collection.fetch).toHaveBeenCalled();
            })

            it("can sort the list bu date", function() {
                this.page.$("li[data-type=date] a").click();
                expect(this.page.collection.sortIndex).toBe("lastUpdatedStamp")
                expect(this.page.collection.sortOrder).toBe("asc")
                expect(this.page.collection.fetch).toHaveBeenCalled();
            })
        })

    })
});
