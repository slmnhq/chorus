describe("chorus.pages.UserNewPage", function() {
    beforeEach(function() {
        this.loadTemplate("user_new");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("header");
        this.loadTemplate("main_content")
        this.loadTemplate("default_content_header")
        this.loadTemplate("plain_text")
        this.loadTemplate("validating");
        this.loadTemplate("logged_in_layout");
        this.page = new chorus.pages.UserNewPage()
    });


    describe("#render", function(){
        it("renders successfully", function() {
            this.page.render()
        })

        it("has the right breadcrumbs")
    })
})
