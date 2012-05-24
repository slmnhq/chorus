require "spec_helper"

describe GpdbSchemaAccess do
  let(:user) { FactoryGirl.create(:user) }
  let(:owner) { FactoryGirl.build(:user) }
  let(:database) { FactoryGirl.build(:gpdb_database, :instance => instance) }
  let(:instance) { FactoryGirl.create(:instance, :owner => owner) }
  let(:schema_access) {
    controller = SchemasController.new
    stub(controller).current_user { user }
    GpdbSchemaAccess.new(controller)
  }

  describe "#index?" do
    let(:account) { FactoryGirl.build(:instance_account, :owner => owner, :instance => instance) }
    context "Private Instance" do
      it "prevents non-members from indexing" do
        schema_access.can?(:index, GpdbSchema, database, nil).should be_false
      end

      it "allow members to index" do
        InstanceAccount.new(:owner => user, :instance => instance)
        schema_access.can?(:index, GpdbSchema, database, account).should be_true
      end

      it "allows owners to index" do
        instance.owner = user
        schema_access.can?(:index, GpdbSchema, database, account).should be_true
      end

      it "allows admins to index" do
        user.admin = true
        schema_access.can?(:index, GpdbSchema, database, account).should be_true
      end
    end

    context "Public Instance" do
      before(:each) do
        instance.shared = true
      end
      it "allows non-members to index" do
        schema_access.can?(:index, GpdbSchema, database, nil).should be_true
      end

      it "allow members to index" do
        InstanceAccount.new(:owner => user, :instance => instance)
        schema_access.can?(:index, GpdbSchema, database, account).should be_true
      end

      it "allows owners to index" do
        instance.owner = user
        schema_access.can?(:index, GpdbSchema, database, account).should be_true
      end

      it "allows admins to index" do
        user.admin = true
        schema_access.can?(:index, GpdbSchema, database, account).should be_true
      end
    end
  end

  describe "#show?" do
    let(:schema) { FactoryGirl.create(:gpdb_schema, :database => database) }
    context "Private Instance" do
      it "prevents non-members from indexing" do
        schema_access.can?(:show, schema).should be_false
      end

      it "allow members to index" do
        FactoryGirl.create(:instance_account, :owner => user, :instance => instance)
        schema_access.can?(:show, schema).should be_true
      end

      it "allows owners to index" do
        instance.owner = user
        schema_access.can?(:show, schema).should be_true
      end

      it "allows admins to index" do
        user.admin = true
        schema_access.can?(:show, schema).should be_true
      end
    end

    context "Public Instance" do
      before(:each) do
        instance.shared = true
      end
      it "allows non-members to index" do
        schema_access.can?(:show, schema).should be_true
      end

      it "allow members to index" do
        InstanceAccount.new(:owner => user, :instance => instance)
        schema_access.can?(:show, schema).should be_true
      end

      it "allows owners to index" do
        instance.owner = user
        schema_access.can?(:show, schema).should be_true
      end

      it "allows admins to index" do
        user.admin = true
        schema_access.can?(:show, schema).should be_true
      end
    end
  end
end

