describe("chorus.dialogs.ComposeKaggleMessage", function () {
    beforeEach(function () {
        setLoggedInUser(rspecFixtures.user({email: 'user@chorus.com'}));
        this.kaggleUser = new chorus.models.KaggleUser({fullName: "Batman"});
        this.workspace = rspecFixtures.workspace();
        this.dialog = new chorus.dialogs.ComposeKaggleMessage({
            recipient: this.kaggleUser,
            workspace: this.workspace
        });
        this.dialog.render();
    });

    describe('#render', function() {
        it("sets the workspace for the model", function() {
           expect(this.dialog.model.get('workspace')).toBe(this.workspace);
        });

        it("sets the default value of the from field to the users email", function() {
            expect(this.dialog.$('input[name=from]').val()).toBe('user@chorus.com');
        });

        it("displays the name of the kaggle recipient", function() {
            expect(this.dialog.$('.kaggle_recipient')).toContainText("Batman");
        });
    });

    describe("saving", function () {
        beforeEach(function () {
            this.dialog.$('input[name=from]').val('me@somewhere.com');
            this.dialog.$('input[name=subject]').val('Something cool');
            this.dialog.$('textarea[name=message]').val('Some stuff');

            spyOn(chorus.models.KaggleMessage.prototype, "save").andCallThrough();
            spyOn(this.dialog, "closeModal");
            spyOn(chorus, "toast");
            this.dialog.$('button.submit').click();
        });

        it("adds a spinner to the submit button", function () {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        it("saves the message with the new values", function () {
            var model = this.dialog.model;
            expect(model.save).toHaveBeenCalled();

            expect(model.get('from')).toEqual('me@somewhere.com');
            expect(model.get('subject')).toEqual('Something cool');
            expect(model.get('message')).toEqual('Some stuff');
        });

        it("closes the dialog box if saved successfully", function () {
            this.dialog.model.trigger("saved");
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("shows a toast message if saved successfully", function() {
            this.dialog.model.trigger("saved");
            expect(chorus.toast).toHaveBeenCalledWith('kaggle.compose.success');
        });

    });
});