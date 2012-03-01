describe("chorus.presenters.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    context(".NOTE_ON_ANYTHING", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_DATASET_TABLE({});
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("sets the isOwner field to false", function() {
            expect(this.presenter.isOwner).toBeFalsy();
        });

        it("should have the correct entityType", function() {
            expect(this.presenter.entityType).toBe("comment");
        });

        context("when the logged in user owns the file", function() {
            beforeEach(function() {
                setLoggedInUser({name: "Lenny", lastName: "lalala", id: this.model.author().id});
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("sets the isOwner field to true", function() {
                expect(this.presenter.isOwner).toBeTruthy();
            });
        })
    });

    context(".NOTE_ON_TABLE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_DATASET_TABLE({
                table: {
                    id: "10014|silverware|forks|shiny",
                    name: "shiny",
                    type: "SOURCE_TABLE",
                    objectType: "EXTERNAL_TABLE"
                },
                workspace: {
                    id: '4',
                    name: "janitorial_duties"
                }
            });
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe('shiny');
        });

        it("should have the 'isNote' property set to true", function() {
            expect(this.presenter.isNote).toBeTruthy();
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe('#/workspaces/4/datasets/10014|silverware|forks|shiny');
        });

        it("should have the right objectType", function() {
            expect(this.presenter.header.objectType).toMatchTranslation("dataset.title_lower");
        })
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

        it("should have the 'isNote' property set to true", function() {
            expect(this.presenter.isNote).toBeTruthy();
        });

        it("should have the right objectUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        it("should have the right objectType", function() {
            expect(this.presenter.header.objectType).toMatchTranslation("workspaces.title_lower");
        })

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
            var url = new chorus.models.Workfile({id: this.workfile.get("id"), workspaceId: this.workspace.get("id")}).showUrl();
            expect(this.presenter.objectUrl).toBe(url);
        });

        it('should have the right workspaceName', function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.get("name"));
        })

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        it("should have the right objectType", function() {
            expect(this.presenter.header.objectType).toMatchTranslation("workfiles.title_lower");
        })

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

        it("should have the right objectType", function() {
            expect(this.presenter.header.objectType).toMatchTranslation("instances.title_lower")
        })

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    })

    context(".NOTE_ON_DATABASE_TABLE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_DATABASE_TABLE();
            this.databaseObject = this.model.databaseObject();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.databaseObject.get("objectName"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.databaseObject.showUrl());
        });

        it("should have the right objectType", function() {
            expect(this.presenter.header.objectType).toMatchTranslation("database_object." + this.databaseObject.get("objectType"))
        })

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    })

    context(".NOTE_ON_THING_WE_DONT_SUPPORT_YET", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_THING_WE_DONT_SUPPORT_YET();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should not blow up", function() {
            expect(this.presenter.objectName).toContain("don't know object name for activity type:");
        });

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    })

    context(".INSIGHT_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.INSIGHT_CREATED();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the correct entityType", function() {
            expect(this.presenter.entityType).toBe("comment");
        });
    })

    context(".RECEIVE_NOTE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.RECEIVE_NOTE();
            this.presenter = new chorus.presenters.Activity(this.model, {isNotification: true});
        });

        it("should have the correct entityType", function() {
            expect(this.presenter.entityType).toBe("comment");
        });
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

        it("should have the 'isNote' property set to false", function() {
            expect(this.presenter.isNote).toBeFalsy();
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

        it("should have the 'isNote' property set to false", function() {
            expect(this.presenter.isNote).toBeFalsy();
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

    context(".BE_MEMBER", function() {
        beforeEach(function() {
            this.model = fixtures.notifications.BE_MEMBER().activity();
            this.author = this.model.author();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the right workspace name", function() {
            expect(this.presenter.objectName).toBe(this.workspace.get("name"));
        });

        it("should have the right link to the workspace", function() {
            expect(this.presenter.objectUrl).toBe(this.workspace.showUrl());
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".WORKFILE_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKFILE_CREATED();
            this.workspace = this.model.workspace();
            this.workfile = this.model.workfile();
            spyOn(this.workfile, "linkUrl").andReturn("frobble");
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workfile.get("name"));
        });

        it("delegates to Workfile#linkUrl for the objectUrl", function() {
            expect(this.workfile.linkUrl).toHaveBeenCalledWith({ version: 1 });
            expect(this.presenter.objectUrl).toBe("frobble");
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
            spyOn(this.workfile, "linkUrl").andReturn("frobble");
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right iconUrl", function() {
            expect(this.presenter.iconSrc).toBe("/images/version_large.png");
        });

        it("should have the right iconHref", function() {
            expect(this.presenter.iconHref).toBe(this.workfile.showUrl());
        });

        it("should not have an iconClass", function() {
            expect(this.presenter.iconClass).toBe('');
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workfile.get("name"));
        });

        it("delegates to Workfile#linkUrl for the objectUrl", function() {
            expect(this.workfile.linkUrl).toHaveBeenCalled();
            expect(this.presenter.objectUrl).toBe("frobble");
        });

        it("has the right versionName", function() {
            expect(this.presenter.versionName).toMatchTranslation("workfile.version_title", { versionNum: this.model.get('version') });
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

    context(".WORKSPACE_ADD_TABLE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKSPACE_ADD_TABLE();
            this.dataset = this.model.dataset();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the correct workspace name", function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.get("name"));
        });

        it("should have the correct worksapce url", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        it("should have the correct table name", function() {
            expect(this.presenter.objectName).toBe(this.dataset.get("objectName"));
        });

        it("should have the correct table url", function() {
            expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
        });

        it("should have the correct icon url", function() {
            expect(this.presenter.iconSrc).toBe(this.dataset.iconUrl());
        });
    });

    context(".SOURCE_TABLE_CREATED", function() {
        context("for a table", function() {
            beforeEach(function() {
                this.model = fixtures.activities.SOURCE_TABLE_CREATED();
                this.model.get('databaseObject').type = "SOURCE_TABLE";
                this.model.get('databaseObject').objectType = "TABLE";
                this.dataset = this.model.dataset();
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

            it("should say 'table' in the header", function() {
                expect(this.presenter.headerHtml).toContainTranslation("dataset.types.table");
            });

            it("should have the right objectName", function() {
                expect(this.presenter.objectName).toBe(this.dataset.get("objectName"));
            });

            it("should have the right objectUrl", function() {
                expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
            });

            itShouldHaveTheAuthorsIconAndUrl();
        });

        context("for a view", function() {
            beforeEach(function() {
                this.model = fixtures.activities.SOURCE_TABLE_CREATED();
                this.model.get('databaseObject').type = "SOURCE_TABLE";
                this.model.get('databaseObject').objectType = "VIEW";
                this.dataset = this.model.dataset();
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

            it("should say 'view' in the header", function() {
                expect(this.presenter.headerHtml).toContainTranslation("dataset.types.view");
            });

            it("should have the right objectName", function() {
                expect(this.presenter.objectName).toBe(this.dataset.get("objectName"));
            });

            it("should have the right objectUrl", function() {
                expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
            });

            itShouldHaveTheAuthorsIconAndUrl();
        });
    });

    context(".CHORUS_VIEW_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.CHORUS_VIEW_CREATED();
            this.dataset = this.model.dataset();
            this.workspace = this.model.workspace();
            this.sourceObject = this.model.sourceDataset();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right workspaceName", function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.get("name"));
        });

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        it("should say 'table' in the header", function() {
            expect(this.presenter.headerHtml).toContainTranslation("dataset.types.table");
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.dataset.get("objectName"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
        });

        it("should have the right tableName it was derived from", function() {
            expect(this.presenter.tableName).toBe(this.sourceObject.get('objectName'));
        });

        it("should have the right tableUrl it was derived from", function() {
            expect(this.presenter.tableUrl).toBe(this.sourceObject.showUrl());
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".DATASET_CHANGED_QUERY", function() {
        beforeEach(function() {
            this.model = fixtures.activities.DATASET_CHANGED_QUERY();
            this.dataset = this.model.dataset();
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

        it("should say 'edited chorus view' in the header", function() {
            expect(this.presenter.headerHtml).toContainTranslation("dataset.types.query_change");
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.dataset.get("objectName"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context("headerHtml", function() {
        beforeEach(function() {
            this.keyPrefix = 'activity_stream.header.html.';
        });

        describe("WORKSPACE_ADD_TABLE", function() {
            beforeEach(function() {
                this.model = fixtures.activities.WORKSPACE_ADD_TABLE();
            });

            itGetsTheTranslationKeyCorrectly('default');
        });

        describe("INSIGHT_CREATED", function() {
            beforeEach(function() {
                this.model = fixtures.activities.INSIGHT_CREATED();
            });

            it("uses the NOTE translation keys", function() {
                var presenter = new chorus.presenters.Activity(this.model, {displayStyle: 'withoutWorkspace'});
                expect(presenter._impl.headerTranslationKey()).toBe(this.keyPrefix + "NOTE.without_workspace");
            });
        });

        describe("RECEIVE_NOTE", function() {
            beforeEach(function() {
                this.model = fixtures.activities.RECEIVE_NOTE();
            });

            it("uses the NOTE translation keys", function() {
                var presenter = new chorus.presenters.Activity(this.model, {isNotification: true});
                expect(presenter._impl.headerTranslationKey()).toBe(this.keyPrefix + "NOTE.notification.without_workspace");
            });
        });

        describe("#headerTranslationKey with workspace_created", function() {
            beforeEach(function() {
                this.model = fixtures.activities.WORKSPACE_CREATED();
            });

            it("when displayStyle is a string it returns the default when it does not exist", function() {
                this.presenter = new chorus.presenters.Activity(this.model, {displayStyle: 'without_object'});
                var missingKey = this.keyPrefix + this.model.get('type') + '.without_object';
                var expectedKey = this.keyPrefix + this.model.get('type') + '.without_workspace';
                expect(I18n.lookup(missingKey)).toBeFalsy();
                expect(I18n.lookup(expectedKey)).toBeTruthy();
                expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
            });
        });

        describe("#headerTranslationKey with note on workspace", function() {
            beforeEach(function() {
                this.model = fixtures.activities.NOTE_ON_WORKSPACE();
            });

            itGetsTheTranslationKeyCorrectly('without_workspace');

            it("uses the notification message when the 'isNotification' option is passed", function() {
                this.presenter = new chorus.presenters.Activity(this.model, {isNotification: true});
                expect(this.presenter._impl.headerTranslationKey()).toEqual("activity_stream.header.html.NOTE.notification.without_workspace");
            });
        });

        describe("#headerTranslationKey with note on workfile", function() {
            beforeEach(function() {
                this.model = fixtures.activities.NOTE_ON_WORKFILE();
            });

            itGetsTheTranslationKeyCorrectly('default');
        });

        describe("#headerTranslationKey with note on instance", function() {
            beforeEach(function() {
                this.model = fixtures.activities.NOTE_ON_INSTANCE();
            });

            itGetsTheTranslationKeyCorrectly('without_workspace');
        });

        describe("#headerTranslationKey with a BE_MEMBER notifiction", function() {
            beforeEach(function() {
                this.model = fixtures.notifications.BE_MEMBER().activity();
                this.presenter = new chorus.presenters.Activity(this.model, {isNotification: true});
            });

            it("should return the correct notification translation key", function() {
                expect(this.presenter._impl.headerTranslationKey()).toEqual("activity_stream.header.html.BE_MEMBER.notification.without_workspace");
            });
        });

        function itGetsTheTranslationKeyCorrectly(expectedKeySuffix) {
            context("when displayStyle is not set", function() {
                beforeEach(function() {
                    this.presenter = new chorus.presenters.Activity(this.model);
                });

                it("uses the " + expectedKeySuffix + " displayStyle", function() {
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.' + expectedKeySuffix;
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });
            });

            context("when displayStyle is a string", function() {
                beforeEach(function() {
                    this.presenter = new chorus.presenters.Activity(this.model, {displayStyle: 'without_object'});
                });

                it("returns the displayStyle when it exists", function() {
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.without_object';
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });

                it("uses type of DEFAULT when the model's type does not have a translation", function() {
                    this.model.set({type: 'BANANA'});
                    var expectedKey = this.keyPrefix + 'DEFAULT.' + expectedKeySuffix;
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });
            });

            context("when displayStyle is an array", function() {
                it("returns the first key when it exists", function() {
                    this.presenter = new chorus.presenters.Activity(this.model, {displayStyle: ['without_object', 'without_workspace']});
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.without_object';
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });

                it("falls back to the next match when the first key doesn't exist", function() {
                    this.presenter = new chorus.presenters.Activity(this.model, {displayStyle: ['banana', 'without_object', 'without_workspace']});
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.without_object';
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });

                it("falls back on default when none of them exist", function() {
                    this.presenter = new chorus.presenters.Activity(this.model, {displayStyle: ['banana', 'apple']});
                    var expectedKey = this.keyPrefix + this.model.get('type') + '.' + expectedKeySuffix;
                    expect(I18n.lookup(expectedKey)).toBeTruthy();
                    expect(this.presenter._impl.headerTranslationKey()).toBe(expectedKey);
                });
            });
        }
    });

    context("when no author information is present", function() {
        beforeEach(function() {
            this.model.unset("author");
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("does not set the author-related keys", function() {
            expect(this.presenter.author).toBeUndefined(); 
            expect(this.presenter.iconSrc).toBeUndefined(); 
            expect(this.presenter.iconHref).toBeUndefined(); 
            expect(this.presenter.header.authorLink).toBeUndefined(); 
        });
    });
    function itShouldHaveTheAuthorsIconAndUrl() {
        it("should have the author's icon", function() {
            expect(this.presenter.iconSrc).toBe(this.model.author().imageUrl());
        });

        it("should link the new user's icon to the new user's show page", function() {
            expect(this.presenter.iconHref).toBe(this.model.author().showUrl());
        });

        it("should have a iconClass of 'profile'", function() {
            expect(this.presenter.iconClass).toBe('profile');
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
