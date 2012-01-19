describe("chorus.alerts.WorkfileDraft", function() {
    beforeEach(function() {
        fixtures.model = 'Workfile';
        this.workfile = fixtures.workfile({ hasDraft : true, content : "version content" });
        this.alert = new chorus.alerts.WorkfileDraft({ model : this.workfile });
        this.alert.render();
    });

    describe("choosing the draft", function() {
        beforeEach(function() {
            spyOn(this.alert, "closeModal");
            this.alert.$("button.submit").click();
        })

        it("fetches the draft workfile", function() {
            expect(this.server.requests[0].url).toBe(this.workfile.url() + "/draft")
        })

        describe("when the fetch succeeds", function() {
            beforeEach(function() {
                this.changeSpy = jasmine.createSpy();
                this.alert.model.bind('change', this.changeSpy);
                this.server.respondWith(
                    'GET',
                    "/edc/workspace/2/workfile/1/draft",
                    this.prepareResponse(fixtures.jsonFor("fetchWithDraft")));

                this.server.respond();
            })

            it("sets the page model content to the draft content", function() {
                expect(this.alert.model.get("content")).toBe("draft content");
            })

            it("triggers change on the page model", function() {
                expect(this.changeSpy).toHaveBeenCalled();
            })

            it("sets the isDraft flag in the page model", function() {
                expect(this.alert.model.isDraft).toBeTruthy();
            });
        })

        it("closes the alert", function() {
            expect(this.alert.closeModal).toHaveBeenCalled();
        })
    })

    describe("choosing the saved version", function() {
        beforeEach(function() {
            spyOn(this.alert, "closeModal");
            this.alert.$("button.cancel").click();
        })

        it("fetches the draft", function() {
            expect(this.server.lastFetch().url).toBe("/edc/workspace/2/workfile/1/draft");
            expect(this.server.lastFetch().method).toBe("GET");
        });

        context("and the fetch returns", function() {
            beforeEach(function() {
                this.server.lastFetch().succeed([fixtures.draftJson({ workspaceId : "2", workfileId : "1" })]);
            })

            it("deletes the draft", function() {
                expect(this.server.lastDestroy().url).toBe("/edc/workspace/2/workfile/1/draft");
            })

            context("when the delete succeeds", function() {
                beforeEach(function() {
                    this.server.lastDestroy().succeed([]);
                })

                it("sets hasDraft to false in the workfile", function() {
                    expect(this.workfile.get("hasDraft")).toBeFalsy();
                })
            })
        })
    })
})
