require 'spec_helper'

describe GpdbInstanceWorkspaceDetailPresenter, :type => :view do
  let(:gpdb_instance) { gpdb_instances(:owners) }
  let(:user) { gpdb_instance.owner }
  let(:presenter) { GpdbInstanceWorkspaceDetailPresenter.new(gpdb_instance, view, {}) }

  before do
    Chorus::Application.config.chorus.config['sandbox_recommended_size_in_gb'] = 1
    stub(ActiveRecord::Base).current_user { user }
  end

  describe "#to_hash" do
    let(:size) { 10 }
    before do
      any_instance_of(GpdbSchema) do |schema|
        stub(schema).disk_space_used { size }
      end
    end
    let(:hash) { presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:workspaces)
      hash.should have_key(:sandboxes_size)
      hash.should have_key(:sandboxes_size_in_bytes)
    end

    it "has a human text for size" do
      hash[:sandboxes_size].should == view.number_to_human_size(hash[:sandboxes_size_in_bytes])
    end

    context "with several workspaces using the same sandbox" do
      let(:sandbox) { gpdb_schemas(:default) }
      let(:duplicate_sandbox_workspace1) { FactoryGirl.create(:workspace, :sandbox => sandbox) }
      let(:duplicate_sandbox_workspace2) { FactoryGirl.create(:workspace, :sandbox => sandbox) }

      it "doesn't add up the sandbox size of the duplicate sandboxes" do
        sandbox_ids = Workspace.where(:sandbox_id => gpdb_instance.schema_ids).collect(&:sandbox_id).uniq
        hash[:sandboxes_size_in_bytes].should == sandbox_ids.length * size
      end
    end

    context "for the workspaces" do
      let(:workspaces) { hash[:workspaces] }
      let(:workspace_hash) { workspaces.first }

      it "has the right keys" do
        workspace_hash.should have_key(:id)
        workspace_hash.should have_key(:name)
        workspace_hash.should have_key(:size)
        workspace_hash.should have_key(:percentage_used)
        workspace_hash.should have_key(:schema_name)
        workspace_hash.should have_key(:database_name)
        workspace_hash.should have_key(:owner_full_name)
      end

      it "has a human text for size and a numerical value for size_in_bytes" do
        workspace_hash[:size_in_bytes].should == 10
        workspace_hash[:size].should == view.number_to_human_size(10)
      end

      it "uses recommended sandbox size to calculate percentage_used" do
        workspace_hash[:percentage_used].should == (10 / (1 * 1024 * 1024 * 1024).to_f * 100).round
      end

      it "sanitizes the workspace names" do
        workspace = gpdb_instance.used_by_workspaces(user).first
        workspace.update_attributes!(:name => "<script>")
        workspaces.detect{|w| w[:id] == workspace.id}[:name].should == "&lt;script&gt;"
      end

      context "when size cannot be calculated" do
        let(:size) { nil }

        it "returns nil for size and percentage" do
          hash[:size].should == nil
          hash[:size_in_bytes].should == nil
          hash[:percentage_used].should == nil
        end
      end
    end

    context "when the current_user doesn't have access to the instance" do
      let(:user) { users(:not_a_member) }

      it "should have nil for values" do
        hash[:workspaces].should be_nil
        hash[:sandboxes_size].should be_nil
        hash[:sandboxes_size_in_bytes].should be_nil
      end
    end

    context "when disk space for a schema can't be retrieved" do
      it "skips those schemas" do
        any_instance_of(GpdbSchema) {|schema| stub(schema).disk_space_used(anything) {nil} }
        hash[:sandboxes_size].should == "0 Bytes"
        hash[:sandboxes_size_in_bytes].should == 0
      end
    end
  end
end