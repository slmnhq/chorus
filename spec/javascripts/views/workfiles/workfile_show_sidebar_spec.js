describe("WorkfileShowSidebar", function() {
    beforeEach(function() {
        fixtures.model = 'Workfile';
        this.workfile = fixtures.modelFor("fetch");
        this.loadTemplate("workfile_show_sidebar");
        this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
            console.log(this.view.el)
        })

        it("displays the filename", function() {
            expect(this.view.$(".fileName").text().trim()).toBe(this.workfile.get("fileName"))
        });

        it("displays the workfile's date", function() {
            var updatedDate = new Date(this.workfile.get("lastUpdatedStamp"));
            expect(this.view.$(".updated_on").text().trim()).toBe(updatedDate.toString("MMMM d"));
        });

        it("displays the name of the person who updated the workfile", function() {
            var updaterName = this.workfile.get("modifiedByFirstName") + " " + this.workfile.get("modifiedByLastName");
            expect(this.view.$(".updated_by").text().trim()).toBe(updaterName);
        });

        it("links to the profile page of the modifier", function() {
            expect(this.view.$("a.updated_by").attr("href")).toBe("#/users/" + this.workfile.get("modifiedBy"))
        })
    })
});
