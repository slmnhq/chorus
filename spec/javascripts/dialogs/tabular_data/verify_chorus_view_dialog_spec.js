describe("chorus.dialogs.VerifyChorusView", function() {
    beforeEach(function() {
        stubModals();
        stubDefer();
        spyOn(CodeMirror, "fromTextArea").andCallThrough();
        this.launchElement = $("<a></a>");
        this.chorusView = newFixtures.datasetChorusView({ query: "select name, quantity from shipments;" });
        this.dialog = new chorus.dialogs.VerifyChorusView({
            model: this.chorusView,
            launchElement: this.launchElement
        });
        this.dialog.launchModal();
    });

    it("has an editable CodeMirror", function() {
        expect(CodeMirror.fromTextArea.calls[0].args[1].readOnly).toBeUndefined();
    });

    it("displays the model's query in the sql editor", function() {
        expect(this.dialog.$("textarea").val()).toBe(this.chorusView.get("query"));
    });

    it("has a button to start assigning a name to the chorus view", function() {
        expect(this.dialog.$("button.submit").text()).toMatchTranslation("dataset.verify_chorus_view.assign_name");
    });

    describe("clicking the Create Chorus View button", function() {
        beforeEach(function() {
            spyOn(this.dialog, "launchSubModal");
            this.dialog.editor.setValue("newquery");
            this.dialog.$("form").submit();
        });

        it("opens a NameChorusView sub-modal", function() {
            expect(this.dialog.launchSubModal).toHaveBeenCalled();
            expect(this.dialog.launchSubModal.mostRecentCall.args[0]).toBeA(chorus.dialogs.NameChorusView);
        });

        it("copies SQL from editor to model before launching submodal", function() {
            var namingDialog = this.dialog.launchSubModal.mostRecentCall.args[0];

            expect(namingDialog.model.get("query")).toBe("newquery")
        });

    });

    describe("editing the SQL", function() {
        beforeEach(function() {
            this.dialog.editor.setValue("newquery");
        });

        it("uses the changed SQL for the Data Preview", function() {
            this.dialog.$("button.preview").click();

            expect(this.server.lastCreate().requestBody).toContain("query=newquery");
        });
    });
});
