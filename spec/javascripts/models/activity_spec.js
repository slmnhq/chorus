describe("chorus.models.Activity", function() {
    beforeEach(function() {
        this.model = fixtures.activity();
    });

    describe("#noteworthy", function() {
        it("should return the instance when note is on an instance", function() {
            this.model = fixtures.activities.NOTE_ON_INSTANCE();
            expect(this.model.noteworthy()).toBeA(chorus.models.Instance);
        })

        it("should return the workfile when note is on a workfile", function() {
            this.model = fixtures.activities.NOTE_ON_WORKFILE();
            expect(this.model.noteworthy()).toBeA(chorus.models.Workfile);
        })

        it("should return the workspace when note is on a workspace", function() {
            this.model = fixtures.activities.NOTE_ON_WORKSPACE();
            expect(this.model.noteworthy()).toBeA(chorus.models.Workspace);
        })

        it("should return the dataset when note is on a table", function() {
            this.model = fixtures.activities.NOTE_ON_DATASET_TABLE();
            expect(this.model.noteworthy()).toBeA(chorus.models.Dataset);
        })

        it("should return the dataset when note is on a view", function() {
            this.model = fixtures.activities.NOTE_ON_DATASET_VIEW();
            expect(this.model.noteworthy()).toBeA(chorus.models.Dataset);
        })

        it("should return a dataset when the note is on a chorus view", function() {
            this.model = fixtures.activities.NOTE_ON_CHORUS_VIEW();
            expect(this.model.noteworthy()).toBeA(chorus.models.Dataset);
        })

        it("should return a databaseObject when the note is on a database table", function() {
            this.model = fixtures.activities.NOTE_ON_DATABASE_TABLE();
            expect(this.model.noteworthy()).toBeA(chorus.models.DatabaseObject);
        })

        it("should return a user when the activity is member_added", function() {
            this.model = fixtures.activities.MEMBERS_ADDED();
            expect(this.model.noteworthy()).toBeA(chorus.models.User);
        })

        it("should return a user when the activity is member_deleted", function() {
            this.model = fixtures.activities.MEMBERS_DELETED();
            expect(this.model.noteworthy()).toBeA(chorus.models.User);
        })

        it("should return an HDFS entry when the note is on an HDFS instance", function() {
            this.model = fixtures.activities.NOTE_ON_HDFS();
            expect(this.model.noteworthy()).toBeA(chorus.models.HdfsEntry);
        })
    })

    describe("#isUserGenerated", function() {
        it("returns true for notes", function() {
            expect(fixtures.activities.NOTE_ON_DATASET_TABLE().isUserGenerated()).toBeTruthy();
            expect(fixtures.activities.NOTE_ON_WORKFILE().isUserGenerated()).toBeTruthy();
        });

        it("returns true for 'INSIGHT_CREATED' activities", function() {
            expect(fixtures.activities.INSIGHT_CREATED().isUserGenerated()).toBeTruthy();
        });

        it("returns false for other activities", function() {
            expect(fixtures.activities.MEMBERS_ADDED().isUserGenerated()).toBeFalsy();
        });

        it("returns true for sub-comments", function() {
            expect(fixtures.activities.SUB_COMMENT().isUserGenerated()).toBeTruthy();
        });
    });

    describe("#toComment", function() {
        beforeEach(function() {
            this.model = fixtures.activities.NOTE_ON_INSTANCE({ id: "101", instance: { id: "45" } });
            this.model.collection = new chorus.collections.ActivitySet();
        });

        it("returns a comment with the right attributes", function() {
            var comment = this.model.toComment();
            expect(comment).toBeA(chorus.models.Comment);
            expect(comment.get("entityType")).toBe("instance");
            expect(comment.get("entityId")).toBe("45");
            expect(comment.get("id")).toBe("101");
            expect(comment.get("body")).toBe(this.model.get("text"));
        });

        describe("when the comment is saved", function() {
            beforeEach(function() {
                this.model.toComment().trigger("saved");
            });

            it("re-fetches the activity's collection", function() {
                expect(this.model.collection).toHaveBeenFetched();
            });
        });
    });

    describe("#promoteToInsight", function() {
        beforeEach(function() {
            this.success = jasmine.createSpy("success");
            this.model.collection = new chorus.collections.ActivitySet();
            this.model.promoteToInsight({ success: this.success });
        });

        it("posts to the comment insight url", function() {
            expect(this.server.lastCreate().url).toBe("/edc/commentinsight/" + this.model.get("id") + "/promote");
        });

        it("calls the success function", function() {
            this.server.lastCreate().succeed();
            expect(this.success).toHaveBeenCalledWith(this.model);
        });
    });

    describe("#publish", function() {
        it("posts to the comment insight url with the publish action", function() {
            this.model.publish();
            expect(this.server.lastCreate().url).toBe("/edc/commentinsight/" + this.model.get("id") + "/publish");
        });
    });

    describe("#unpublish", function() {
        it("posts to the comment insight url with the unpublish action", function() {
            this.model.unpublish();
            expect(this.server.lastCreate().url).toBe("/edc/commentinsight/" + this.model.get("id") + "/unpublish");
        });
    });

    describe("#isNote", function() {
        it("returns true for notes", function() {
            this.model.set({ type: "NOTE" });
            expect(this.model.isNote()).toBeTruthy();
        });

        it("returns false for non-notes", function() {
            this.model.set({ type: "WORKSPACE_MAKE_PUBLIC" });
            expect(this.model.isNote()).toBeFalsy();
        });
    });

    describe("#isInsight", function() {
        it("returns true for insights", function() {
            this.model.set({ type: "INSIGHT_CREATED" });
            expect(this.model.isInsight()).toBeTruthy();
        });

        it("returns false for non-insights", function() {
            this.model.set({ type: "WORKSPACE_MAKE_PUBLIC" });
            expect(this.model.isInsight()).toBeFalsy();
        });
    });

    describe("#isSubComment", function() {
        it("returns true for sub-comments", function() {
            this.model.set({ type: "SUB_COMMENT" });
            expect(this.model.isSubComment()).toBeTruthy();
        });

        it("returns false for anything else", function() {
            this.model.set({ type: "NOTE" });
            expect(this.model.isSubComment()).toBeFalsy();
        });
    });

    describe("#isPublished", function() {
        it("returns true for insights that are published", function() {
            this.model.set({isPublished: true});
            expect(this.model.isPublished()).toBeTruthy();
        });

        it("returns false for insights that are not published", function() {
            this.model.set({isPublished: false});
            expect(this.model.isPublished()).toBeFalsy();
        });

        it("returns false for non-insights", function() {
            this.model.set({isPublished: undefined});
            expect(this.model.isPublished()).toBeFalsy();
        });
    });

    describe("#author", function() {
        context("when author information is present", function() {
            it("creates a user", function() {
                expect(this.model.author()).toBeA(chorus.models.User);
            });

            it("returns the same instance when called multiple times", function() {
                expect(this.model.author()).toBe(this.model.author());
            });
        });

        context("when author information is not present", function() {
            beforeEach(function() {
                this.model.unset("author");
            });

            it("returns undefined", function() {
                expect(this.model.author()).toBeUndefined();
            });
        });
    });

    describe("#instance", function() {
        context("with an instance", function() {
            beforeEach(function() {
                this.model = fixtures.activity({instance: fixtures.instanceJson()})
            })

            it("creates an instance", function() {
                expect(this.model.instance()).toBeA(chorus.models.Instance);
            });

            it("returns the same instance when called multiple times", function() {
                expect(this.model.instance()).toBe(this.model.instance());
            });
        });

        context("without an instance", function() {
            beforeEach(function() {
                this.model = fixtures.activity();
            })

            it("doesn't create an instance", function() {
                expect(this.model.instance()).toBeFalsy();
            });
        });
    });

    describe("#dataset", function() {
        context("when the activity represents a note on a table", function() {
            beforeEach(function() {
                this.model = fixtures.activities.NOTE_ON_DATASET_TABLE({
                    databaseObject: {
                        id: '"10014"|"silverware"|"forks"|"shiny"',
                        name: "shiny",
                        type: "SOURCE_TABLE",
                        objectType: "BASE_TABLE"
                    },
                    workspace: {
                        id: '4',
                        name: "janitorial_duties"
                    }
                });
            });

            it("returns a Dataset model with the right id, objectName, type and objectType", function() {
                expect(this.model.dataset()).toBeA(chorus.models.Dataset);
                expect(this.model.dataset().get("id")).toBe('"10014"|"silverware"|"forks"|"shiny"');
                expect(this.model.dataset().get("objectName")).toBe("shiny");
                expect(this.model.dataset().get("type")).toBe("SOURCE_TABLE");
                expect(this.model.dataset().get("objectType")).toBe("BASE_TABLE");
            });

            it("has the right workspace information", function() {
                expect(this.model.dataset().get("workspace").id).toBe('4');
                expect(this.model.dataset().get("workspace").name).toBe('janitorial_duties');
            });
        });

        context("when the activity represents a note on a view", function() {
            beforeEach(function() {
                this.model = fixtures.activities.NOTE_ON_DATASET_VIEW({
                    databaseObject: {
                        id: '"10014"|"silverware"|"forks"|"shiny"',
                        name: "shiny"
                    },
                    workspaceId: '4'
                });
            });

            it("returns a Dataset model with the right id", function() {
                expect(this.model.dataset()).toBeA(chorus.models.Dataset);
                expect(this.model.dataset().get("id")).toBe('"10014"|"silverware"|"forks"|"shiny"');
            });
        });

        context("when the activity is not related to a dataset", function() {
            beforeEach(function() {
                this.model = fixtures.activity({instance: fixtures.instanceJson()})
            })

            it("returns undefined", function() {
                expect(this.model.dataset()).toBeUndefined();
            });
        });
    });

    describe("#sourceObject", function() {
        context("source object is dataset", function() {
            it("creates a dataset out of the sourceObject", function() {
                var activity = fixtures.activities.CHORUS_VIEW_CREATED();
                var dataset = activity.sourceObject();
                expect(dataset.get('id')).toBe(activity.get('sourceObject').id);
                expect(dataset.get('objectName')).toBe(activity.get('sourceObject').name);
                expect(dataset.get('workspace').id).toBe(activity.get('workspace').id);
                expect(dataset.get('type')).toBe('table');
            });
        });

        context("source object is workfile", function() {
            it("creates a workfile out of the sourceObject", function() {
                var activity = fixtures.activities.CHORUS_VIEW_CREATED({sourceObject: {id: 1234, name: "workfile.sql"}});
                var workfile = activity.sourceObject();
                expect(workfile.get('id')).toBe(activity.get('sourceObject').id);
                expect(workfile.get('objectName')).toBe(activity.get('sourceObject').name);
                expect(workfile.get('workspace').id).toBe(activity.get('workspace').id);
                expect(workfile.get('type')).toBe('workfile');
            });
        });
    })

    describe("#chorusViewDataset", function() {
        it("creates a dataset out of the chorusView", function() {
            var activity = fixtures.activities.IMPORT_SUCCESS_CHORUS_VIEW();
            var dataset = activity.chorusViewDataset();
            expect(dataset.get('id')).toBe(activity.get('chorusView').id)
            expect(dataset.get('objectName')).toBe(activity.get('chorusView').name)
            expect(dataset.get('workspace').id).toBe(activity.get('workspace').id)
        })
    })

    describe("#workspace", function() {
        context("with an workspace", function() {
            beforeEach(function() {
                this.model = fixtures.activity({workspace: newFixtures.workspaceJson()})
            })

            it("creates a workspace", function() {
                expect(this.model.workspace()).toBeA(chorus.models.Workspace);
            });

            it("returns the same workspace when called multiple times", function() {
                expect(this.model.workspace()).toBe(this.model.workspace());
            });
        });

        context("without a workspace", function() {
            beforeEach(function() {
                this.model = fixtures.activity();
            })

            it("doesn't create a workspace", function() {
                expect(this.model.workspace()).toBeFalsy();
            });
        });
    });

    describe("#hdfs", function() {
        it("returns a HdfsEntry object", function() {
            this.activity = fixtures.activities.NOTE_ON_HDFS();
            expect(this.activity.hdfs()).toBeA(chorus.models.HdfsEntry);
        })

        context("when the activity is a WORKSPACE_ADD_HDFS_DIRECTORY_AS_EXT_TABLE", function() {
            it("makes the hdfs entry a directory", function() {
                this.activity = newFixtures.activity.addHdfsDirectoryAsExtTable();
                expect(this.activity.hdfs().get("isDir")).toBeTruthy();
            });
        });
    });

    describe("#workfile", function() {
        context("with a workfile", function() {
            context("with a workspace", function() {
                beforeEach(function() {
                    this.model = fixtures.activity({
                        workspace: newFixtures.workspaceJson(),
                        workfile: {
                            id: 10001,
                            name: "my_workfile"
                        },
                        version: "5"
                    })
                })

                it("creates a workfile", function() {
                    expect(this.model.workfile()).toBeA(chorus.models.Workfile);
                });

                it("returns the same workfile when called multiple times", function() {
                    expect(this.model.workfile()).toBe(this.model.workfile());
                });

                it("sets the workspace id in the workfile", function() {
                    expect(this.model.workfile().get("workspaceId")).toBeDefined();
                })

                it("sets workfileId in the workfile", function() {
                    expect(this.model.workfile().get("workfileId")).toBeDefined();
                })

                it("sets versionNum in the workfile", function() {
                    expect(this.model.workfile().get("versionNum")).toBe("5");
                })

                it("does not set latestVersionNum in the workfile", function() {
                    expect(this.model.workfile().get("latestVersionNum")).toBeUndefined();
                })
            });

            context("without a workspace", function() {
                beforeEach(function() {
                    this.model = fixtures.activity({
                        workfile: {
                            id: 10001,
                            name: "my_workfile"
                        },
                        version: "5"
                    })
                })

                it("creates a workfile", function() {
                    expect(this.model.workfile()).toBeA(chorus.models.Workfile);
                });

                it("returns the same workfile when called multiple times", function() {
                    expect(this.model.workfile()).toBe(this.model.workfile());
                });

                it("does not set the workspace id in the workfile", function() {
                    expect(this.model.workfile().get("workspaceId")).toBeUndefined();
                })

                it("sets workfileId in the workfile", function() {
                    expect(this.model.workfile().get("workfileId")).toBeDefined();
                })

                it("sets versionNum in the workfile", function() {
                    expect(this.model.workfile().get("versionNum")).toBe("5");
                })

                it("does not set latestVersionNum in the workfile", function() {
                    expect(this.model.workfile().get("latestVersionNum")).toBeUndefined();
                })
            });
        });

        context("without a workfile", function() {
            beforeEach(function() {
                this.model = fixtures.activity();
            })

            it("doesn't create a workfile", function() {
                expect(this.model.workfile()).toBeFalsy();
            });
        });
    });

    describe("#comments", function() {
        beforeEach(function() {
            this.activitySet = new chorus.collections.ActivitySet([this.model], {entityType: "workspace", entityId: 10000})
            this.model.set({
                comments: [
                    {
                        text: "I'm cold.'",
                        author: fixtures.authorJson(),
                        timestamp: "2011-12-15 12:34:56"
                    }
                ]
            });
            this.model.set({id: 5});
            this.comments = this.model.comments();
        });

        it("returns a CommentSet", function() {
            expect(this.comments).toBeA(chorus.collections.CommentSet);
        });

        it("memoizes", function() {
            expect(this.comments).toBe(this.model.comments());
        });

        it("contains the activity item's comments", function() {
            var commentsJson = this.model.get("comments");
            expect(this.comments.models[0].get("text")).toBe(commentsJson[0].text);
            expect(this.comments.models[0].get("timestamp")).toBe(commentsJson[0].timestamp);
            expect(this.comments.models[0].author().get("firstName")).toBe(commentsJson[0].author.firstName);
        });

        it("sets the entityType and entityId as attributes of the CommentSet", function() {
            expect(this.comments.attributes.entityType).toBe("workspace");
            expect(this.comments.attributes.entityId).toBe(10000);
        });
    });

    describe("#parentComment", function() {
        beforeEach(function() {
            this.model = fixtures.activities.COMMENT_ON_NOTE_ON_DATABASE_TABLE();
            this.parentComment = this.model.parentComment();
        });

        it("should return a comment activity", function() {
            expect(this.parentComment).toBeA(chorus.models.Activity);
        });

        it("should retain the data", function() {
            expect(this.parentComment.databaseObject().name()).toBe(this.model.get("parentComment").databaseObject.name);
        });

        it("memoizes", function() {
            expect(this.parentComment).toBe(this.model.parentComment());
        })
    });

    describe("#attachments", function() {
        beforeEach(function() {
            this.model.set({
                artifacts: [fixtures.workfile({ entityType: "workfile" }).attributes, fixtures.artifact().attributes, fixtures.datasetArtifactJson(), fixtures.chorusViewArtifactJson()]
            });
            this.attachments = this.model.attachments();
        });

        it("returns an array of file models (Workfiles, Artifacts, and Datasets)", function() {
            expect(this.attachments[0]).toBeA(chorus.models.Workfile)
            expect(this.attachments[1]).toBeA(chorus.models.Artifact)
            expect(this.attachments[2]).toBeA(chorus.models.Dataset)
            expect(this.attachments[3]).toBeA(chorus.models.Dataset)
        });

        it("memoizes", function() {
            expect(this.attachments).toBe(this.model.attachments());
        });
    });
});
