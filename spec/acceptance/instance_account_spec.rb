require 'spec_helper'

resource "Greenplum DB account for current user" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => instance, :owner => owner) }
  let!(:non_owner) { FactoryGirl.create(:user) }
  let!(:member) {FactoryGirl.create(:instance_account, :instance => instance).owner }

  let!(:instance) { FactoryGirl.create(:instance, :owner => owner) }
  let(:instance_id) { instance.to_param }

  before do
    stub(Gpdb::ConnectionChecker).check! { true }
  end

  get "/instances/:instance_id/account" do
    before do
      log_in owner
    end

    example_request "Get personal credentials" do
      status.should == 200
    end
  end

  post "/instances/:instance_id/account" do
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"

    let(:db_username) { "big" }
    let(:db_password) { "bird" }

    required_parameters :db_username, :db_password
    scope_parameters :account, :all

    before do
      log_in non_owner
    end

    example_request "Create personal credentials" do
      status.should == 201
    end
  end

  put "/instances/:instance_id/account" do
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"

    let(:db_username) { "snuffle" }
    let(:db_password) { "upagus" }

    required_parameters :db_username, :db_password
    scope_parameters :account, :all

    before do
      log_in member
    end

    example_request "Update personal credentials" do
      status.should == 200
    end
  end

  delete "/instances/:instance_id/account" do
    before do
      log_in member
    end

    example_request "Remove personal credentials" do
      status.should == 200
    end
  end
end