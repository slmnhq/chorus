shared_examples_for "an action that requires authentication" do |method, action|
  describe "when not authenticated" do
    before(:each) do
      log_out
    end

    it "returns unauthorized" do
      send(method, action)
      response.code.should == "401"
    end
  end
end

shared_examples_for "a paginated list" do
  let(:params) {{}}

  it "returns a paginated list" do
    send(:get, :index, params)
    response.code.should == '200'
    response.decoded_body.should have_key 'pagination'
    decoded_pagination.page.should == 1
  end
end