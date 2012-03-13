describe("chorus.dialogs.PickWorkspace", function() {
    beforeEach(function() {
        setLoggedInUser({id: 4003});
        chorus.session.trigger("saved")
        this.launchElement = $("<a></a>")
        this.dialog = new chorus.dialogs.PickWorkspace({launchElement : this.launchElement});
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy()
    })

    describe("#setup", function() {
        it("fetches all the workspaces", function() {
            expect(this.server.lastFetch().url).toBe("/edc/workspace/?user=4003&page=1&rows=1000");
        })

        it("instantiates a CollectionPicklist with the workspace collection", function() {
            expect(this.dialog.picklistView.collection).toBe(this.dialog.collection);
        })

        it("only gets the chorus.session.users()'s workspaces", function(){
            expect(this.dialog.collection.attributes.userId).toBe(chorus.session.user().get("id"));
        })

        context("when the launch element activeOnly is set to true", function() {
            beforeEach(function() {
                this.launchElement.data('activeOnly', true);
                this.dialog = new chorus.dialogs.PickWorkspace({launchElement : this.launchElement});
            });

            it("only fetches the active workspaces", function() {
                expect(this.dialog.collection.attributes.active).toBeTruthy();
            });
        });
    })

    describe("#render", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.PickWorkspace({launchElement : this.launchElement});
            this.dialog.buttonTitle = "Some button";
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

        it("uses the supplied buttonTitle for the submit button's text", function() {
            expect(this.dialog.$("button.submit").text().trim()).toBe("Some button");
        });
    })

    describe("choose workspace button", function() {
        beforeEach(function() {
            this.dialog = new chorus.dialogs.PickWorkspace({launchElement : this.launchElement });
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

    describe("clicking the choose workspace button", function() {
        beforeEach(function() {
            this.workspace = fixtures.workspace();
            this.dialog = new chorus.dialogs.PickWorkspace({launchElement : this.launchElement });
            this.dialog.render();

            spyOn(chorus, "toast");
            spyOn(this.dialog.picklistView, "selectedItem").andReturn(this.workspace);
            this.dialog.picklistView.trigger("item:selected", this.workspace);

            this.dialog.callback = jasmine.createSpy("callback");
            this.dialog.$("button.submit").click();
        });

        it("calls the callback", function() {
            expect(this.dialog.callback).toHaveBeenCalled();
        })
    });
})
