describe("WorkfileShowSidebar", function() {
    beforeEach(function() {
        fixtures.model = 'Workfile';
        this.workfile = fixtures.modelFor("fetch");
        this.loadTemplate("workfile_show_sidebar");
        this.loadTemplate("activity_list");
        this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });
    });

    describe("initialization", function() {
        it("has an ActivityListView", function() {
            expect(this.view.activityList).toBeDefined();
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        })

        it("displays the filename", function() {
            expect(this.view.$(".fileName").text().trim()).toBe(this.workfile.get("fileName"))
        });

        it("displays the workfile's date", function() {
            expect(this.view.$(".updated_on").text().trim()).toBe("November 22");
        });

        it("displays the name of the person who updated the workfile", function() {
            var updaterName = this.workfile.get("modifiedByFirstName") + " " + this.workfile.get("modifiedByLastName");
            expect(this.view.$(".updated_by").text().trim()).toBe(updaterName);
        });

        it("links to the profile page of the modifier", function() {
            expect(this.view.$("a.updated_by").attr("href")).toBe("#/users/" + this.workfile.get("modifiedBy"))
        })

        it("displays a link to download the workfile", function() {
            expect(this.view.$(".actions a.download")).toHaveAttr("href", "/edc/workspace/10000/workfile/10020/file/1111_1111?download=true")
        })

        it("displays the activity list", function() {
            expect(this.view.$(".activity_list")).toExist();
        })
    })

    describe("when the model is changed", function() {
        beforeEach(function() {
            spyOn(this.view.activityList, "render");
            this.view.model.trigger("change")
        })

        it("re-renders the activity list", function() {
            expect(this.view.activityList.render).toHaveBeenCalled();
        })
    })
});
