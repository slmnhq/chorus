describe("chorus.alerts.WorkfileConflict", function() {
    beforeEach(function() {
        this.modalSpy = stubModals();
        this.useFakeTimers();

        this.workfile = fixtures.workfile({ content : "version content" });
        this.message = "This work file has been modified by Christine Klunk"
        this.workfile.serverErrors = [{message: this.message}];
        this.alert = new chorus.alerts.WorkfileConflict({ model : this.workfile });
        this.alert.render();
    });

    describe("#render", function() {
        it("should show the server message", function() {
            expect(this.alert.title).toBe(this.message)
        });

        it("should show the last workfile save time", function() {
            expect(this.alert.text).toMatchTranslation("workfile.conflict.alert.text");
        });

        it("should display 'Save As New Version' for the submit button", function() {
            expect(this.alert.$("button.submit").text().trim()).toMatchTranslation("workfile.conflict.alert.submit");
        });

        it("should display 'Discard Changes' for the cancel button", function() {
            expect(this.alert.$("button.cancel").text().trim()).toMatchTranslation("workfile.conflict.alert.cancel");
        });
    });

    describe("choosing 'Save As New Version", function() {
        beforeEach(function() {
            spyOn(this.alert, "closeModal");
            this.alert.$("button.submit").click();
        });

        it("should show the workfile new version dialog", function() {
            expect(this.modalSpy).toHaveModal(chorus.dialogs.WorkfileNewVersion);
        });
    });

    describe("choosing 'Discard Changes'", function() {
        beforeEach(function() {
            spyOn(this.alert, "closeModal");
            spyOnEvent(this.alert.model, "invalidated");
            this.alert.$("button.cancel").click();
            this.draft = fixtures.draft({workspaceId: this.workfile.get("workspaceId"), workfileId: this.workfile.get("id")});
        });

        it("fetches the draft", function() {
            expect(this.server.requests[0].url).toBe(this.draft.url());
            expect(this.server.requests[0].method).toBe("GET");
        });

        it("should show the latest version of the file in edit mode", function() {
            expect(this.server.requests[1].url).toBe(this.workfile.url());
            expect(this.server.requests[1].method).toBe("GET");
        });

        context("and the fetch returns", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.draft);
            })

            it("deletes the draft", function() {
                expect(_.last(this.server.requests).url).toBe(this.draft.url());
                expect(_.last(this.server.requests).method).toBe("DELETE");
            })
        })

        it("should close the dialog", function() {
            expect(this.alert.closeModal).toHaveBeenCalled();
        });
    });
})
