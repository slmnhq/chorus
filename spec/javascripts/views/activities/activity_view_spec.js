describe("chorus.views.Activity", function() {
    beforeEach(function() {
        this.model = fixtures.activity.NOTE();
        this.view = new chorus.views.Activity({ model: this.model });
    });

    describe("#render", function() {
        context("type: MEMBERS_ADDED", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.MEMBERS_ADDED();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderWorkspaceDetails({checkLink : true});
            itShouldRenderACommentLink("activitystream", t("comments.title.ACTIVITY"))

            context("when only one member was added", function() {
                beforeEach(function() {
                    this.view.model.set({ user : [this.view.model.get("user")[0]] });
                    this.presenter = new chorus.presenters.Activity(this.view.model)
                    this.view.render();
                })

                it("calls out the user", function() {
                    expect(this.view.$(".object a")).toHaveText(this.view.model.get("user")[0].name)
                })
            })

            context("when more than one member was added", function() {
                it("calls out the first user", function() {
                    expect(this.view.$(".object a")).toHaveText(this.view.model.get("user")[0].name)
                })
            })
        });

        context("type: WORKSPACE_CREATED", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.WORKSPACE_CREATED();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderACommentLink("activitystream", t("comments.title.ACTIVITY"))
        });

        context("type: USER_DELETED", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.USER_DELETED();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : false});
            itShouldRenderACommentLink("activitystream", t("comments.title.ACTIVITY"))
        });

        context("type: WORKSPACE_DELETED", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.WORKSPACE_DELETED();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : false});
            itShouldRenderACommentLink("activitystream", t("comments.title.ACTIVITY"))
        });

        context("type: WORKSPACE_MAKE_PRIVATE", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.WORKSPACE_MAKE_PRIVATE();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderACommentLink("activitystream", t("comments.title.ACTIVITY"))
        });

        context("type: WORKSPACE_MAKE_PUBLIC", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.WORKSPACE_MAKE_PUBLIC();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderACommentLink("activitystream", t("comments.title.ACTIVITY"))
        });

        context("type: WORKSPACE_ARCHIVED", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.WORKSPACE_ARCHIVED();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderACommentLink("activitystream", t("comments.title.ACTIVITY"))
        });

        context("type: WORKSPACE_UNARCHIVED", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.WORKSPACE_UNARCHIVED();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderACommentLink("activitystream", t("comments.title.ACTIVITY"))
        });

        context("type: NOTE", function() {
            beforeEach(function() {
                this.view.model = fixtures.activity.NOTE();
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            itShouldRenderAuthorDetails();
            itShouldRenderObjectDetails({checkLink : true});
            itShouldRenderWorkspaceDetails({checkLink : true});
            itShouldRenderACommentLink("comment", t("comments.title.NOTE"))

            it("displays the comment body", function() {
               expect(this.view.$(".body").eq(0).text().trim()).toBe(this.view.model.get("text"));
            });

            it("displays the timestamp", function() {
                expect(this.view.$(".timestamp").text()).not.toBeEmpty();
            });

            it("renders items for the sub-comments", function() {
                expect(this.model.get("comments").length).toBe(1);
                expect(this.view.$(".comments li").length).toBe(1);
            });
        });

        context("when the type is unknown", function() {
            beforeEach(function() {
                this.view.model.set({type: "DINNER_TIME"});
                this.presenter = new chorus.presenters.Activity(this.view.model)
                this.view.render();
            });

            it("returns a default header", function() {
                this.model.set({ type: "GEN MAI CHA" });
                expect(this.view.render().$(".activity_header .author")).toExist();
            });
        });
    });

    function itShouldRenderAuthorDetails() {
        it("renders the author's icon", function() {
            expect(this.view.$('img').attr('src')).toBe(this.view.model.author().imageUrl());
        });

        it("contains the author's name", function() {
            expect(this.view.$("a.author").text()).toContain(this.view.model.author().displayName());
        });

        it("contains the author's url", function() {
            expect(this.view.$('a.author').attr('href')).toBe(this.view.model.author().showUrl());
        });
    };

    function itShouldRenderObjectDetails(options) {
        options || (options = {});

        it("contains the object's name", function() {
            expect(this.view.$(".object").text()).toContain(this.presenter.objectName);
        });

        if (options.checkLink) {
            it("contains the object's url", function() {
                expect(this.view.$('.object a').attr('href')).toBe(this.presenter.objectUrl);
            });
        }
    };

    function itShouldRenderWorkspaceDetails(options) {
        options || (options = {});

        it("contains the workspace's name", function() {
            expect(this.view.$(".workspace").text()).toContain(this.presenter.workspaceName);
        });

        if (options.checkLink) {
            it("contains the workspace's url", function() {
                expect(this.view.$('.workspace a').attr('href')).toBe(this.presenter.workspaceUrl);
            });
        }
    };

    function itShouldRenderACommentLink(entityType, entityTitle) {
        it("sets the correct entityType on the comment dialog link", function() {
            expect(this.view.$("a.comment").data("entity-type")).toBe(entityType);
        })

        it("sets the correct entityTitle on the comment dialog link", function() {
            expect(this.view.$("a.comment").data("entity-title")).toBe(entityTitle)
        })
    }
});
