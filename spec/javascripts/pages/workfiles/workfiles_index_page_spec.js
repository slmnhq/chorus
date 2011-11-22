describe("chorus.pages.WorkfileIndexPage", function() {
    beforeEach(function() {
        fixtures.model = "Workfile";
        this.loadTemplate("workfile_list")
        this.loadTemplate("workfile_create_sidebar")
        this.loadTemplate("sub_nav_content")
        this.loadTemplate("sub_nav_and_header")
    })

    describe("#initialize", function() {
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
        })

        it("fetches the model", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/4");
        })
    });

    describe("#render", function(){
         beforeEach(function() {
            this.page = new chorus.pages.WorkfileIndexPage(4);
            this.page.render();
        })
         it("should have a new workfile button", function(){
            expect(this.page.$("button:contains('Create a Workfile')")).toExist();
         })
    });
});
