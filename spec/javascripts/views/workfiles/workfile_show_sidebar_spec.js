describe("WorkfileShowSidebar", function() {
    beforeEach(function() {
        this.workfile = fixtures.textWorkfile();
        this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });
    });

    describe("initialization", function() {
        it("has a SidebarActivityListView", function() {
            expect(this.view.activityList).toBeDefined();
        })

        it("fetches the ActivitySet for the workfile", function() {
            expect(this.server.requests[0].url).toBe("/edc/activitystream/workfile/" + this.workfile.get('id') + "?page=1&rows=50");
            expect(this.server.requests[0].method).toBe("GET");
        })
    });

    describe("render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("should show the loading section", function() {
            expect(this.view.$('.loading_section')).toExist();
        });
    });


    context("with a sql workfile", function() {
        beforeEach(function() {
            this.workfile = fixtures.sqlWorkfile();
            this.view.model = this.workfile;
            this.view.model.fetch();
            this.view.model._sandbox = fixtures.sandbox();
            this.view.model.sandbox().fetch();
            this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });
            this.server.completeFetchFor(this.workfile);
            this.server.completeFetchFor(this.workfile.sandbox());
        });

        describe("render", function() {

            beforeEach(function() {
                this.view.render();
            });
            
            it("should have an activities tab", function() {
                expect(this.view.$('.tab_control .activity')).toExist();
            });
            
            it("should have a functions tab", function() {
                expect(this.view.$('.tab_control .functions')).toExist();
            });
            
            it("should have a metadata tab", function() {
                expect(this.view.$('.tab_control .metadata')).toExist();
            });

            it("renders the functions subview", function() {
                expect(this.view.schemaFunction).toBeA(chorus.views.SchemaFunctions);
            });
        });
    });

    context("with a non-sql workfile", function() {
        beforeEach(function() {
            this.workfile = fixtures.textWorkfile({
                lastUpdatedStamp: "2011-11-22 10:46:03.152"
            });
            this.workfile.fetch();
            this.workfile.sandbox().fetch();
            this.view = new chorus.views.WorkfileShowSidebar({ model : this.workfile });
                $('#jasmine_content').append(this.view.el);
            this.server.completeFetchFor(this.workfile);
            this.server.completeFetchFor(this.workfile.sandbox());
            expect(this.workfile.isText()).toBeTruthy();
        });

        describe("render", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("should not have a functions, or meatadata tabs", function() {
                expect(this.view.$('.tab_control .activity')).toExist();
                expect(this.view.$('.tab_control .functions')).not.toExist();
                expect(this.view.$('.tab_control .metadata')).not.toExist();
            });

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
                expect(this.view.$(".actions a.download")).toHaveAttr("href", "/edc/workspace/" + this.workfile.get('workspaceId') + "/workfile/" + this.workfile.get('id') + "/file/" + this.workfile.get('versionFileId') + "?download=true")
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
    });

    describe("when the model is invalidated", function() {
        it("fetches the activity set", function() {
            this.view.model.trigger("invalidated")
            expect(this.server.requests[0].url).toBe(this.view.collection.url())
        });

        it("fetches the versions set", function() {
            this.view.model.trigger("invalidated");
            expect(this.server.lastFetch().url).toBe(this.view.allVersions.url())
        });
    });

    describe("when the activity list collection is changed", function() {
        beforeEach(function() {
            spyOn(this.view, "postRender"); // check for #postRender because #render is bound
            this.view.collection.trigger("changed")
        })

        it("re-renders", function() {
            expect(this.view.postRender).toHaveBeenCalled();
        })
    });

    describe("when the version list collection is changed", function() {
        beforeEach(function() {
            spyOn(this.view, "postRender"); // check for #postRender because #render is bound
            this.view.allVersions.trigger("changed");
        })

        it("re-renders", function() {
            expect(this.view.postRender).toHaveBeenCalled();
        })
    })
});
