require 'spec_helper'

describe ConfigurationsController do
  describe "#show" do
    before do
      @user = users(:no_collaborators)
      log_in @user
      mock(LdapClient).enabled? { true }
      stub(File).directory? { true }
      stub.proxy(Chorus::Application.config.chorus).[](anything)
    end

    it "includes the ldap status" do
      stub(Chorus::Application.config.chorus).[]('ldap') { {'enabled' => true} }
      get :show
      response.code.should == "200"
      decoded_response.external_auth_enabled.should == true
    end

    it "includes the tableau_configured? value" do
      stub(Chorus::Application.config.chorus).tableau_configured? { 'value' }
      get :show
      response.code.should == "200"
      decoded_response.tableau_configured.should == 'value'
    end

    it "includes the kaggle_configured? value" do
      stub(Chorus::Application.config.chorus).kaggle_configured? { 'value' }
      get :show
      response.code.should == "200"
      decoded_response.kaggle_configured.should == 'value'
    end

    it "includes the gnip_configured? value" do
      stub(Chorus::Application.config.chorus).gnip_configured? { 'value' }
      get :show
      response.code.should == "200"
      decoded_response.gnip_configured.should == 'value'
    end

    it "gpfdist_configured is true when config.gpfdist_configured? is true" do
      stub(Chorus::Application.config.chorus).gpfdist_configured? { true }
      get :show
      response.code.should == "200"
      decoded_response.gpfdist_configured.should == true
    end

    it "gpfdist_configured is false when config.gpfdist_configured? is false" do
      stub(Chorus::Application.config.chorus).gpfdist_configured? { false }
      get :show
      response.code.should == "200"
      decoded_response.gpfdist_configured.should == false
    end

    it "includes the file size maximums" do
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.csv_imports') { 1 }
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.workfiles') { 10 }
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.user_icon') { 5 }
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.workspace_icon') { 5 }
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.attachment') { 10 }
      get :show
      response.code.should == "200"
      decoded_response.file_sizes_mb_csv_imports.should == 1
      decoded_response.file_sizes_mb_workfiles.should == 10
      decoded_response.file_sizes_mb_user_icon.should == 5
      decoded_response.file_sizes_mb_workspace_icon.should == 5
      decoded_response.file_sizes_mb_attachment.should == 10
    end

    generate_fixture "config.json" do
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.csv_imports') { 1 }
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.workfiles') { 10 }
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.user_icon') { 5 }
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.workspace_icon') { 5 }
      stub(Chorus::Application.config.chorus).[]('file_sizes_mb.attachment') { 10 }
      get :show
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
