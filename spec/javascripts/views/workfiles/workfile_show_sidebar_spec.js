describe("WorkfileShowSidebar", function() {
    beforeEach(function() {
        fixtures.model = 'Workfile';
        this.workfile = fixtures.modelFor("fetch");
        this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });
    });

    describe("initialization", function() {
        it("has a SidebarActivityListView", function() {
            expect(this.view.activityList).toBeDefined();
        })

        it("fetches the ActivitySet for the workfile", function() {
            expect(this.server.requests[0].url).toBe("/edc/activitystream/workfile/10020?page=1&rows=50");
            expect(this.server.requests[0].method).toBe("GET");
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
            expect(this.view.$("a.updated_by").attr("href")).toBe("#/users/" + this.workfile.get("modifiedById"))
        })

        it("displays a link to download the workfile", function() {
            expect(this.view.$(".actions a.download")).toHaveAttr("href", "/edc/workspace/10000/workfile/10020/file/1111_1111?download=true")
        });

        it("displays a link to add a note", function() {
            var addLink = this.view.$(".actions a.dialog[data-dialog=NotesNew]");
            expect(addLink).toExist();
            expect(addLink).toHaveAttr("data-entity-type", "workfile")
            expect(addLink).toHaveAttr("data-entity-id", this.workfile.get("id"))
        });

        it("displays the activity list", function() {
            expect(this.view.$(".activity_list")).toExist();
        })
    })

    describe("when the model is changed", function() {
        beforeEach(function() {
            spyOn(this.view.activityList, "render").andCallThrough();
            this.view.model.trigger("change")
        })

        it("re-renders the activity list", function() {
            expect(this.view.activityList.render).toHaveBeenCalled();
        })
    })

    describe("when the model is invalidated", function() {
        it("fetches the activity set", function() {
            this.view.model.trigger("invalidated")
            expect(this.server.requests[0].url).toBe(this.view.collection.url())
        })
    })

    describe("when the activity list collection is changed", function() {
        beforeEach(function() {
            spyOn(this.view, "postRender"); // check for #postRender because #render is bound
            this.view.collection.trigger("changed")
        })

        it("re-renders", function() {
            expect(this.view.postRender).toHaveBeenCalled();
        })
    })
});
