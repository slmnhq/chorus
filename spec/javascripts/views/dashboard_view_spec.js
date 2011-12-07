describe("chorus.views.Dashboard", function(){
    beforeEach(function(){
        this.loadTemplate("plain_text")
        this.view = new chorus.views.Dashboard()
        this.view.render()
    })
    
    it("should render plain text", function(){
        expect($(this.view.el).text()).toBe("party_time")
    })
})