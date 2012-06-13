require "spec_helper"

describe WorkfileDraft do
  subject { FactoryGirl.build :workfile_draft }

  describe "associations" do
    it { should belong_to :owner }
    its(:owner) { should be_a User }

    it { should belong_to :workfile }
    its(:workfile) { should be_a Workfile }
  end

  it "doesn't create duplicate drafts for the same user and workfile" do
    draft = FactoryGirl.create(:workfile_draft, :workfile_id => 1, :owner_id => 1)
    expect {
      FactoryGirl.create(:workfile_draft, :workfile_id => 1, :owner_id => 1)
    }.to raise_error(ActiveRecord::RecordNotUnique)

    WorkfileDraft.find_all_by_owner_id_and_workfile_id(1, 1).should == [draft]
  end
end
