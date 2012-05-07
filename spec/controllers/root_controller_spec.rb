require 'spec_helper'

describe RootController do
  describe "rescuing from errors" do
      it "renders 'not found' JSON when record not found" do
        get :not_found

        response.code.should == "200"
        #response.code.should == "404" # See note in root_controller#not_found
        response.parsed_body['route'].should == "not_found"
      end
    end
end
