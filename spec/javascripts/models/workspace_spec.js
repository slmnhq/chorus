describe("chorus.models.Workspace", function() {
    var models = chorus.models;
    beforeEach(function() {
        this.model = newFixtures.workspace({
            archived_at: null,
            image: {
                icon: "/system/workspaces/images/000/000/005/icon/workspaceimage.jpg",
                original: "/system/workspaces/images/000/000/005/original/workspaceimage.jpg"
            }
        });
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("workspaces/{{id}}");
    });

    describe("#isActive", function() {
        it("return true when active:true", function() {
            this.model.set({archived_at: null});
            expect(this.model.isActive()).toBeTruthy();
        });

        it("returns false otherwise", function() {
            this.model.set({ archived_at: "2012-05-08 21:40:14" });
            expect(this.model.isActive()).toBeFalsy();
        });
    });

    describe("#datasetsInDatabase(database)", function() {
        beforeEach(function() {
            var database = newFixtures.schema({ databaseName: "foo" }).database();
            this.datasets = this.model.datasetsInDatabase(database)
        });

        it("returns a dataset set with the right workspace and database", function() {
            expect(this.datasets).toBeA(chorus.collections.DatasetSet);
            expect(this.datasets.attributes.workspaceId).toBe(this.model.id);
            expect(this.datasets.attributes.databaseName).toBe("foo");
        });
    });


    describe("#isPublic", function() {
        it("return true when public: true", function() {
            this.model.set({public: true});
            expect(this.model.isPublic()).toBeTruthy();
        });

        it("returns false otherwise", function() {
            this.model.set({ public: false });
            expect(this.model.isPublic()).toBeFalsy();
        });
    })

    describe("#defaultIconUrl", function() {
        it("links to the active url when workspace is active", function() {
            this.model.set({archived_at: null, public: true});
            expect(this.model.defaultIconUrl()).toBe("/images/workspaces/workspace_large.png");
        });

        it("links to the archive url when workspace is not active  ", function() {
            this.model.set({archived_at: "2012-05-08 21:40:14",   public: true});
            expect(this.model.defaultIconUrl()).toBe("/images/workspaces/workspace_archived_large.png");
        });

        it("links to the private active url when workspace is active and public:false", function() {
            this.model.set({archived_at: null, public: false});
            expect(this.model.defaultIconUrl()).toBe("/images/workspaces/private_workspace_large.png");
        });

        it("links to the private archive url otherwise", function() {
            this.model.set({archived_at: "2012-05-08 21:40:14", public: false});
            expect(this.model.defaultIconUrl()).toBe("/images/workspaces/private_workspace_archived_large.png");
        });
    });

    describe("#customIconUrl", function() {
        it("links to the original url by default", function() {
            this.model.set({id: 5});
            expect(this.model.customIconUrl()).toBe("/system/workspaces/images/000/000/005/original/workspaceimage.jpg");
        });

        it("links to the requested size", function() {
            this.model.set({id: 5});
            expect(this.model.customIconUrl({size: 'icon'})).toBe("/system/workspaces/images/000/000/005/icon/workspaceimage.jpg");
        });
    });

    describe("#datasets", function() {
        it("returns a memoized dataset set with the right workspace id", function() {
            var datasets = this.model.datasets();
            expect(datasets).toBeA(chorus.collections.DatasetSet);
            expect(datasets.attributes.workspaceId).toBe(this.model.id);
            expect(datasets).toBe(this.model.datasets());
        });
    });

    describe("#workfilesUrl", function() {
        it("links to the workfile index route", function() {
            this.model.set({id: 5});
            expect(this.model.workfilesUrl()).toBe("#/workspaces/5/workfiles");
        });
    });

    describe("#owner", function() {
        context('when owner data is not nested', function() {
            beforeEach(function() {
                this.model.set({ owner: "jhenry", ownerFirstName: "John", ownerLastName: "Henry", ownerId: "47" });
            });

            it("has the attributes", function() {
                expect(this.model.owner().get("id")).toBe("47");
                expect(this.model.owner().get("username")).toBe("jhenry");
                expect(this.model.owner().get("first_name")).toBe("John");
                expect(this.model.owner().get("last_name")).toBe("Henry");
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

        context('when owner data is nested', function() {
            beforeEach(function() {
                this.model.set({ owner: { id: '47' } })
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
    });

    describe("#members", function() {
        beforeEach(function() {
            this.model.set({id: 5});
            this.members = this.model.members();
        });

        it("has the right url", function() {
            expect(this.model.members().url()).toContain("/workspaces/5/members");
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
            this.model.set({ id: 5, latestCommentList: [fixtures.commentJson()] });
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
            this.model.set({ image: {original: "", icon: ""} });
            expect(this.model.hasImage()).toBeFalsy();
        });

        it("returns true when the workspace's 'imageId' field is not null", function() {
            this.model.set({ image: {original: "5.jpg", icon: "5.jpg"} });
            expect(this.model.hasImage()).toBeTruthy();
        });
    });

    describe("#fetchImageUrl", function() {
        var workspace;

        beforeEach(function() {
            spyOn(chorus, "cachebuster").andReturn(12345)
            workspace = newFixtures.workspace({
                archived_at: null,
                image: {
                    icon: "/system/workspaces/images/000/000/005/icon/workspaceimage.jpg",
                    original: "/system/workspaces/images/000/000/005/original/workspaceimage.jpg"
                }
            });
        });

        it("returns undefined when the workspace does not have an image", function() {
            workspace.unset("image");
            expect(workspace.fetchImageUrl()).toBeUndefined();
        });

        it("appends a cache-busting query param", function() {
            expect(workspace.fetchImageUrl()).toContainQueryParams({ iebuster: 12345 });
        });

        it("uses the URL for the original-sized image by default", function() {
            expect(workspace.fetchImageUrl()).toHaveUrlPath("/system/workspaces/images/000/000/005/original/workspaceimage.jpg");
        });

        it("uses the icon url if the 'size' option is set to 'icon'", function() {
            expect(workspace.fetchImageUrl({ size: "icon" })).toHaveUrlPath("/system/workspaces/images/000/000/005/icon/workspaceimage.jpg");
        });
    });

    describe("#archiver", function() {
        beforeEach(function() {
            this.model.set({archiver: {first_name: "John", last_name: "Henry", username: "jhenry"}})
        });

        it("returns a new User with the right username and fullName", function() {
            var archiver = this.model.archiver();
            expect(archiver.displayName()).toBe("John Henry");
            expect(archiver.get("username")).toBe("jhenry");
        });

    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("should return a truthy value for a valid workspace", function() {
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires name", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("name", undefined);
        });
    });

    describe("#displayName", function() {
        beforeEach(function() {
            this.model = newFixtures.workspace();
        })

        it("returns the name", function() {
            expect(this.model.displayName()).toBe(this.model.get("name"));
        })
    })

    describe("#displayShortName", function() {
        context("with a short name", function() {
            beforeEach(function() {
                this.model = newFixtures.workspace({name: "Short Name"});
            });

            it("returns the full name", function() {
                expect(this.model.displayShortName()).toBe("Short Name");
            });
        });

        context("with a long name", function() {
            beforeEach(function() {
                this.model = newFixtures.workspace({name: "A Much, Much Longer Name"});
            });

            it("returns the shortened name", function() {
                expect(this.model.displayShortName(6)).toBe("A Much...");
            });
        });
    });

    describe("#createImageUrl", function() {
        beforeEach(function() {
            this.model = newFixtures.workspace({id: 10013});
        })

        it("uses the right URL", function() {
            expect(this.model.createImageUrl()).toBe("/workspaces/10013/image");
        });
    });

    describe("picklistImageUrl", function() {
        it("returns the correct URL when the workspace is archived and is public", function() {
            this.model.set({archived_at: "2012-05-08 21:40:14", public: true});
            expect(this.model.picklistImageUrl()).toMatchUrl('/images/workspaces/workspace_archived_small.png');
        });

        it("returns the correct URL when the workspace is not archived and is public", function() {
            this.model.set({archived_at: null, public: true});
            expect(this.model.picklistImageUrl()).toMatchUrl('/images/workspaces/workspace_small.png');
        });

        it("returns the correct URL when the workspace is archived and is private", function() {
            this.model.set({archived_at: "2012-05-08 21:40:14", public: false});
            expect(this.model.picklistImageUrl()).toMatchUrl('/images/workspaces/private_workspace_archived_small.png');
        });

        it("returns the correct URL when the workspace is not archived and is private", function() {
            this.model.set({archived_at: null, public: false});
            expect(this.model.picklistImageUrl()).toMatchUrl('/images/workspaces/private_workspace_small.png');
        });
    });

    describe("#sandbox", function() {
        context("when the workspace has a sandbox", function() {
            beforeEach(function() {
                this.model = newFixtures.workspace({
                    sandboxInfo: {
                        databaseId: 4,
                        databaseName: "db",
                        instance_id: 5,
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
                this.model = newFixtures.workspace({
                    sandboxInfo: {
                        databaseId: null,
                        databaseName: null,
                        instance_id: null,
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
        beforeEach(function() {
            this.model.set({ownerFirstName: "John", ownerLastName: "Henry", ownerId: "47"})
        });

        describe("#currentUserIsMember", function() {
            it("returns true iff the current logged-in user is a member", function() {
                this.model.members().add([
                    newFixtures.user({ id: "31" }),
                    newFixtures.user({ id: "32" }),
                    newFixtures.user({ id: "33" })
                ]);

                setLoggedInUser({ id: "31" });
                expect(this.model.currentUserIsMember()).toBeTruthy();
                setLoggedInUser({ id: "48" });
                expect(this.model.currentUserIsMember()).toBeFalsy();
            });
        });

        describe("#currentUserIsOwner", function() {
            it("returns true iff the current logged-in user is the owner", function() {
                setLoggedInUser({ id: "47" });
                expect(this.model.currentUserIsOwner()).toBeTruthy();
                setLoggedInUser({ id: "48" });
                expect(this.model.currentUserIsOwner()).toBeFalsy();
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

        describe("isEditableBy", function() {
            it("is true when the given user is an admin", function() {
                expect(this.model.isEditableBy(newFixtures.user({ admin: true }))).toBeTruthy();
            });

            it("is true when the given user is the owner", function() {
                var user = this.model.owner().clone();
                expect(this.model.isEditableBy(user)).toBeTruthy();
            });

            it("is false otherwise", function() {
                var user = newFixtures.user();
                expect(this.model.isEditableBy(user)).toBeFalsy();
            });
        });
    });
});
