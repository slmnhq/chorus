require 'spec_helper'

describe SearchController do
  describe "#show" do
    before do
      log_in FactoryGirl.create(:user, :username => 'some_user', :first_name => "marty", :last_name => "alpha")
    end

    it_behaves_like "an action that requires authentication", :get, :show

    it "uses the search object" do
      get :show, :query => 'marty'
      assigns(:search).should be_a Search
      assigns(:search).query.should == 'marty'
    end

    it "presents the search" do
      search = Search.new
      stub(Search).new do
        search
      end
      mock.proxy(controller).present(search)
      get :show, :query => 'marty'
    end
  end
end
