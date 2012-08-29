require 'spec_helper'

resource "Greenplum DB members" do
  let!(:owner) { users(:bob) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :gpdb_instance => gpdb_instance, :owner => owner) }
  let!(:non_member) { users(:alice) }
  let!(:member_account) { FactoryGirl.create(:instance_account, :gpdb_instance => gpdb_instance) }
  let!(:member) { member_account.owner }

  let!(:gpdb_instance) { FactoryGirl.create(:gpdb_instance, :owner => owner) }
  let(:gpdb_instance_id) { gpdb_instance.to_param }

  before do
    log_in owner
    stub(Gpdb::ConnectionChecker).check! { true }
  end

  get "/gpdb_instances/:gpdb_instance_id/members" do
    example_request "List members with access to DB" do
      explanation <<-DESC
        For a Greenplum instance owner to manage which users can access their
        instances.  When the instance is shared this list will only
        return the instance owner's credentials.  When the instance
        is not shared, this list includes people who were added by the owner
        or who have manually added their own credentials.
      DESC

      status.should == 200
    end
  end

  post "/gpdb_instances/:gpdb_instance_id/members" do
    parameter :owner_id, "User ID of new member"
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"

    let(:owner_id) { non_member.to_param }
    let(:db_username) { "big" }
    let(:db_password) { "bird_grosservogel" }

    required_parameters :owner_id, :db_username, :db_password
    scope_parameters :account, :all

    example_request "Add member" do
      status.should == 201
    end
  end

  put "/gpdb_instances/:gpdb_instance_id/members/:id" do
    parameter :id, "Account ID of member to update"
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"

    let(:id) { member_account.to_param }
    let(:db_username) { "snuffle" }
    let(:db_password) { "upagus" }

    required_parameters :db_username, :db_password
    scope_parameters :account, :all

    example_request "Update member" do
      status.should == 200
    end
  end

  delete "/gpdb_instances/:gpdb_instance_id/members/:id" do
    parameter :id, "Account ID of member to delete"

    let(:id) { member_account.to_param }

    example_request "Remove member" do
      status.should == 200
    end
  end
end
