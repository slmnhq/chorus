describe("chorus.presenters.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    context(".NOTE_ON_WORKSPACE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_WORKSPACE();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workspace.get("name"));
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    })

    context(".NOTE_ON_WORKFILE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_WORKFILE();
            this.workspace = this.model.workspace();
            this.workfile = this.model.workfile();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workfile.get("name"));
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workfile({id: this.workfile.get("id"), workspaceId : this.workspace.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        it('should have the right workspaceName', function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.get("name"));
        })

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    })

    context(".NOTE_ON_INSTANCE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_INSTANCE();
            this.instance = this.model.instance();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.instance.get("name"));
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Instance({id: this.instance.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    })

    context(".INSTANCE_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.INSTANCE_CREATED();
            this.instance = this.model.instance();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.instance.get('name'));
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Instance({id: this.instance.id}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".WORKSPACE_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKSPACE_CREATED();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workspace.get("name"));
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".WORKSPACE_ARCHIVED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKSPACE_ARCHIVED();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workspace.get("name"));
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".WORKSPACE_UNARCHIVED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKSPACE_UNARCHIVED();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workspace.get("name"));
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".MEMBERS_ADDED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.MEMBERS_ADDED();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right count", function() {
            expect(this.presenter.header.count).toBe(this.model.get("user").length - 1);
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
            this.model = fixtures.activities.MEMBERS_DELETED();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should populate 'others' to not include the first user", function() {
            expect(this.presenter.header.count).toBe(this.model.get("user").length - 1);
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
            this.model = fixtures.activities.WORKSPACE_DELETED();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workspace.get("name"));
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".USER_ADDED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.USER_ADDED();
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
            this.model = fixtures.activities.USER_DELETED();
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
            this.model = fixtures.activities.WORKFILE_CREATED();
            this.workspace = this.model.workspace();
            this.workfile = this.model.workfile();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workfile.get("name"));
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workfile({id: this.workfile.get("id"), workspaceId : this.workspace.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        it("should have the right workspaceName", function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.get("name"));
        });

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".WORKFILE_UPGRADED_VERSION", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKFILE_UPGRADED_VERSION();
            this.workspace = this.model.workspace();
            this.workfile = this.model.workfile();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right iconUrl", function() {
            expect(this.presenter.iconSrc).toBe("/images/version_large.png");
        });

        it("should have the right iconHref", function() {
            expect(this.presenter.iconHref).toBe(this.workfile.showUrl());
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workfile.get("name"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.workfile.showUrl());
        });

        it("has the right versionName", function() {
            expect(this.presenter.versionName).toMatchTranslation("workfile.version_title", { versionNum : "3" });
        })

        it("has the right versionUrl", function() {
            expect(this.presenter.versionUrl).toBe(this.workfile.showUrl());
        })

        it("should have the right workspaceName", function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.get("name"));
        });

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        it("has the right body", function() {
            expect(this.presenter.body).toBe("make file better")
        })
    });

    context(".WORKSPACE_ADD_SANDBOX", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKSPACE_ADD_SANDBOX();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right workspaceName", function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.get("name"));
        });

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context("headerHtml", function() {
        describe("#headerTranslationKey", function() {
            beforeEach(function() {
                this.keyPrefix = 'activity_stream.header.html.';
                this.model = fixtures.activities.NOTE_ON_WORKSPACE();
                this.workspace = this.model.workspace();
            });

            context("when displayStyle is not set", function() {
                beforeEach(function() {
                    this.presenter = new chorus.presenters.Activity(this.model);
                });

                it("uses the default displayStyle", function() {
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.default';
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });
            });

            context("when displayStyle is a string", function() {
                beforeEach(function() {
                    this.presenter = new chorus.presenters.Activity(this.model, {displayStyle : 'without_object'});
                });

                it("returns the displayStyle when it exists", function() {
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.without_object';
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });

                it("returns the default when it does not exists", function() {
                    this.model.set({type: 'WORKSPACE_CREATED'});
                    var missingKey = this.keyPrefix + this.model.get('type') + '.without_object';
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.default';
                    expect(I18n.lookup(missingKey)).toBeFalsy();
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });

                it("uses type of DEFAULT when the model's type does not have a translation", function() {
                    this.model.set({type: 'BANNANA'});
                    var expectedKey = this.keyPrefix + 'DEFAULT.default';
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });
            });

            context("when displayStyle is an array", function() {
                it("returns the first key when it exists", function() {
                    this.presenter = new chorus.presenters.Activity(this.model, {displayStyle : ['without_object', 'without_workspace']});
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.without_object';
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });

                it("falls back to the next match when the first key doesn't exist", function() {
                    this.presenter = new chorus.presenters.Activity(this.model, {displayStyle : ['banana', 'without_object', 'without_workspace']});
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.without_object';
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });

                it("falls back on default when none of them exist", function() {
                    this.presenter = new chorus.presenters.Activity(this.model, {displayStyle : ['banana', 'apple']});
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.default';
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });
            });
        });
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
                expect(self.presenter.attachments[index].name).toBe(artifact.name);
            });
        })

        it("should have the download URLs", function() {
            var artifacts = this.model.get("artifacts");
            var self = this;
            expect(artifacts.length).not.toBe(0);
            _.each(artifacts, function(artifact, index) {
                var model = new chorus.models.Artifact(artifact);
                var artifactPresenter = new chorus.presenters.Artifact(model);
                expect(self.presenter.attachments[index].url).toBe(artifactPresenter.url);
            });
        })
    }
});
