describe("chorus.views.TableauWorkfileContentDetails", function() {
    beforeEach(function() {
        this.model = rspecFixtures.workfile.tableau();
        this.model.set({workbookUrl: 'http://example.com/workbooks/myWorkbook'});
        this.view = new chorus.views.TableauWorkfileContentDetails({ model: this.model })
    });

    describe("render", function() {
        it("shows the 'Launch in Tableau' button", function() {
            this.view.render();
            expect(this.view.$('a.button')).toContainTranslation('workfile.content_details.open_in_tableau')
            expect(this.view.$('a.open_in_tableau').attr('href')).toEqual('http://example.com/workbooks/myWorkbook');
            expect(this.view.$('a.open_in_tableau').attr('target')).toEqual('_blank');
        });
    });
});
