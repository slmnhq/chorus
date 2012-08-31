describe("chorus.pages.HdfsEntryIndexPage", function() {
    beforeEach(function() {
        this.instance = rspecFixtures.hadoopInstance({id: "1234", name: "instance Name"});
        this.hdfsEntry = fixtures.hdfsEntryDir({hadoopInstance: this.instance.attributes, id: "4"});
        this.page = new chorus.pages.HdfsEntryIndexPage("1234", "4");
    });

    it("has a helpId", function() {
        expect(this.page.helpId).toBe("instances")
    });

    it("fetches the Hdfs entries for that directory", function() {
        expect(this.hdfsEntry).toHaveBeenFetched();
    });

    it("fetches the instance", function() {
        expect(this.instance).toHaveBeenFetched();
    });

    describe("before the instance fetch completes", function() {
        beforeEach(function() {
            this.page.render();
        });

        it("has a loading section on the page", function() {
            expect(this.page.$(".loading_section")).toExist();
        });

        it("has some breadcrumbs", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toMatchTranslation("breadcrumbs.instances");
        });
    });

    describe("when all of the fetches complete", function() {
        beforeEach(function() {
            this.server.completeFetchFor(this.instance);
            this.server.completeFetchFor(this.hdfsEntry,
                {
                ancestors: [],
                path: "/foo",
                name: "foo",
                entries: [
                    fixtures.hdfsEntryDirJson(),
                    fixtures.hdfsEntryDirJson(),
                    fixtures.hdfsEntryDirJson() ]
                }
            );
        });

        it("should have title in the mainContentList", function() {
            expect(this.page.mainContent.contentHeader.options.title).toBe(this.instance.get("name") + ": /foo");
        });

        it("should have the right breadcrumbs", function() {
            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toMatchTranslation("breadcrumbs.instances");

            expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe(this.instance.get("name") + " (2)");

            expect(this.page.$(".breadcrumb").length).toBe(3);
        });

        it("should have a sidebar", function() {
            expect($(this.page.el).find(this.page.sidebar.el)).toExist();
            expect(this.page.sidebar).toBeA(chorus.views.HdfsEntrySidebar);
        });

        describe("when an entry is selected", function() {
            beforeEach(function() {
                this.entry = new chorus.models.HdfsEntry({
                    id: "not_in_the_fixture",
                    hadoopInstance: {
                        id: 111
                    },
                    path: "/",
                    name: "foo.csv"
                });

                expect(this.page.model).toEqual(this.page.collection.models[0]);
                chorus.PageEvents.broadcast("hdfs_entry:selected", this.entry);
            });
            it("sets the entry as the model", function() {
                expect(this.page.model).toEqual(this.entry);
            })
        })
    });


    describe("when the path is long", function () {
        beforeEach(function () {
            spyOn(chorus, "menu");
            this.server.completeFetchFor(this.instance);
            this.server.completeFetchFor(this.hdfsEntry,
                {
                    path: "/start/m1/m2/m3/end",
                    ancestors: [{id: 11, name: "end"},
                        {id: 22, name: "m3"},
                        {id: 33, name: "m2"},
                        {id: 44, name: "m1"},
                        {id: 55, name: "start"}
                    ],
                    name: "foo.csv",
                    entries: [
                        fixtures.hdfsEntryDirJson(),
                        fixtures.hdfsEntryDirJson(),
                        fixtures.hdfsEntryDirJson() ]
                }
            );

//            var model = new chorus.models.HdfsEntry({
//                hadoopInstance:{
//                    id:111
//                },
//                path:"/",
//                name:"foo.csv"
//            });

//            this.server.completeFetchFor(this.page.hdfsEntry, {path:"start/m1/m2/m3/end", entries:[model.attributes]});
//            this.server.completeFetchFor(this.page.instance, this.instance);
        });

        it("ellipsizes the inner directories", function () {
            expect(this.page.mainContent.contentHeader.options.title).toBe(this.instance.get("name") + ": /start/.../end");
        });

        it("constructs the breadcrumb links correctly", function () {
            var options = chorus.menu.mostRecentCall.args[1];

            var $content = $(options.content);

            expect($content.find("a").length).toBe(5);

            expect($content.find("a").eq(0).attr("href")).toBe("#/hadoop_instances/1234/browse/55");
            expect($content.find("a").eq(1).attr("href")).toBe("#/hadoop_instances/1234/browse/44");
            expect($content.find("a").eq(2).attr("href")).toBe("#/hadoop_instances/1234/browse/33");
            expect($content.find("a").eq(3).attr("href")).toBe("#/hadoop_instances/1234/browse/22");
            expect($content.find("a").eq(4).attr("href")).toBe("#/hadoop_instances/1234/browse/11");

            expect($content.find("a").eq(0).text()).toBe("start");
            expect($content.find("a").eq(1).text()).toBe("m1");
            expect($content.find("a").eq(2).text()).toBe("m2");
            expect($content.find("a").eq(3).text()).toBe("m3");
            expect($content.find("a").eq(4).text()).toBe("end");
        });
    });
});
