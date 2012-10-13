describe("chorus.models.KaggleMessage", function() {
    beforeEach(function () {
        this.attrs = {
            recipient: rspecFixtures.kaggleUserSet().at(0),
            subject: 'This is a valid subject',
            from: 'user@emc.com',
            message: 'Please analyze my data',
            workspace: rspecFixtures.workspace({id: 100})
        };
        this.model = new chorus.models.KaggleMessage(this.attrs);
    });

    describe("url", function() {
        it("equals /workspaces/:id/kaggle/messages", function() {
            expect(this.model.url()).toEqual('/workspaces/100/kaggle/messages');
        })
    });

    describe("validations", function() {
        it("can be valid", function() {
           expect(this.model.performValidation(this.attrs)).toBeTruthy();
        });

        it("requires from address", function () {
            this.attrs.from = "";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors.from).toBeTruthy();
        });

        it("requires from address to be a valid email", function() {
            this.attrs.from = "notavalid/email.com";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors.from).toBeTruthy();
        });

        it("requires subject", function () {
            this.attrs.subject = "";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors.subject).toBeTruthy();
        });

        it("requires a message", function() {
            this.attrs.message = "";
            expect(this.model.performValidation(this.attrs)).toBeFalsy();
            expect(this.model.errors.message).toBeTruthy();
        });
    });
});