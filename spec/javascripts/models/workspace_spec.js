describe("chorus.models.Workspace", function() {
    var models = chorus.models;
    beforeEach(function() {
        this.model = new models.Workspace();
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("workspace/{{id}}");
    });

    describe("#defaultIconUrl", function() {
        it("links to the active url when active:true", function() {
            this.model.set({active: true});
            expect(this.model.defaultIconUrl()).toBe("/images/workspaces/workspace_large.png");
        });

        it("links to the active url when state:1", function() {
            this.model.set({state: "1"});
            expect(this.model.defaultIconUrl()).toBe("/images/workspaces/workspace_large.png");
        });

        it("links to the archive url otherwise", function() {
            this.model.set({active: false, state: "0"});
            expect(this.model.defaultIconUrl()).toBe("/images/workspaces/workspace_archived_large.png");
        });
    });

    describe("#customIconUrl", function() {
        it("links to the original url by default", function() {
            this.model.set({id: 5});
            expect(this.model.customIconUrl()).toBe("/edc/workspace/5/image?size=original");
        });

        it("links to the requested size", function() {
            this.model.set({id: 5});
            expect(this.model.customIconUrl({size: 'profile'})).toBe("/edc/workspace/5/image?size=profile");
        });
    });

    describe("#datasetsUrl", function() {
        it("links to the dataset index route", function() {
            this.model.set({id: 5});
            expect(this.model.datasetsUrl()).toBe("#/workspaces/5/datasets");
        });
    });

    describe("#workfilesUrl", function() {
        it("links to the workfile index route", function() {
            this.model.set({id: 5});
            expect(this.model.workfilesUrl()).toBe("#/workspaces/5/workfiles");
        });
    });

    describe("#owner", function() {
        beforeEach(function() {
            this.model.set({owner: "jhenry", ownerFirstName: "John", ownerLastName: "Henry", ownerId: "47"})
        });

        it("has the first name ", function() {
            expect(this.model.owner().get("firstName")).toBe("John");
        });

        it("has the last name ", function() {
            expect(this.model.owner().get("lastName")).toBe("Henry");
        });

        it("has the right userId", function() {
            expect(this.model.owner().get("id")).toBe("47");
        });

        it("doesn't automatically fetch the User", function() {
            var numberOfServerRequests = this.server.requests.length;
            this.model.owner();
            expect(this.server.requests.length).toBe(numberOfServerRequests);
        });

        it("memoizes", function() {
            var owner = this.model.owner();
            expect(owner).toBe(this.model.owner());
        });
    });

    describe("#members", function() {
        beforeEach(function() {
            this.model.set({id: 5});
            this.members = this.model.members();
        });

        it("has the right url", function() {
            expect(this.model.members().url()).toContain("/edc/workspace/5/member");
        });

        it("memoizes", function() {
            expect(this.members).toBe(this.model.members());
        });

        context("when the 'saved' event is triggered on the members", function() {
            beforeEach(function() {
                this.changeSpy = jasmine.createSpy("changeSpy");
                this.model.bind("change", this.changeSpy);
            });

            it("triggers 'change' on the workspace", function() {
                this.members.trigger("saved");
                expect(this.changeSpy).toHaveBeenCalled();
            });
        });
    });

    describe("#comments", function() {
        beforeEach(function() {
            this.model.set(fixtures.workspaceJson({latestCommentList: [fixtures.commentJson()]}));
            this.model.set({id: 5});
            this.comments = this.model.comments();
        });

        it("returns a CommentSet", function() {
            expect(this.comments instanceof chorus.collections.CommentSet).toBeTruthy();
        });

        it("memoizes", function() {
            expect(this.comments).toBe(this.model.comments());
        });

        it("initially contains the workspace's latestCommentList", function() {
            var serializedComments = this.model.get("latestCommentList");
            expect(_.first(serializedComments).text).toBeTruthy() //assert it exists first
            expect(_.first(this.comments.models).attributes).toEqual(_.first(serializedComments));
        });
    });

    describe("#hasImage", function() {
        it("returns false when the workspace's 'imageId' field is null", function() {
            this.model.set({ iconId: null });
            expect(this.model.hasImage()).toBeFalsy();
        });

        it("returns true when the workspace's 'imageId' field is not null", function() {
            this.model.set({ iconId: '123' });
            expect(this.model.hasImage()).toBeTruthy();
        });
    });

    describe("#archiver", function() {
        beforeEach(function() {
            this.model.set({archiver: "jhenry", archiverFirstName: "John", archiverLastName: "Henry"})
        });

        it("returns a new User with the right username and fullName", function() {
            var archiver = this.model.archiver();
            expect(archiver.get("fullName")).toBe("John Henry");
            expect(archiver.get("userName")).toBe("jhenry");
        });

    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid workspace", function() {
            this.model.set(fixtures.workspaceJson());
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires name", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("name", undefined);
        });
    });

    describe("#displayName", function() {
        beforeEach(function() {
            this.model = fixtures.workspace();
        })

        it("returns the name", function() {
            expect(this.model.displayName()).toBe(this.model.get("name"));
        })
    })

    describe("#displayShortName", function() {
        context("with a short name", function() {
            beforeEach(function() {
                this.model = fixtures.workspace({name: "Short Name"});
            });

            it("returns the full name", function() {
                expect(this.model.displayShortName()).toBe("Short Name");
            });
        });

        context("with a long name", function() {
            beforeEach(function() {
                this.model = fixtures.workspace({name: "A Much, Much Longer Name"});
            });

            it("returns the shortened name", function() {
                expect(this.model.displayShortName(6)).toBe("A Much...");
            });
        });
    });

    describe("#imageUrl", function() {
        beforeEach(function() {
            this.model = fixtures.workspace({id: 10013});
        })

        it("uses the right URL", function() {
            expect(this.model.imageUrl()).toBe("/edc/workspace/10013/image?size=original");
        });

        it("accepts the size argument", function() {
            expect(this.model.imageUrl({size: "icon"})).toBe("/edc/workspace/10013/image?size=icon");
        });
    });

    describe("picklistImageUrl", function() {
        it("returns the correct URL when the workspace is archived", function() {
            this.model.set({active: false});
            expect(this.model.picklistImageUrl()).toMatchUrl('/images/workspaces/workspace_archived_small.png');
        });

        it("returns the correct URL when the workspace is not archived", function() {
            this.model.set({active: true});
            expect(this.model.picklistImageUrl()).toMatchUrl('/images/workspaces/workspace_small.png');
        });
    });

    describe("#sandbox", function() {
        context("when the workspace has a sandbox", function() {
            beforeEach(function() {
                this.model = fixtures.workspace({
                    sandboxInfo: {
                        databaseId: 4,
                        databaseName: "db",
                        instanceId: 5,
                        instanceName: "instance",
                        sandboxId: "10001",
                        schemaId: 6,
                        schemaName: "schema"
                    }
                })
            });

            it("returns a Sandbox model", function() {
                expect(this.model.sandbox()).toBeA(chorus.models.Sandbox);
                expect(this.model.sandbox().get("id")).toBe("10001")
            });

            it("populates the workspaceId", function() {
                expect(this.model.sandbox().get('workspaceId')).toBe(this.model.get('id'));
            });

            it("memoizes", function() {
                expect(this.model.sandbox()).toBe(this.model.sandbox());
            });
        })

        context("when the workspace does not have a sandbox", function() {
            beforeEach(function() {
                this.model = fixtures.workspace({
                    sandboxInfo: {
                        databaseId: null,
                        databaseName: null,
                        instanceId: null,
                        instanceName: null,
                        sandboxId: null,
                        schemaId: null,
                        schemaName: null
                    }
                })
            });

            it("returns undefined", function() {
                expect(this.model.sandbox()).toBeFalsy();
            });

        })
    });

    describe("permissions checking", function() {
        describe("canRead", function() {
            it("is true when permission contains 'read'", function() {
                this.model.set({permission: ['read', 'commenting']});
                expect(this.model.canRead()).toBeTruthy();
            });

            it("is true when permission contains 'admin'", function() {
                this.model.set({permission: ['admin']});
                expect(this.model.canRead()).toBeTruthy();
            });

            it("is false when it does not contain either 'read' or 'admin'", function() {
                this.model.set({permission: []});
                expect(this.model.canRead()).toBeFalsy();
            });
        });

        describe("canComment", function() {
            it("is true when permission contains 'commenting'", function() {
                this.model.set({permission: ['commenting']});
                expect(this.model.canComment()).toBeTruthy();
            });

            it("is true when permission contains 'admin'", function() {
                this.model.set({permission: ['admin']});
                expect(this.model.canComment()).toBeTruthy();
            });

            it("is false when it does not contain either 'commenting' or 'admin'", function() {
                this.model.set({permission: []});
                expect(this.model.canComment()).toBeFalsy();
            });
        });

        describe("canUpdate", function() {
            it("is true when permission contains 'commenting'", function() {
                this.model.set({permission: ['read', 'update']});
                expect(this.model.canUpdate()).toBeTruthy();
            });

            it("is true when permission contains 'admin'", function() {
                this.model.set({permission: ['admin']});
                expect(this.model.canUpdate()).toBeTruthy();
            });

            it("is false when it does not contain either 'update' or 'admin'", function() {
                this.model.set({permission: []});
                expect(this.model.canUpdate()).toBeFalsy();
            });
        });

        describe("workspaceAdmin", function() {
            it("is true when permission contains 'admin'", function() {
                this.model.set({permission: ['admin']});
                expect(this.model.workspaceAdmin()).toBeTruthy();
            });

            it("is false when it does not contain 'admin'", function() {
                this.model.set({permission: ['update']});
                expect(this.model.workspaceAdmin()).toBeFalsy();
            });
        });
    });
});
