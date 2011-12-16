describe("chorus.presenters.Activity", function(){
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    context(".WORKSPACE_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.WORKSPACE_CREATED();
            this.workspace = this.model.get("workspace");
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workspace.name);
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.id}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });
    });

    context(".WORKSPACE_DELETED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.WORKSPACE_DELETED();
            this.workspace = this.model.get("workspace");
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workspace.name);
        });
    });

    context(".USER_ADDED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.USER_ADDED();
            this.user = new chorus.models.User(this.model.get("user"))
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.user.get("name"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.user.showUrl());
        });

        it("should have the new user's icon", function() {
            expect(this.presenter.iconSource).toBe(this.user.imageUrl());
        });

        it("should link the new user's icon to the new user's show page", function() {
            expect(this.presenter.iconHref).toBe(this.user.showUrl());
        });
    });

    context(".WORKFILE_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.WORKFILE_CREATED();
            this.workspace = this.model.get("workspace");
            this.workfile = this.model.get("workfile");
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workfile.name);
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workfile({id: this.workfile.id, workspaceId : this.workspace.id}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        it("should have the right workspaceName", function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.name);
        });

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.id}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });
    });
});
