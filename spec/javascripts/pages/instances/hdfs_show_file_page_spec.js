describe("chorus.pages.HdfsShowFilePage", function() {
    beforeEach(function() {
        this.instance = fixtures.instance({id: "1234", name: "MyInstance"});
        this.file = fixtures.hdfsFile({ name: "myFile.txt" });
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

        xit ("has the file icon", function() {
            expect(this.page.$("img.fileIcon").attr("src")).toBe("abc");
        });

        it("has the file name", function() {

        });

        xit("has the flag / banner / tag?", function() {

        });

        it("has the file is read-only indicator", function() {

        });

        it("has the correct sidebar", function() {

        });
    });
});