describe("chorus.pages.WorkfileShowPage", function() {
    beforeEach(function() {
        this.loadTemplate("main_content");
        this.loadTemplate("sub_nav");
        this.loadTemplate("logged_in_layout");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("workfile_header");
        this.loadTemplate("workfile_content_details");
        this.loadTemplate("header");
        this.loadTemplate("text_workfile_content");
        this.loadTemplate("workfile_show_sidebar")
        this.loadTemplate("sidebar_activity_list")

        this.workspaceId = 4;
        this.workfileId = 5;

    });

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(chorus.views.WorkfileContentDetails, 'buildFor').andCallThrough();
            spyOn(chorus.views.WorkfileContent, 'buildFor').andCallThrough();
            this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
        });
        it("instantiates and fetches a workspace with  given id", function() {
            var workspace = this.page.workspace;
            expect(workspace.get("id")).toBe(this.workspaceId);
            expect(this.server.requests[0].url).toBe(workspace.url());
        });

        it("instantiates and fetches a workfile with ehe given id", function() {
            var workfile = this.page.model;
            expect(workfile.get("id")).toBe(this.workfileId);
            expect(this.server.requests[1].url).toBe(workfile.url());
        });

        it("does not instantiate views for the content details or content", function() {
            expect(this.page.mainContent.contentDetails).toBeUndefined();
            expect(this.page.mainContent.content).toBeUndefined();
        });

        describe("when the workfile is fetched", function() {
            beforeEach(function() {
                spyOn(this.page.mainContent, "render");
                fixtures.model = "Workfile";
                this.server.respondWith(
                    'GET',
                    this.page.model.url(),
                    this.prepareResponse(fixtures.jsonFor("fetch")));
                this.server.respond();
            });

            it("instantiates the content details view", function() {
                expect(chorus.views.WorkfileContentDetails.buildFor).toHaveBeenCalledWith(this.page.model)
            });

            it("instantiates the content view", function() {
                expect(chorus.views.WorkfileContent.buildFor).toHaveBeenCalledWith(this.page.model)
            });
            
            it("re-renders the mainContent", function() {
                expect(this.page.mainContent.render).toHaveBeenCalled();
            });

        });
    });

    describe("#render", function(){
        beforeEach(function() {
            this.page = new chorus.pages.WorkfileShowPage(this.workspaceId, this.workfileId);
            fixtures.model = "Workfile";
            this.server.respondWith(
                'GET',
                this.page.model.url(),
                this.prepareResponse(fixtures.jsonFor("fetch")));
            this.server.respond();
        });

        it("it displays the workfile name in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("h1").text()).toBe("who.sql");
        });

        it("displays the file icon in the content header", function() {
            expect(this.page.mainContent.contentHeader.$("img").attr("src")).toBe(chorus.urlHelpers.fileIconUrl('sql'));
        });

        describe("the workfile detail view raises file:edit event", function() {
            beforeEach(function() {
                this.editSpy = jasmine.createSpy("file:edit");
                this.page.mainContent.content.bind("file:edit", this.editSpy);

                // In Jasmine with IE8, editor.focus causes a silent-ish failure
                spyOn(this.page.mainContent.content.editor, 'focus');

                this.page.mainContent.contentDetails.trigger("file:edit");
            });

            it("relays the event to the workfile content", function() {
                expect(this.editSpy).toHaveBeenCalled();
            });
        });

        describe("the workfile detail view raises file:save event", function() {
            beforeEach(function() {
                this.saveSpy = jasmine.createSpy("file:save");
                this.page.mainContent.content.bind("file:save", this.saveSpy);

                this.page.mainContent.contentDetails.trigger("file:save");
            });

            it("relays the event to the workfile content", function() {
                expect(this.saveSpy).toHaveBeenCalled();
            });
        });
    })
});
