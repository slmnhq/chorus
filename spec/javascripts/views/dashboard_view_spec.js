describe("chorus.views.Dashboard", function(){
    beforeEach(function(){
        this.loadTemplate("workspace_list");
        this.loadTemplate("plain_text");
        this.view = new chorus.views.Dashboard();
        this.view.render();
    });
    
    describe("#render", function() {
        it("creates users active workspace list view", function() {

        });

        it("has workspace list", function() {
            expect(this.view.$(".main_content.workspace_list")).toExist();
        })
    });
});