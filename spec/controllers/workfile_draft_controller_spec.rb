require 'spec_helper'

describe WorkfileDraftController do
  let(:valid_attributes) { { :content => "Valid content goes here", :workfile_id => 3939 } }
  let(:user) { users(:owner) }
  let!(:draft) do
    workfile_drafts(:default).tap do |draft|
      draft.content = "Valid content goes here"
      draft.owner_id = user.id
      draft.workfile_id = 3939
    end
  end

  before(:each) do
    log_in user
  end

  describe "#create" do
    context "with valid attributes" do
      it "should save the data" do
        post :create, :workfile_draft => valid_attributes, :workfile_id => 3939
        response.code.should == "201"
      end

      it "renders the newly created draft" do
        post :create, :workfile_draft => valid_attributes, :workfile_id => 3939
        decoded_response.content.should == "Valid content goes here"
        decoded_response.workfile_id.should == 3939
        decoded_response.owner_id.should == user.id
      end
    end
  end

  describe "#show" do
    before do
      draft.save!
    end
    it "renders the specified draft" do
      get :show, :workfile_id => 3939
      decoded_response.content.should == "Valid content goes here"
      decoded_response.workfile_id.should == 3939
      decoded_response.owner_id.should == user.id
      decoded_response.id.should == draft.id
    end

    generate_fixture "draft.json" do
      get :show, :workfile_id => 3939
    end
  end

  describe "#update" do
    before do
      draft.save!
    end
    it "updates and renders the updated values" do
      updated_attributes = {:content => "I am a leaf upon the wind, watch how I soar."}
      put :update, :workfile_draft => updated_attributes, :workfile_id => 3939
      decoded_response.content.should == "I am a leaf upon the wind, watch how I soar."
      decoded_response.workfile_id.should == 3939
      decoded_response.owner_id.should == user.id
      decoded_response.id.should == draft.id
    end
  end

  describe "#delete" do
    it "deletes the draft" do
      draft.save!
      delete :destroy, :workfile_id => 3939
      response.should be_success
    end

    it "does not delete anything if given a non-existing draft" do
      lambda { delete :destroy, :workfile_id => 3939 }.should_not change { WorkfileDraft.count }
      response.code.should == '404'
    end
  end
end