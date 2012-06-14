require 'spec_helper'

describe HadoopInstanceAccess do
  subject do
    stub(controller = Object.new).current_user { current_user }
    described_class.new(controller)
  end

  describe "#edit?" do
    let(:owner) { FactoryGirl.create(:user) }
    let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :owner => owner) }

    context "owner" do
      let(:current_user) { owner }

      it "allows access" do
        subject.can?(:edit, hadoop_instance).should be_true
      end
    end

    context "regular user" do
      let(:current_user) { FactoryGirl.create(:user) }

      it "does not allow access" do
        user = FactoryGirl.create(:user)
        subject.can?(:edit, hadoop_instance).should be_false
      end
    end
  end
end
