describe("chorus.dialogs.CopyWorkfile", function() {
    beforeEach(function() {
        this.launchElement = $("<a data-workspace-id='4' data-workfile-id='10'></a>")
    });

    it("does not re-render when the model changes", function() {
        var dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
        expect(dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        beforeEach(function() {
            setLoggedInUser({id: 4003});
            chorus.session.trigger("saved")
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
        })

        it("fetches all the workspaces", function() {
            expect(this.server.requests[0].url).toBe("/edc/workspace/?user=4003&page=1&rows=1000");
        })

        it("fetches the source workfile", function() {
            expect(this.server.requests[1].url).toBe("/edc/workspace/4/workfile/10")
        })

        it("instantiates a CollectionPicklist with the workspace collection", function() {
            expect(this.dialog.picklistView.collection).toBe(this.dialog.collection);
        })

        it("only gets the chorus.session.users()'s workspaces", function(){
            expect(this.dialog.collection.attributes.user).toBe(chorus.session.user());
        })
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
            spyOn(this.dialog.picklistView, "render");
            this.dialog.render();
        })

        it("renders the picklist view", function() {
            expect(this.dialog.picklistView.render).toHaveBeenCalled();
        })

        it("re-renders when the collection has been fetched", function() {
            this.dialog.picklistView.render.reset();
            this.dialog.collection.trigger("reset")
            expect(this.dialog.picklistView.render).toHaveBeenCalled();
        })
    })

    describe("copy file button", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
            this.dialog.render();
        })

        it("is initially disabled", function() {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        })

        describe("when an item is selected", function() {
            beforeEach(function() {
                this.dialog.picklistView.trigger("item:selected", true);
            })

            it("should enable the button", function() {
                expect(this.dialog.$("button.submit")).not.toBeDisabled();
            })

            describe("and it is subsequently deselected", function() {
                beforeEach(function() {
                    this.dialog.picklistView.trigger("item:selected", undefined);
                })

                it("should disable the button", function() {
                    expect(this.dialog.$("button.submit")).toBeDisabled();
                })
            })

        })
    })

    describe("clicking Copy File", function() {
        beforeEach(function() {
            fixtures.model = "Workspace";
            this.workspace = fixtures.modelFor("fetch");
            fixtures.model = "Workfile";
            this.workfile = fixtures.modelFor("fetch");
            this.dialog = new chorus.dialogs.CopyWorkfile({launchElement : this.launchElement });
            this.dialog.workfile = this.workfile;
            this.dialog.render();

            spyOn(this.dialog.picklistView, "selectedItem").andReturn(this.workspace);
            this.dialog.picklistView.trigger("item:selected", this.workspace);
            spyOn(chorus.router, "navigate")
            spyOn(this.dialog, "closeModal")
            this.dialog.$("button.submit").click();
        });

        it("calls the API", function() {
            expect(_.last(this.server.requests).url).toBe("/edc/workspace/" + this.workspace.get("id") + "/workfile");
            expect(_.last(this.server.requests).method).toBe("POST");
        })

        describe("when the workfile contains a description", function() {
            beforeEach(function() {
                this.workfile.set({ description : "my workfile" });
                this.dialog.$("button.submit").click();
            })

            it("includes the description in the API call", function() {
                expect(_.last(this.server.requests).requestBody).toContain("description=my+workfile");
            })
        })

        describe("when the workfile does not contain a description", function() {
            beforeEach(function() {
                this.workfile.unset("description");
                this.dialog.$("button.submit").click();
            })

            it("does not include the description in the API call", function() {
                expect(_.last(this.server.requests).requestBody).not.toContain("description=my+workfile");
            })
        })
        describe("when the API is successful", function() {
            beforeEach(function() {
                this.server.respondWith(
                    'POST',
                    "/edc/workspace/" + this.workspace.get("id") + "/workfile",
                    this.prepareResponse(fixtures.jsonFor("copy")));

                this.server.respond();
            })

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });

            it("does not navigate", function() {
                expect(chorus.router.navigate).not.toHaveBeenCalled();
            });
        })

        describe("when the API fails", function() {
            beforeEach(function() {
                this.server.respondWith(
                    'POST',
                    "/edc/workspace/" + this.workspace.get("id") + "/workfile",
                    this.prepareResponse(fixtures.jsonFor("copyFailed")));

                this.server.respond();
            })

            it("does not close the dialog", function() {
                expect(this.dialog.closeModal).not.toHaveBeenCalled();
            })

            it("displays the server error message", function() {
                expect(this.dialog.$(".errors ul").text().trim()).toBe("Workspace already has a workfile with this name. Specify a different name.")
            })
        })
    });
})
