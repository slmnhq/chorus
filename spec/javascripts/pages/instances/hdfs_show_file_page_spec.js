describe("chorus.pages.HdfsShowFilePage", function() {
    beforeEach(function() {
        this.instance = fixtures.instance({id: "1234", name: "MyInstance"});
        this.file = fixtures.hdfsFile({ path: "my file.txt" });
        this.page = new chorus.pages.HdfsShowFilePage("1234", "my/path/my file.txt");
    });

    it("constructs an HDFS file model with the right instance id and path", function() {
        expect(this.page.model).toBeA(chorus.models.HdfsFile);
        expect(this.page.model.get("path")).toBe("/my/path/my file.txt");
        expect(this.page.model.get("instanceId")).toBe("1234");
    });

    context("fetches fail", function() {
        beforeEach(function() {
            spyOn(Backbone.history, "loadUrl")
            this.page.model.trigger('fetchFailed')
        })

        it("navigates to the 404 page", function() {
            expect(Backbone.history.loadUrl).toHaveBeenCalledWith("/invalidRoute")
        })
    })

    context("fetches complete", function(){
        beforeEach(function() {
            this.server.completeFetchFor(this.page.instance, this.instance);
            this.server.completeFetchFor(this.page.model, this.file);
        });

        it("has the breadcrumbs", function (){
            expect(this.page.$(".breadcrumbs .spacer").length).toBe(3);

            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toMatchTranslation("breadcrumbs.instances");

            expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("MyInstance (2)");

            expect(this.page.$(".breadcrumb:eq(3)").text().trim()).toBe("my file.txt");
        });

        it("has the file is read-only indicator", function() {
            expect(this.page.$(".content_details .plain_text")).toContainTranslation("hdfs.read_only")
        });

        it("has the correct sidebar", function() {
            expect(this.page.sidebar).toBeA(chorus.views.HdfsShowFileSidebar);
        });

        it("has a header file", function() {
            expect(this.page.mainContent.contentHeader).toBeA(chorus.views.HdfsShowFileHeader);
            expect(this.page.mainContent.contentHeader.model.get('path')).toBe(this.file.get('path'));
        })

        it("shows the hdfs file", function() {
            expect(this.page.mainContent.content).toBeA(chorus.views.HdfsShowFileView);
            expect(this.page.mainContent.content.model.get('instanceId')).toBe(this.file.get('instanceId'));
            expect(this.page.mainContent.content.model.get('content')).toBe(this.file.get('content'));
            expect(this.page.mainContent.content.model.get('path')).toBe(this.file.get('path'));
        })
    });

    describe("when the path is long", function() {
        beforeEach(function() {
            spyOn(chorus, "menu")

            this.page = new chorus.pages.HdfsShowFilePage("1234", "start/m1/m2/m3/end");

            this.server.completeFetchFor(this.page.model, this.file);
            this.server.completeFetchFor(this.page.instance, this.instance);
        });

        it("constructs the breadcrumb links correctly", function() {
            var options = chorus.menu.mostRecentCall.args[1]

            var $content = $(options.content);

            expect($content.find("a").length).toBe(5);

            expect($content.find("a").eq(0).attr("href")).toBe("#/instances/1234/browse/")
            expect($content.find("a").eq(1).attr("href")).toBe("#/instances/1234/browse/start")
            expect($content.find("a").eq(2).attr("href")).toBe("#/instances/1234/browse/start/m1")
            expect($content.find("a").eq(3).attr("href")).toBe("#/instances/1234/browse/start/m1/m2")
            expect($content.find("a").eq(4).attr("href")).toBe("#/instances/1234/browse/start/m1/m2/m3")

            expect($content.find("a").eq(0).text()).toBe(this.instance.get("name"))
            expect($content.find("a").eq(1).text()).toBe("start")
            expect($content.find("a").eq(2).text()).toBe("m1")
            expect($content.find("a").eq(3).text()).toBe("m2")
            expect($content.find("a").eq(4).text()).toBe("m3")
        })
    })
});
