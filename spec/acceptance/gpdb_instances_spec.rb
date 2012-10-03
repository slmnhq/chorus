require 'spec_helper'

resource "Greenplum DB instances" do
  let(:owner) { users(:owner) }
  let(:owned_instance) { gpdb_instances(:owners) }

  before do
    log_in owner
    stub(Gpdb::ConnectionChecker).check! { true }
  end

  post "/gpdb_instances" do
    parameter :name, "Instance alias"
    parameter :description, "Description"
    parameter :host, "Host IP or address"
    parameter :port, "Port"
    parameter :maintenance_db, "Database to use for initial connection (usually 'postgres')"
    parameter :db_username, "User name for connection"
    parameter :db_password, "Password for connection"
    parameter :shared, "1 to allow anyone to connect using these credentials, 0 to require individuals to enter their own credentials"

    let(:name) { "Sesame_Street" }
    let(:description) { "Can you tell me how to get..." }
    let(:host) { "sesame.street.local" }
    let(:port) { "5432" }
    let(:maintenance_db) { "postgres" }
    let(:db_username) { "big" }
    let(:db_password) { "bird_yellow" }
    let(:shared) { "1" }

    required_parameters :name, :host, :port, :maintenance_db, :db_username, :db_password

    example_request "Register a Greenplum database" do
      status.should == 201
    end
  end

  get "/gpdb_instances" do
    parameter :accessible, "1 to limit the list to instances the current user can access, 0 for all instances"
    let(:accessible) { "1" }

    example_request "Get a list of Greenplum instances" do
      status.should == 200
    end
  end

  get "/gpdb_instances/:id" do
    let(:id) { owned_instance.to_param }

    example_request "Get the specific Instance" do
      status.should == 200
    end
  end

  put "/gpdb_instances/:id" do
    parameter :name, "Instance alias"
    parameter :description, "Description"
    parameter :host, "Host IP or address"
    parameter :port, "Port"
    parameter :maintenance_db, "Database to use for initial connection (usually 'postgres')"

    let(:id) { owned_instance.to_param }
    let(:name) { "Sesame_Street" }
    let(:description) { "Can you tell me how to get..." }
    let(:host) { "sesame.street.local" }
    let(:port) { "5432" }
    let(:maintenance_db) { "postgres" }

    example_request "Update an instance" do
      status.should == 200
    end
  end

  get "/gpdb_instances/:gpdb_instance_id/activities" do
    let(:gpdb_instance_id) { owned_instance.to_param }

    example_request "List all activities on an instance" do
      status.should == 200
    end
  end

  get "/gpdb_instances/:gpdb_instance_id/workspace_detail" do
    let(:gpdb_instance_id) { owned_instance.to_param }

    example_request "Get details for workspaces having sandboxes within an instance" do
      status.should == 200
    end
  end
end
