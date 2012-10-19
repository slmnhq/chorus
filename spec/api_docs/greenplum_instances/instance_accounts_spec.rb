require 'spec_helper'

resource "Greenplum DB: accounts" do
  let(:owner) { users(:owner) }
  let(:non_owner) { users(:no_collaborators) }
  let(:member) { users(:the_collaborator) }

  let(:gpdb_instance) { gpdb_instances(:owners) }
  let(:gpdb_instance_id) { gpdb_instance.to_param }

  before do
    stub(Gpdb::ConnectionChecker).check! { true }
  end

  get "/gpdb_instances/:gpdb_instance_id/account" do
    before do
      log_in owner
    end

    parameter :gpdb_instance_id, "The id of a Greenplum instance"

    example_request "Get personal credentials" do
      explanation <<-DESC
        The current user's personal credentials for connecting to this
        instance.  Does not return a shared account's credentials, unless
        the current user is the instance owner.
      DESC

      status.should == 200
    end
  end

  post "/gpdb_instances/:gpdb_instance_id/account" do
    parameter :gpdb_instance_id, "The id of a Greenplum instance"
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"

    let(:db_username) { "big" }
    let(:db_password) { "bird_long_password" }

    required_parameters :db_username, :db_password

    before do
      log_in non_owner
    end

    example_request "Create personal credentials" do
      status.should == 201
    end
  end

  put "/gpdb_instances/:gpdb_instance_id/account" do
    parameter :gpdb_instance_id, "The id of a Greenplum instance"
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"

    let(:db_username) { "snuffle" }
    let(:db_password) { "upagus" }

    required_parameters :db_username, :db_password

    before do
      log_in member
    end

    example_request "Update personal credentials" do
      status.should == 200
    end
  end

  delete "/gpdb_instances/:gpdb_instance_id/account" do
    before do
      log_in member
    end
    parameter :gpdb_instance_id, "The id of a Greenplum instance"

    example_request "Remove personal credentials" do
      status.should == 200
    end
  end
end
