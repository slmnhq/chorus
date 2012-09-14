require 'spec_helper'

describe CommentsController do
  let(:author) { users(:carly) }
  let(:event) { events(:note_on_bob_public_workfile) }

  before do
    log_in author
  end

  describe "#create" do
    before do
      @params = {
          event: event,
          text: "hello world in jasmine test!"
      }
      post :create, { :comment => @params }
    end

    it "should post with appropriate response" do
      response.code.should == "201"
    end

    it "should create make the current user the author" do
      Comment.find_by_text(@params[:text]).author.should == author
    end
  end
end