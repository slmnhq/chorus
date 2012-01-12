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
                    this.model = fixtures.activity({workspace: fixtures.workspaceJson(), workfile: fixtures.workfileJson()})
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
            });

            context("without a workspace", function() {
                beforeEach(function() {
                    this.model = fixtures.activity({workfile: fixtures.workfileJson()})
                })

                it("creates a workfile", function() {
                    expect(this.model.workfile()).toBeA(chorus.models.Workfile);
                });

                it("returns the same workfile when called multiple times", function() {
                    expect(this.model.workfile()).toBe(this.model.workfile());
                });
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
                ],
            });
            this.model.set({id: 5});
            this.comments = this.model.comments();
        });

        it("returns a CommentSet", function() {
            expect(this.comments instanceof chorus.models.CommentSet).toBeTruthy();
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
