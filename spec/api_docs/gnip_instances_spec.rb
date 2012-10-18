require 'spec_helper'

resource "Gnip instances" do
  let(:user) { users(:owner) }
  let(:gnip_instance) { gnip_instances(:default) }

  before do
    log_in user
    any_instance_of(ChorusGnip) do |c|
      stub(c).auth { true }
    end
  end

  post "/gnip_instances" do
    parameter :name, "gnip account name"
    parameter :description, "gnip account description"
    parameter :stream_url, "gnip stream url"
    parameter :username, "gnip account username"
    parameter :password, "gnip account password"

    let(:name) { "example name" }
    let(:description) { "Can you tell me how to get..." }
    let(:stream_url) { "https://historical.gnip.com/fake" }
    let(:username) { "example_user" }
    let(:password) { "sample_password" }

    required_parameters :name, :stream_url, :username, :password

    example_request "Register a Gnip Instance" do
      status.should == 201
    end
  end

  get "/gnip_instances" do
    pagination

    example_request "Get a list of registered Gnip Instances" do
      status.should == 200
    end
  end

  get "/gnip_instances/:id" do
    let(:id) { gnip_instances(:default).id }
    example_request "Get a registered Gnip Instance" do
      status.should == 200
    end
  end

  put "/gnip_instances/:id" do
    parameter :name, "gnip account name"
    parameter :description, "gnip account description"
    parameter :stream_url, "gnip stream url"
    parameter :username, "gnip account username"
    parameter :password, "gnip account password"

    let(:id) { gnip_instance.to_param }
    let(:name) { "example name" }
    let(:description) { "Can you tell me how to get..." }
    let(:stream_url) { "https://historical.gnip.com/fake" }
    let(:username) { "example_user" }
    let(:password) { "" }

    required_parameters :name, :stream_url, :username

    example_request "Update a registered Gnip Instance" do
      status.should == 200
    end
  end

  post "/gnip_instances/:gnip_instance_id/imports" do
    before do
      any_instance_of(CsvFile) {|file| stub(file).table_already_exists(anything) { false } }
    end

    parameter :workspace_id, "gnip account name"
    parameter :to_table, "gnip account name"

    required_parameters :workspace_id, :to_table

    let(:gnip_instance_id) { gnip_instance.to_param }
    let(:workspace_id) { workspaces(:public).id }
    let(:to_table) { "target_table" }

    example_request "Import data from Gnip" do
      status.should == 200
    end
  end
end