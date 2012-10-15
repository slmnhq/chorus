require 'spec_helper'

describe Kaggle::MessagesController do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  describe "#create" do
    it_behaves_like "an action that requires authentication", :post, :create

    it "succeeds" do
      post :create
      response.should be_success
    end
  end
end