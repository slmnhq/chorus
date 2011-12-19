describe("chorus.models.Workspace", function() {
    var models = chorus.models;
    beforeEach(function() {
        fixtures.model = 'Workspace';
        this.model = new models.Workspace();
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("workspace/{{id}}");
    });

    describe("#defaultIconUrl", function() {
        it("links to the correct url when active", function() {
            this.model.set({active: true});
            expect(this.model.defaultIconUrl()).toBe("/images/workspace-icon-large.png");
        });

        it("links to the correct url when archived", function() {
            this.model.set({active: false});
            expect(this.model.defaultIconUrl()).toBe("/images/workspace-archived-icon-large.png");
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

    describe("#owner", function() {
        beforeEach(function() {
            this.model.set({owner: "jhenry", ownerFullName: "John Henry", ownerId: "47"})
        });

        it("has the right fullName", function() {
            expect(this.model.owner().get("fullName")).toBe("John Henry");
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

    describe("#trucatedSummary", function() {
        beforeEach(function() {
            this.model.set({
                owner: "jhenry",
                summary: "this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary "})
        });
        it("creates a truncated summary text", function() {
            expect(this.model.truncatedSummary(5)).toBe("this ");
        });

    });

    describe("#isTruncate", function() {
        it("sets isTruncate to true when summary is more than 100 characters", function() {
            this.model.set({owner: "jhenry",summary: "this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary" +
                "this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary this is a summary "});
            expect(this.model.isTruncated()).toBeTruthy();
        })
        it("sets isTruncate to false when summary is less than 100 characters", function() {
            this.model.set({summary: "this is a summary this is a summary "})
            expect(this.model.isTruncated()).toBeFalsy();
        });
    });

    describe("#archiver", function() {
        beforeEach(function() {
            this.model.set({archiver: "jhenry", archiverFirstName: "John" ,archiverLastName: "Henry"})
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
            this.model.set(fixtures.modelFor('fetch'));
            expect(this.model.performValidation()).toBeTruthy();
        });

        it("requires name", function() {
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("name", undefined);
        });
    });

    describe("#displayName", function() {
        beforeEach(function() {
            this.model = fixtures.modelFor("fetch");
        })

        it("returns the name", function() {
            expect(this.model.displayName()).toBe(this.model.get("name"));
        })
    })

    describe("#imageUrl", function() {
        beforeEach(function() {
            this.model = fixtures.modelFor("fetch");
        })

        it("uses the right URL", function() {
            expect(this.model.imageUrl()).toBe("/edc/workspace/10013/image?size=original");
        });

        it("accepts the size argument", function() {
            expect(this.model.imageUrl({size: "icon"})).toBe("/edc/workspace/10013/image?size=icon");
        });
    });

    describe("#picklistImageUrl", function() {
        beforeEach(function() {
            this.model = fixtures.modelFor("fetch");
        })

        it("uses the right URL", function() {
            expect(this.model.picklistImageUrl()).toBe("/images/workspace-icon-small.png");
        });
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
    });
})
    ;
