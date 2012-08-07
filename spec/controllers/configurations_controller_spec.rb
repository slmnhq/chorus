require 'spec_helper'

describe ConfigurationsController do
  describe "#show" do
    before do
      @user = users(:alice)
      log_in @user
      mock(LdapClient).enabled? { true }
    end

    it "includes the ldap status" do
      get :show
      response.code.should == "200"
      decoded_response.external_auth_enabled.should == true
    end
  end

  describe "#version" do
    it "shows the build SHA if the version_build file exists" do
      stub(File).exists? { true }
      stub(File).read { "foobarbaz" }
      get :version
      response.body.should == "foobarbaz"
    end

    it "does not show the build SHA (or crash) if the version_build file does not exist" do
      stub(File).exists? { false }
      get :version
      response.body.should == Chorus::VERSION::STRING
    end
  end
end
