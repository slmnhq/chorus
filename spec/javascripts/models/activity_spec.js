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
    })

    describe("#promoteToInsight", function() {
        beforeEach(function() {
            this.success = jasmine.createSpy("success");
            this.model.collection = new chorus.collections.ActivitySet();
            this.model.promoteToInsight({ success: this.success });
        });

        it("posts to the comment insight url", function() {
            expect(this.server.lastCreate().url).toBe("/edc/commentinsight/"+ this.model.get("id") + "/promote");
        });

        it("calls the success function", function() {
            this.server.lastCreate().succeed();
            expect(this.success).toHaveBeenCalledWith(this.model);
        });
    });

    describe("#publish", function() {
        it("posts to the comment insight url with the publish action", function() {
            this.model.publish();
            expect(this.server.lastCreate().url).toBe("/edc/commentinsight/"+ this.model.get("id") + "/publish");
        });
    });

    describe("#unpublish", function() {
        it("posts to the comment insight url with the unpublish action", function() {
            this.model.unpublish();
            expect(this.server.lastCreate().url).toBe("/edc/commentinsight/"+ this.model.get("id") + "/unpublish");
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
        it("creates a user", function() {
            expect(this.model.author()).toBeA(chorus.models.User);
        });

        it("returns the same instance when called multiple times", function() {
            expect(this.model.author()).toBe(this.model.author());
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
                        id: "10014|silverware|forks|shiny",
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
                expect(this.model.dataset().get("id")).toBe("10014|silverware|forks|shiny");
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
                        id: "10014|silverware|forks|shiny",
                        name: "shiny"
                    },
                    workspaceId: '4'
                });
            });

            it("returns a Dataset model with the right id", function() {
                expect(this.model.dataset()).toBeA(chorus.models.Dataset);
                expect(this.model.dataset().get("id")).toBe("10014|silverware|forks|shiny");
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

    describe("#sourceDataset", function() {
        it("creates a dataset out of the sourceObject", function() {
            var activity = fixtures.activities.CHORUS_VIEW_CREATED();
            var dataset = activity.sourceDataset();
            expect(dataset.get('id')).toBe(activity.get('sourceObject').id)
            expect(dataset.get('objectName')).toBe(activity.get('sourceObject').name)
            expect(dataset.get('workspace').id).toBe(activity.get('workspace').id)
        })
    })

    describe("#workspace", function() {
        context("with an workspace", function() {
            beforeEach(function() {
                this.model = fixtures.activity({workspace: fixtures.workspaceJson()})
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

    describe("#workfile", function() {
        context("with a workfile", function() {
            context("with a workspace", function() {
                beforeEach(function() {
                    this.model = fixtures.activity({
                        workspace: fixtures.workspaceJson(),
                        workfile: {
                            id : 10001,
                            name : "my_workfile"
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
                            id : 10001,
                            name : "my_workfile"
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
                        author : fixtures.authorJson(),
                        timestamp : "2011-12-15 12:34:56"
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

    describe("#attachments", function() {
        beforeEach(function() {
            this.model.set({
                artifacts: [fixtures.workfile({ entityType: "workfile" }).attributes, fixtures.artifact().attributes, fixtures.datasetArtifactJson()]
            });
            this.attachments = this.model.attachments();
        });

        it("returns an array of file models (Workfiles, Artifacts, and Datasets)", function() {
            expect(this.attachments[0]).toBeA(chorus.models.Workfile)
            expect(this.attachments[1]).toBeA(chorus.models.Artifact)
//            expect(this.attachments[2]).toBeA(chorus.models.Dataset)
        });

        it("memoizes", function() {
            expect(this.attachments).toBe(this.model.attachments());
        });
    });
});
