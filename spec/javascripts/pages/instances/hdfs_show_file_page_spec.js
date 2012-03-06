describe("chorus.pages.HdfsShowFilePage", function() {
    beforeEach(function() {
        this.instance = fixtures.instance({id: "1234", name: "MyInstance"});
        this.file = fixtures.hdfsFile({ path: "myFile.txt" });
        this.page = new chorus.pages.HdfsShowFilePage(1234, "my/path/myFile.txt");
    });

    describe("fetches complete", function(){
        beforeEach(function() {
            this.server.completeFetchFor(this.page.instance, this.instance);
            this.server.completeFetchFor(this.page.model, this.file);
        });

        it ("has the breadcrumbs", function (){
            expect(this.page.$(".spacer").length).toBe(3);

            expect(this.page.$(".breadcrumb:eq(0) a").attr("href")).toBe("#/");
            expect(this.page.$(".breadcrumb:eq(0)").text().trim()).toMatchTranslation("breadcrumbs.home");

            expect(this.page.$(".breadcrumb:eq(1) a").attr("href")).toBe("#/instances");
            expect(this.page.$(".breadcrumb:eq(1)").text().trim()).toMatchTranslation("breadcrumbs.instances");

            expect(this.page.$(".breadcrumb:eq(2)").text().trim()).toBe("MyInstance (2)");

            expect(this.page.$(".breadcrumb:eq(3)").text().trim()).toBe("myFile.txt");
        });

        xit("has the file is read-only indicator", function() {

        });

        xit("has the correct sidebar", function() {

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
});