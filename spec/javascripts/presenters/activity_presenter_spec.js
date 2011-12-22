describe("chorus.presenters.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    context(".NOTE_ON_WORKSPACE", function() {
        beforeEach(function() {
            this.model = fixtures.activity.NOTE_ON_WORKSPACE();
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

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    })

    context(".NOTE_ON_WORKFILE", function() {
        beforeEach(function() {
            this.model = fixtures.activity.NOTE_ON_WORKFILE();
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

        it('should have the right workspaceName', function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.name);
        })

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.id}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    })

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

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".WORKSPACE_ARCHIVED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.WORKSPACE_ARCHIVED();
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

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".WORKSPACE_UNARCHIVED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.WORKSPACE_UNARCHIVED();
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

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".MEMBERS_ADDED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.MEMBERS_ADDED();
            this.workspace = this.model.get("workspace");
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should populate 'others' to not include the first user", function() {
            expect(this.presenter.header.others.length).toBe(this.model.get("user").length - 1);
            expect(this.presenter.header.others[0].name).not.toBe(this.model.get("user")[0].name);
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.model.get("user")[0].name);
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.User({id: this.model.get("user")[0].id}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".MEMBERS_DELETED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.MEMBERS_DELETED();
            this.workspace = this.model.get("workspace");
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should populate 'others' to not include the first user", function() {
            expect(this.presenter.header.others.length).toBe(this.model.get("user").length - 1);
            expect(this.presenter.header.others[0].name).not.toBe(this.model.get("user")[0].name);
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.model.get("user")[0].name);
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.User({id: this.model.get("user")[0].id}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        itShouldHaveTheAuthorsIconAndUrl();
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

        itShouldHaveTheAuthorsIconAndUrl();
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
            expect(this.presenter.iconSrc).toBe(this.user.imageUrl());
        });

        it("should link the new user's icon to the new user's show page", function() {
            expect(this.presenter.iconHref).toBe(this.user.showUrl());
        });
    });

    context(".USER_DELETED", function() {
        beforeEach(function() {
            this.model = fixtures.activity.USER_DELETED();
            this.user = new chorus.models.User(this.model.get("user"))
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.user.get("name"));
        });

        itShouldHaveTheAuthorsIconAndUrl();
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

        itShouldHaveTheAuthorsIconAndUrl();
    });

    function itShouldHaveTheAuthorsIconAndUrl() {
        it("should have the author's icon", function() {
            expect(this.presenter.iconSrc).toBe(this.model.author().imageUrl());
        });

        it("should link the new user's icon to the new user's show page", function() {
            expect(this.presenter.iconHref).toBe(this.model.author().showUrl());
        });
    }

    function itShouldHaveFileAttachments() {
        it("should have the file icon urls", function() {
            var artifacts = this.model.get("artifacts");
            var self = this;
            expect(artifacts.length).not.toBe(0);
            _.each(artifacts, function(artifact, index) {
                expect(self.presenter.attachments[index].iconSrc).toBe(chorus.urlHelpers.fileIconUrl(artifact.type, "medium"));
            });
        })

        it("should have the file name", function() {
            var artifacts = this.model.get("artifacts");
            var self = this;
            expect(artifacts.length).not.toBe(0);
            _.each(artifacts, function(artifact, index) {
                expect(self.presenter.attachments[index].fileName).toBe(artifact.name);
            });
        })

        it("should have the download URLs", function() {
            var artifacts = this.model.get("artifacts");
            var self = this;
            expect(artifacts.length).not.toBe(0);
            _.each(artifacts, function(artifact, index) {
                expect(self.presenter.attachments[index].downloadUrl).toBe('/edc/file/' + artifact.entityId);
            });
        })
    }
});
