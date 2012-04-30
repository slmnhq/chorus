require 'spec_helper'

describe RootController do
  describe "rescuing from errors" do
      it "renders 'not found' JSON when record not found" do
        get :not_found

        response.body.should == "{\"route\": \"not found\"}"
      end
    end
end
