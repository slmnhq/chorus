describe("chorus.presenters.Activity", function() {
    context(".IMPORT_CREATED", function() {
        context("when importing from a file", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_CREATED_FILE();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the file name", function() {
                expect(this.presenter.importSourceName).toBe("some.csv");
            });

            it("should have an iconClass", function() {
                expect(this.presenter.iconClass).toBe('profile');
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.file")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.file");
            });

            itShouldHaveUserIcon();
            itShouldHaveDestinationTableLink();
        });

        context("when importing from a source table", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_CREATED_SOURCE_TABLE();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.table")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.table");
            });

            it("should have the right importSourceName", function() {
                expect(this.presenter.importSourceName).toBe("clv_data")
            });

            it("should have the right importSourceUrl", function() {
                expect(this.presenter.importSourceUrl).toMatchUrl('#/workspaces/10000/datasets/' + encodeURIComponent('"10010"|"Analytics"|"analytics"|"TABLE"|"clv_data"'));
            });


            it("should have an importSourceLink in the header", function() {
                expect(this.presenter.header.importSourceLink).toBeDefined();
            });

            itShouldHaveUserIcon();
            itShouldHaveDestinationTableLink();
        });

        context("when importing from a view", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_CREATED_VIEW();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.view")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.view");
            });

            it("should have the right importSourceName", function() {
                expect(this.presenter.importSourceName).toBe("song_view")
            });

            it("should have the right importSourceUrl", function() {
                expect(this.presenter.importSourceUrl).toMatchUrl('#/workspaces/10000/datasets/' + encodeURIComponent('"10002"|"bizarro_world"|"public"|"QUERY"|"song_view"'));
            });

            it("should have an importSourceLink in the header", function() {
                expect(this.presenter.header.importSourceLink).toBeDefined();
            });

            itShouldHaveUserIcon();
            itShouldHaveDestinationTableLink();
        });
    });

    context(".IMPORT_SUCCESS", function() {
        context("when importing from a file", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_SUCCESS_FILE();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the file name", function() {
                expect(this.presenter.importSourceName).toBe("some.csv");
            });

            it("should not have an iconClass", function() {
                expect(this.presenter.iconClass).toBe('');
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.file")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.file");
            });

            itShouldHaveImportIcon();
            itShouldHaveDestinationTableLink();
        });

        context("when importing from a source table", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_SUCCESS_SOURCE_TABLE();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.table")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.table");
            });

            it("should have the right importSourceName", function() {
                expect(this.presenter.importSourceName).toBe("clv_data")
            });

            it("should have the right importSourceUrl", function() {
                expect(this.presenter.importSourceUrl).toMatchUrl('#/workspaces/10000/datasets/' + encodeURIComponent('"10010"|"Analytics"|"analytics"|"TABLE"|"clv_data"'));
            });


            it("should have an importSourceLink in the header", function() {
                expect(this.presenter.header.importSourceLink).toBeDefined();
            });

            itShouldHaveImportIcon();
            itShouldHaveDestinationTableLink();
        });

        context("when importing from a view", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_SUCCESS_VIEW();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.view")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.view");
            });

            it("should have the right importSourceName", function() {
                expect(this.presenter.importSourceName).toBe("song_view")
            });

            it("should have the right importSourceUrl", function() {
                expect(this.presenter.importSourceUrl).toMatchUrl('#/workspaces/10000/datasets/' + encodeURIComponent('"10002"|"bizarro_world"|"public"|"QUERY"|"song_view"'));
            });

            it("should have an importSourceLink in the header", function() {
                expect(this.presenter.header.importSourceLink).toBeDefined();
            });

            itShouldHaveImportIcon();
            itShouldHaveDestinationTableLink();
        });
    });

    context("when importing from a chorus view", function() {
        beforeEach(function() {
            this.model = fixtures.activities.IMPORT_SUCCESS_CHORUS_VIEW();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the right importType", function() {
            expect(this.presenter.importType).toMatchTranslation("dataset.import.types.chorus_view")
        });

        it("should pass the importType to the header", function() {
            expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.chorus_view");
        });

        it("should have the right importSourceName", function() {
            expect(this.presenter.importSourceName).toBe("a_chorus_view")
        });

        it("should have the right importSourceUrl", function() {
            expect(this.presenter.importSourceUrl).toMatchUrl('#/workspaces/10006/datasets/' + encodeURIComponent('"10002"|"Analytics"|"analytics"|"QUERY"|"a_chorus_view"'));
        });

        it("should have an importSourceLink in the header", function() {
            expect(this.presenter.header.importSourceLink).toBeDefined();
        });

        itShouldHaveImportIcon();
        itShouldHaveDestinationTableLink();
    });

    context(".IMPORT_FAILED", function() {
        context("when importing from a file", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_FAILED_FILE({ task: { id: "34" } });
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the file name", function() {
                expect(this.presenter.importSourceName).toBe("some.csv");
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.file")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.file");
            });

            itShouldHaveFailedIcon();
            itShouldHaveDestinationTableLink();
            itShouldHaveDetailsLink(t("activity_stream.view_error_details"), {
                href: '#',
                class: "alert",
                "data-alert": "ImportFailed",
                "data-task-id": "34"
            });
        });

        context("when importing from a source table", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_FAILED_SOURCE_TABLE({ task: { id: "34" } });
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.table")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.table");
            });

            it("should have the right importSourceName", function() {
                expect(this.presenter.importSourceName).toBe("clv_data")
            });

            it("should have the right importSourceUrl", function() {
                expect(this.presenter.importSourceUrl).toMatchUrl('#/workspaces/10000/datasets/' + encodeURIComponent('"10010"|"Analytics"|"analytics"|"TABLE"|"clv_data"'));
            });

            it("should have an importSourceLink in the header", function() {
                expect(this.presenter.header.importSourceLink).toBeDefined();
            });

            itShouldHaveFailedIcon();
            itShouldHaveDestinationTableLink();
            itShouldHaveDetailsLink(t("activity_stream.view_error_details"), {
                href: '#',
                class: "alert",
                "data-alert": "ImportFailed",
                "data-task-id": "34"
            });
        });

        context("when importing from a view", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_FAILED_VIEW({ task: { id: "34" } });
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.view")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.view");
            });

            it("should have the right importSourceName", function() {
                expect(this.presenter.importSourceName).toBe("song_view")
            });

            it("should have the right importSourceUrl", function() {
                expect(this.presenter.importSourceUrl).toMatchUrl('#/workspaces/10000/datasets/' + encodeURIComponent('"10002"|"bizarro_world"|"public"|"QUERY"|"song_view"'));
            });

            it("should have an importSourceLink in the header", function() {
                expect(this.presenter.header.importSourceLink).toBeDefined();
            });

            itShouldHaveFailedIcon();
            itShouldHaveDestinationTableLink();
            itShouldHaveDetailsLink(t("activity_stream.view_error_details"), {
                href: '#',
                class: "alert",
                "data-alert": "ImportFailed",
                "data-task-id": "34"
            });
        });
    });

    context(".IMPORT_UPDATED", function() {
        context("when importing from a source table", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_UPDATED_TABLE();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.table")
            });

            it("should pass the importType to the header", function() {
                expect(this.presenter.header.importType).toMatchTranslation("dataset.import.types.table");
            });

            it("should have the right importSourceName", function() {
                expect(this.presenter.importSourceName).toBe(this.model.databaseObject().get("objectName"))
            });

            it("should have the right importSourceUrl", function() {
                expect(this.presenter.importSourceUrl).toBe(this.model.databaseObject().asDataset().showUrl());
            });

            it("should have the right message", function() {
                expect(this.presenter.headerHtml.toString()).toContainTranslation("activity_stream.header.html.IMPORT_UPDATED.default", this.presenter.header);
            });

            it("should have an importSourceLink in the header", function() {
                var $link = $(this.presenter.header.importSourceLink);
                var importSource = this.model.databaseObject().asDataset();
                expect($link.attr("href")).toMatchUrl(importSource.showUrl());
                expect($link.text()).toBe(importSource.get("objectName"));
            });

            itShouldHaveUserIcon();
            itShouldHaveDestinationTableLink();
        });

        context("when importing from a view", function() {
            beforeEach(function() {
                this.model = fixtures.activities.IMPORT_UPDATED_VIEW();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the right importType", function() {
                expect(this.presenter.importType).toMatchTranslation("dataset.import.types.view")
            });
        });
    });

    context("SUB_COMMENT", function() {
        beforeEach(function() {
            this.model = fixtures.activities.SUB_COMMENT();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("has the right text", function() {
            expect(this.presenter.body).toBe(this.model.get("text"));
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".NOTE_ON_ANYTHING", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_DATASET_TABLE({
                workspace: _.extend(fixtures.nestedWorkspaceJson(), {
                    owner: {
                        id: 'workspace-owner-id',
                        username: 'Workspace Owner'
                    }
                })
            });
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
                setLoggedInUser({id: this.model.author().id});
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("sets the isOwner field to true", function() {
                expect(this.presenter.isOwner).toBeTruthy();
            });
        })

        context("when the logged in user owns the workspace in which the note was made", function() {
            beforeEach(function() {
                setLoggedInUser({id: this.model.workspace().owner().id});
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
                    id: '"10014"|"silverware"|"forks"|"shiny"',
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
            expect(this.presenter.objectUrl).toMatchUrl('#/workspaces/4/datasets/' + encodeURIComponent('"10014"|"silverware"|"forks"|"shiny"'));
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
            var workfile = new chorus.models.Workfile({id: this.workfile.get("id"), workspaceId: this.workspace.get("id")});
            spyOn(workfile, 'isText').andReturn(true)
            expect(this.presenter.objectUrl).toBe(workfile.showUrl());
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
    });

    context(".COMMENT_ON_NOTE_ON_DATABASE_TABLE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.COMMENT_ON_NOTE_ON_DATABASE_TABLE();
            this.databaseObject = this.model.parentComment().databaseObject();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.databaseObject.get("objectName"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.databaseObject.showUrl());
        });

        it("should have the right objectType", function() {
            expect(this.presenter.header.objectType).toMatchTranslation("database_object." + this.databaseObject.get("objectType"))
        });

        it("should have all the pieces", function() {
            expect(this.presenter.headerHtml.toString()).not.toContain("[missing")
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".COMMENT_ON_NOTE_ON_WORKSPACE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.COMMENT_ON_NOTE_ON_WORKSPACE();
            this.workspace = this.model.parentComment().workspace();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.workspace.get("name"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.workspace.showUrl());
        });

        it("should have the right objectType", function() {
            expect(this.presenter.header.objectType).toMatchTranslation("workspaces.title_lower")
        });

        it("should have all the pieces", function() {
            expect(this.presenter.headerHtml.toString()).not.toContain("[missing");
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".COMMENT_ON_NOTE_ON_CHORUS_VIEW", function() {
        beforeEach(function() {
            this.model = fixtures.activities.COMMENT_ON_NOTE_ON_CHORUS_VIEW();
            this.dataset = this.model.parentComment().dataset();
            this.presenter = new chorus.presenters.Activity(this.model);
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.dataset.get("objectName"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
        });

        it("should have all the pieces", function() {
            expect(this.presenter.headerHtml.toString()).not.toContain("missing");
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".NOTE_ON_HDFS", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_HDFS();
            this.hdfsfile = this.model.hdfs();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.hdfsfile.get("name"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.hdfsfile.showUrl());
        });

        it("should have the right objectType", function() {
            expect(this.presenter.header.objectType).toMatchTranslation("hdfs.file_lower")
        })

        itShouldHaveFileAttachments();
        itShouldHaveTheAuthorsIconAndUrl();
    });

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
        });

        context("in an activity stream", function() {
            beforeEach(function() {
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("should have the correct entityType", function() {
                expect(this.presenter.entityType).toBe("comment");
            });
        });

        context("in a comment list", function() {
            beforeEach(function() {
                this.presenter = new chorus.presenters.Activity(this.model, {isReadOnly: true})
            });

            it("should have the correct readOnly value", function() {
                expect(this.presenter.isReadOnly).toBeTruthy();
            });
        })
    })

    context(".RECEIVE_NOTE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.RECEIVE_NOTE();
            this.presenter = new chorus.presenters.Activity(this.model, {isNotification: true});
        });

        it("should have the correct entityType", function() {
            expect(this.presenter.entityType).toBe("comment");
            expect(this.presenter.isReadOnly).toBeTruthy();
            expect(this.presenter.isNotification).toBeTruthy();
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

        it("should honor the isDeleted flag of the instance", function() {
            var model = fixtures.activities.INSTANCE_CREATED();
            model.get("instance").isDeleted = true;
            this.presenter = new chorus.presenters.Activity(model);
            expect(this.presenter.objectUrl).toBeNull();
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".INSTANCE_DELETED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.INSTANCE_DELETED();
            this.instance = this.model.instance();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.instance.get('name'));
        });

        it("does not have an objectUrl", function() {
            var url = new chorus.models.Instance({id: this.instance.id}).showUrl();
            expect(this.presenter.objectUrl).toBeNull();
        });

        it("should have the 'isNote' property set to false", function() {
            expect(this.presenter.isNote).toBeFalsy();
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".PROVISIONING_SUCCESS", function() {
        beforeEach(function() {
            this.model = fixtures.activities.PROVISIONING_SUCCESS();
            this.instance = this.model.instance();
            this.instance.set({instanceProvider: "Greenplum Database"});
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

        it("should have the correct html", function() {
            expect(this.presenter.headerHtml.toString()).toMatchTranslation("activity_stream.header.html.PROVISIONING_SUCCESS.without_workspace",
                { objectLink: chorus.helpers.linkTo(this.instance.showUrl(), this.instance.name(), {'class': 'object_link'}).toString(),
                    instanceAddress: this.instance.get("host") + ":" + this.instance.get("port")
                }
            );
        });

        it("should have the instance icon", function() {
            expect(this.presenter.iconSrc).toBe(this.instance.providerIconUrl());
            expect(this.presenter.iconClass).toBe("");
            expect(this.presenter.iconHref).toBe(this.instance.showUrl());
        });
    });

    context(".START_PROVISIONING", function() {
        beforeEach(function() {
            this.model = fixtures.activities.START_PROVISIONING();
            this.instance = this.model.instance();
            this.instance.set({instanceProvider: "Greenplum Database"});
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

        it("should have the correct html", function() {
            expect(this.presenter.headerHtml.toString()).toMatchTranslation("activity_stream.header.html.START_PROVISIONING.without_workspace",
                { objectLink: chorus.helpers.linkTo(this.instance.showUrl(), this.instance.name(), {'class': 'object_link'}).toString()}
            );
        });

        it("should have the instance icon", function() {
            expect(this.presenter.iconSrc).toBe(this.instance.providerIconUrl());
            expect(this.presenter.iconClass).toBe("");
            expect(this.presenter.iconHref).toBe(this.instance.showUrl());
        });
    });

    context(".PROVISIONING_FAIL", function() {
        beforeEach(function() {
            this.model = fixtures.activities.PROVISIONING_FAIL();
            this.instance = this.model.instance();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.instance.get('name'));
        });

        it("should have the 'isNote' property set to false", function() {
            expect(this.presenter.isNote).toBeFalsy();
        });

        it("should have the correct header html", function() {
            expect(this.presenter.headerHtml.toString()).toMatchTranslation("activity_stream.header.html.PROVISIONING_FAIL.without_workspace",
                { objectName: this.instance.name()}
            );
        });

        it("should have the correct details link", function() {
            var detailsLink = detailsLink = chorus.helpers.linkTo('#', t("activity_stream.view_error_details"), {
                "class": 'alert',
                "data-alert": "Error",
                "data-title": t("provisioning.failed.alert.title"),
                "data-body": "Can not connect to Aurora server."
            });
            expect(this.presenter.detailsLink).toEqual(detailsLink);
        });

        itShouldHaveFailedIcon();
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

    context(".WORKSPACE_CHANGE_NAME", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKSPACE_CHANGE_NAME();
            this.workspace = this.model.workspace();
            this.presenter = new chorus.presenters.Activity(this.model);
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
            expect(this.presenter.iconSrc).toBe(this.user.fetchImageUrl());
        });

        it("should link the new user's icon to the new user's show page", function() {
            expect(this.presenter.iconHref).toBe(this.user.showUrl());
        });

        it("should honor the isDeleted flag of the user", function() {
            this.model.get("user").isDeleted = true;
            this.presenter = new chorus.presenters.Activity(this.model)
            expect(this.presenter.objectUrl).toBeNull();
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
            this.model = fixtures.activities.WORKFILE_UPGRADED_VERSION({
                version: '3'
            });
            this.workspace = this.model.workspace();
            this.workfile = this.model.workfile();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right iconUrl", function() {
            expect(this.presenter.iconSrc).toBe("/images/new_version_icon.png");
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

        it("has the right versionName", function() {
            expect(this.presenter.versionName).toMatchTranslation("workfile.version_title", { versionNum: this.model.get('version') });
        })

        it("has the right versionUrl", function() {
            expect(this.presenter.versionUrl).toMatch(/versions\/3/);
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

        context("when the workfile has been deleted", function() {
            beforeEach(function() {
                this.model.workfile().set({ isDeleted: true });
                this.presenter = new chorus.presenters.Activity(this.model)
            });

            it("still constructs a versionLink, but with no href", function() {
                expect(this.presenter.header.versionLink).toBeDefined();
                expect(this.presenter.versionUrl).toBeFalsy();
            });
        });
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
            expect(this.presenter.iconSrc).toBe("/images/sandbox_table_large.png");
        });

        it("should not have the profile icon class", function() {
            expect(this.presenter.iconClass).not.toEqual("profile")
        })
    });

    context(".WORKSPACE_ADD_HDFS_AS_EXT_TABLE", function() {
        beforeEach(function() {
            this.model = fixtures.activities.WORKSPACE_ADD_HDFS_AS_EXT_TABLE();
            this.dataset = this.model.dataset();
            this.workspace = this.model.workspace();
            this.hdfsEntry = this.model.hdfs();
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

        it("should have the correct hdfs name", function() {
            expect(this.presenter.hdfsName).toBe(this.hdfsEntry.get("name"));
        });

        it("should have the correct hdfs url", function() {
            expect(this.presenter.hdfsUrl).toBe(this.hdfsEntry.showUrl());
            expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
        });

        it("should have all the pieces", function() {
            expect(this.presenter.headerHtml.toString()).not.toContain("[missing")
        });

        itShouldHaveTheAuthorsIconAndUrl();
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
                expect(this.presenter.headerHtml.toString()).toContainTranslation("dataset.types.table");
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
                expect(this.presenter.headerHtml.toString()).toContainTranslation("dataset.types.view");
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
            expect(this.presenter.headerHtml.toString()).toContainTranslation("dataset.types.table");
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
            expect(this.presenter.headerHtml.toString()).toContainTranslation("dataset.types.query_change");
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.dataset.get("objectName"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context(".VIEW_CREATED", function() {
        beforeEach(function() {
            this.model = fixtures.activities.VIEW_CREATED();
            this.dataset = this.model.dataset();
            this.workspace = this.model.workspace();
            this.chorusView = this.model.chorusViewDataset();
            this.presenter = new chorus.presenters.Activity(this.model)
        });

        it("should have the right workspaceName", function() {
            expect(this.presenter.workspaceName).toBe(this.workspace.get("name"));
        });

        it("should have the right workspaceUrl", function() {
            var url = new chorus.models.Workspace({id: this.workspace.get("id")}).showUrl();
            expect(this.presenter.workspaceUrl).toBe(url);
        });

        it("should have the right objectName", function() {
            expect(this.presenter.objectName).toBe(this.dataset.get("objectName"));
        });

        it("should have the right objectUrl", function() {
            expect(this.presenter.objectUrl).toBe(this.dataset.showUrl());
        });

        it("should have the right chorusViewName", function() {
            expect(this.presenter.chorusViewName).toBe(this.chorusView.get("objectName"));
        });

        it("should have the right chorusViewUrl", function() {
            expect(this.presenter.chorusViewUrl).toBe(this.chorusView.showUrl());
        });

        itShouldHaveTheAuthorsIconAndUrl();
    });

    context("headerHtml", function() {
        beforeEach(function() {
            this.keyPrefix = 'activity_stream.header.html.';
        });

        describe("SUB_COMMENT", function() {
            beforeEach(function() {
                this.model = fixtures.activities.SUB_COMMENT();
            });

            itGetsTheTranslationKeyCorrectly('without_workspace');
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

        describe("#headerTranslationKey with WORKSPACE_ADD_SANDBOX", function() {
            beforeEach(function() {
                this.model = fixtures.activities.WORKSPACE_ADD_SANDBOX();
                this.presenter = new chorus.presenters.Activity(this.model);
            });

            it("returns the displayStyle when it exists", function() {
                var expectedKey = 'activity_stream.header.html.WORKSPACE_ADD_SANDBOX.default';
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

        describe("#headerTranslationKey with comment on note on dataset", function() {
            beforeEach(function() {
                this.model = fixtures.activities.COMMENT_ON_NOTE_ON_CHORUS_VIEW();
            });

            itGetsTheTranslationKeyCorrectly('default');
        });

        describe("#headerTranslationKey with comment on note on a workspace", function() {
            beforeEach(function() {
                this.model = fixtures.activities.COMMENT_ON_NOTE_ON_WORKSPACE();
            });

            itGetsTheTranslationKeyCorrectly('without_workspace');
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
            this.model = fixtures.activities.NOTE_ON_DATABASE_TABLE();
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
            expect(this.presenter.iconSrc).toBe(this.model.author().fetchImageUrl());
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

    function itShouldHaveUserIcon() {
        it("should have the user icon", function() {
            expect(this.presenter.iconSrc).toBe(this.model.author().fetchImageUrl());
            expect(this.presenter.iconClass).toBe("profile");
        });
    }

    function itShouldHaveImportIcon() {
        it("should have the right icon", function() {
            expect(this.presenter.iconSrc).toBe("/images/import_icon.png");
            expect(this.presenter.iconClass).toBe("");
        });

        it("links the icon to the import destination", function() {
            expect(this.presenter.iconHref).toBe(this.presenter.objectUrl);
        });
    }

    function itShouldHaveFailedIcon() {
        it("should have the right icon", function() {
            expect(this.presenter.iconSrc).toBe("/images/med_red_alert.png");
            expect(this.presenter.iconClass).toBe("");
            expect(this.presenter.iconHref).toBe("javascript:void()");
        });
    }

    function itShouldHaveDestinationTableLink() {
        it("should have the right object name( destination view )", function() {
            expect(this.presenter.objectName).toBe('new_imported_table')
        });

        it("should have the right object type", function() {
            expect(this.presenter.objectType).toMatchTranslation("database_object.TABLE");
        });

        it("should have the right object url", function() {
            expect(this.presenter.objectUrl).toBe(this.model.dataset().showUrl());
        });
    }

    function itShouldHaveDetailsLink(text, attributes) {
        it("has a link to error details", function() {
            expect(this.presenter.detailsLink).toBeDefined();
            var link = $(this.presenter.detailsLink.toString());
            expect(link).toHaveText(text);

            _.each(attributes, function(value, key) {
                expect(link).toHaveAttr(key, value);
            })
        });
    }
});
