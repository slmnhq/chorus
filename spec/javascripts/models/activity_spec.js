describe("chorus.models.Activity", function() {
    beforeEach(function() {
        fixtures.model = 'Activity';
        this.model = fixtures.modelFor("fetch")
    });

    describe("#author", function() {
        it("creates a user", function() {
            expect(this.model.author().displayName()).toBe("EDC Admin");
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
                    table: {
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
                    view: {
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
            expect(this.comments instanceof chorus.collections.CommentSet).toBeTruthy();
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
    });

    describe("#attachments", function() {
        beforeEach(function() {
            this.model.set({
                artifacts: [fixtures.workfile({ entityType: "workfile" }).attributes, fixtures.artifact().attributes]
            });
            this.attachments = this.model.attachments();
        });

        it("returns an array of file models (Workfiles and Artifacts)", function() {
            expect(this.attachments[0] instanceof chorus.models.Workfile).toBeTruthy();
            expect(this.attachments[1] instanceof chorus.models.Artifact).toBeTruthy();
        });

        it("memoizes", function() {
            expect(this.attachments).toBe(this.model.attachments());
        });
    });
});
