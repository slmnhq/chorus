require "spec_helper"

describe GpdbDatabaseAccess do
  let(:user) { FactoryGirl.create(:user) }
  let(:owner) { FactoryGirl.build(:user) }
  let(:instance) { FactoryGirl.create(:instance, :owner => owner) }
  let(:schema_access) do
    stub(controller = Object.new).current_user { user }
    GpdbDatabaseAccess.new(controller)
  end

  before do
    FactoryGirl.create(:instance_account, :instance => instance, :owner => owner)
  end

  describe "#show?" do
    let(:database) { FactoryGirl.build(:gpdb_database, :instance => instance) }

    context "Private Instance" do
      it "prevents non-members" do
        schema_access.can?(:show, database).should be_false
      end

      it "allow members" do
        FactoryGirl.create(:instance_account, :owner => user, :instance => instance)
        schema_access.can?(:show, database).should be_true
      end

      it "allows owners" do
        stub(schema_access.context).current_user { owner }
        schema_access.can?(:show, database).should be_true
      end

      it "allows admins" do
        user.admin = true
        schema_access.can?(:show, database).should be_true
      end
    end

    context "Public Instance" do
      before(:each) do
        instance.update_attribute :shared, true
      end

      it "allows non-members" do
        schema_access.can?(:show, database).should be_true
      end

      it "allow members" do
        FactoryGirl.create(:instance_account, :owner => user, :instance => instance)
        schema_access.can?(:show, database).should be_true
      end

      it "allows owners" do
        stub(schema_access.context).current_user { owner }
        schema_access.can?(:show, database).should be_true
      end

      it "allows admins" do
        user.admin = true
        schema_access.can?(:show, database).should be_true
      end
    end
  end
end

