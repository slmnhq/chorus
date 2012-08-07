require 'spec_helper'

describe ConfigurationsController do
  describe "#show" do
    before do
      @user = users(:alice)
      log_in @user
      mock(LdapClient).enabled? { true }
      stub(File).directory? { true }
    end

    it "includes the ldap status" do
      get :show
      response.code.should == "200"
      decoded_response.external_auth_enabled.should == true
    end

    it "includes the gpfdist config and write permissions" do
      stub(File).writable? { true }
      get :show
      response.code.should == "200"
      decoded_response.gpfdist_write_permissions.should == true
      decoded_response.gpfdist_url.should == "localhost"
      decoded_response.gpfdist_port.should == 8181
      decoded_response.gpfdist_data_dir.should == "/tmp"
    end

    it "includes the gpfdist config with no write permissions" do
      stub(File).writable? { false }
      get :show
      response.code.should == "200"
      decoded_response.gpfdist_write_permissions.should == false
      decoded_response.gpfdist_url.should == "localhost"
      decoded_response.gpfdist_port.should == 8181
      decoded_response.gpfdist_data_dir.should == "/tmp"
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
