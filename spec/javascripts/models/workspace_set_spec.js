describe("WorkspaceSet", function() {
    var models = chorus.models;

    beforeEach(function() {
        fixtures.model = 'WorkspaceSet';
        this.collection = new models.WorkspaceSet();
    });

    describe("without filtering", function() {
        it("creates the right URL", function() {
            expect(this.collection.url()).toBe("/edc/workspace/?page=1&rows=50");
        });
    })
    describe("with filtering active is true", function() {
        beforeEach(function() {
            this.collection.attributes.active = true
        });
        it("it has correct Url", function() {
            expect(this.collection.url()).toBe("/edc/workspace/?active=true&page=1&rows=50");
        });
    });

    context("members", function(){
        beforeEach(function() {
            this.collection.attributes.membersOnly = true;
            if (!chorus.session) chorus.session = new chorus.models.Session();
            chorus.session.set({id : 199});
        });

        it("it has correct Url", function() {
            expect(this.collection.url()).toBe("/edc/workspace/?user=199&page=1&rows=50");
        });

        it("it has correct Url when both are true", function() {
            this.collection.attributes.membersOnly = true;
            this.collection.attributes.active = true;
            expect(this.collection.url()).toBe("/edc/workspace/?active=true&user=199&page=1&rows=50");
        });
    });
});
