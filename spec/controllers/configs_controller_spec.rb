require 'spec_helper'

describe ConfigsController do
  before do
    @user = FactoryGirl.create(:user)
    log_in @user
  end

  describe "#show" do
    before(:each) do
      mock(LdapClient).enabled? { true }
    end

    it "includes the ldap status" do
      get :show
      response.code.should == "200"
      decoded_response.external_auth_enabled.should == true
    end
  end
end
