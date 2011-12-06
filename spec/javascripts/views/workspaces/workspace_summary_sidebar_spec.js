describe("chorus.views.WorkspaceSummarySidebar", function() {
    beforeEach(function() {
        this.loadTemplate("workspace_summary_sidebar");
    });

    describe("#render", function() {
        beforeEach(function() {
            this.model = new chorus.models.Workspace({name: "A Cool Workspace", id: '123'});
            this.view = new chorus.views.WorkspaceSummarySidebar({model: this.model});
            this.view.render();
        });

        it("renders the name of the workspace in an h1", function(){
            expect(this.view.$("h1").text().trim()).toBe(this.model.get("name"));
        });

        it("has a link to add a note", function(){
            expect(this.view.$("a[data-dialog=NotesNew]").text().trim()).toMatchTranslation("actions.add_note");
            expect(this.view.$("a[data-dialog=NotesNew]").attr("data-entity-type")).toBe("workspace");
            expect(this.view.$("a[data-dialog=NotesNew]").attr("data-entity-id")).toBe(this.model.get("id"))
        });
    });
});