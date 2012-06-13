require 'spec_helper'

describe WorkfileDraftController do
  let(:valid_attributes) { { :content => "Valid content goes here", :workfile_id => 3939 } }
  before(:each) do
    @user = FactoryGirl.create :user
    log_in @user
  end

  describe "#create" do
    context "with valid attributes" do
      it "should save the data" do
        post :create, :draft => valid_attributes
        response.code.should == "201"
      end

      it "renders the newly created draft" do
        post :create, :draft => valid_attributes
        decoded_response.content.should == "Valid content goes here"
        decoded_response.workfile_id.should == 3939
        decoded_response.owner_id.should == @user.id
      end
    end
  end

  describe "#show" do
    it "renders the specified draft" do
      draft = FactoryGirl.create(:workfile_draft, :content => "Valid content goes here", :workfile_id => 3939, :owner_id => @user.id)
      get :show, :workfile_id => 3939
      decoded_response.content.should == "Valid content goes here"
      decoded_response.workfile_id.should == 3939
      decoded_response.owner_id.should == @user.id
      decoded_response.id.should == draft.id
    end
  end

  describe "#update" do
    it "updates and renders the updated values" do
      updated_attributes = {:content => "I am a leaf upon the wind, watch how I soar."}
      draft = FactoryGirl.create(:workfile_draft, :content => "Valid content goes here", :workfile_id => 3939, :owner_id => @user.id)
      put :update, :draft => updated_attributes, :workfile_id => 3939
      decoded_response.content.should == "I am a leaf upon the wind, watch how I soar."
      decoded_response.workfile_id.should == 3939
      decoded_response.owner_id.should == @user.id
      decoded_response.id.should == draft.id
    end
  end

  describe "#delete" do
    it "deletes the draft" do
      FactoryGirl.create(:workfile_draft, :content => "Valid content goes here", :workfile_id => 3939, :owner_id => @user.id)
      delete :destroy, :workfile_id => 3939
      response.should be_success
    end

    it "deletes the draft" do
      lambda { delete :destroy, :workfile_id => 3939 }.should_not change { WorkfileDraft.count }
      response.code.should == '404'
    end
  end
end