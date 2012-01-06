describe("WorkspaceSet", function() {
    var models = chorus.models;

    beforeEach(function() {
        this.collection = new models.WorkspaceSet();
    });

    describe("without filtering", function() {
        it("has the pagination/row params by default", function() {
            expect(this.collection.url()).toMatchUrl("/edc/workspace/?page=1&rows=50");
        });
    });

    describe("with filtering active is true", function() {
        it("it sets the 'active' param", function() {
            this.collection.attributes.active = true
            expect(this.collection.url()).toMatchUrl("/edc/workspace/?active=true&page=1&rows=50");
        });
    });

    context("with a userId", function(){
        it("sets the 'user' param", function() {
            this.collection.attributes.user = new chorus.models.User({id: 199});
            expect(this.collection.url()).toMatchUrl("/edc/workspace/?user=199&page=1&rows=50");
        });
    })

    context("with showLatestComments", function() {
        it("it sets the 'showLatestComments' param", function() {
            this.collection.attributes.showLatestComments = true
            expect(this.collection.url()).toMatchUrl("/edc/workspace/?showLatestComments=true&page=1&rows=50");
        });
    })

    context("with multiple paramaters", function(){
        it("it has correct Url when both are true", function() {
            this.collection.attributes.user = new chorus.models.User({id: 20});
            this.collection.attributes.active = true;
            expect(this.collection.url()).toMatchUrl("/edc/workspace/?active=true&user=20&page=1&rows=50");
        });
    });
});
