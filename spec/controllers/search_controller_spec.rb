require 'spec_helper'

describe SearchController do
  describe "#show" do
    before do
      log_in FactoryGirl.create(:user, :username => 'some_user', :first_name => "marty", :last_name => "alpha")
    end

    it_behaves_like "an action that requires authentication", :get, :show

    it "uses the search object" do
      any_instance_of(Search) do |search|
        stub(search).models {Hash.new([])}
      end
      mock_present do |model|
        model.should be_a Search
        model.query.should == 'marty'
      end
      get :show, :query => 'marty'
    end
  end
end
