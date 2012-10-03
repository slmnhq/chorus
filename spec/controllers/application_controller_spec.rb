require 'spec_helper'
require 'timecop'

describe ApplicationController do

  it "has a uuid for every web request" do
    Chorus::Application.config.log_tags.should == [:uuid]
  end

  describe "rescuing from errors" do
    controller do
      def index
        head :ok
      end
    end

    before do
      log_in users(:no_collaborators)
    end

    it "renders 'not found' JSON when record not found" do
      stub(controller).index { raise ActiveRecord::RecordNotFound }
      get :index

      response.code.should == "404"
      decoded_errors.record.should == "NOT_FOUND"
    end

    it "renders 'invalid' JSON when record is invalid" do
      invalid_record = User.new
      invalid_record.password = "1"
      invalid_record.valid?
      stub(controller).index { raise ActiveRecord::RecordInvalid.new(invalid_record) }
      get :index
      response.code.should == "422"
      decoded_errors.fields.username.BLANK.should == {}
    end

    it "renders string-based validation messages, when provided" do
      invalid_record = User.new
      invalid_record.errors.add(:username, :generic, :message => "some error")
      stub(controller).index { raise ActiveRecord::RecordInvalid.new(invalid_record) }
      get :index

      response.code.should == "422"
      decoded_errors.fields.username.GENERIC.message.should == "some error"
    end

    it "returns error 422 when a Postgres error occurs" do
      stub(controller).index { raise ActiveRecord::JDBCError.new }

      get :index

      response.code.should == "422"
    end

    it "returns error 422 when a QueryError occurs" do
      stub(controller).index { raise MultipleResultsetQuery::QueryError.new("broken!") }

      get :index

      response.code.should == "422"
      decoded_errors.fields.query.INVALID.message.should == "broken!"
    end

    it "returns error 422 when an Gpdb::InstanceStillProvisioning error is raised" do
      stub(controller).index { raise Gpdb::InstanceStillProvisioning }

      get :index

      response.code.should == "422"
      decoded_errors.record.should == "INSTANCE_STILL_PROVISIONING"
    end

    describe "when an access denied error is raised" do
      let(:object_to_present) { gpdb_instances(:default) }
      let(:exception) { Allowy::AccessDenied.new('', 'action', object_to_present) }

      before do
        log_in users(:owner)
        stub(controller).index { raise exception }
      end

      it "returns a status of 403" do
        get :index
        response.should be_forbidden
      end

      it "includes the given model's id" do
        get :index
        decoded_response.gpdb_instance.id.should == object_to_present.id
      end
    end
  end

  describe "#require_admin" do
    controller do
      before_filter :require_admin

      def index
        head :ok
      end
    end

    before do
      log_in user
    end

    context "when user has no admin rights" do
      let(:user) { users(:no_collaborators) }

      it "returns error 403" do
        get :index
        response.should be_forbidden
      end
    end

    context "when user has admin rights" do
      let(:user) { users(:admin) }

      it "returns success" do
        get :index
        response.should be_ok
      end
    end
  end

  describe "#current_user" do
    controller do
      def index
        render :text => current_user.present? ? current_user.id : nil
      end
    end

    before do
      @user = users(:no_collaborators)
      log_in @user
    end

    it "returns the user based on the session's user id" do
      get :index
      response.body.should == @user.id.to_s
    end

    it "returns nil when there is no user_id stored in the session" do
      session[:user_id] = nil
      get :index
      response.body.should == ' '
    end

    it "returns nil when there is no user with the id stored in the session" do
      session[:user_id] = -1
      get :index
      response.body.should == ' '
    end
  end

  describe "#present" do
    controller do
      def index
        present object_to_present
      end
    end

    before do
      stub(controller).object_to_present { object_to_present }
      log_in users(:no_collaborators)
    end

    context "with a single model" do
      let(:object_to_present) { users(:owner) }

      it "sets the response to a hash of the model" do
        get :index
        decoded_response.username.should == object_to_present.username
      end
    end

    context "with a paginated collection" do

      let(:object_to_present) do
        User.paginate(:per_page => 2, :page => 1)
      end

      it "sets the response to an array with a hash for each model in current page" do
        get :index
        decoded_response.length.should == 2
        decoded_response[0].username.should == object_to_present[0].username
      end

      it "adds pagination" do
        get :index
        user_count = User.count
        page_count = (user_count/2.0).ceil
        decoded_pagination.page.should == 1
        decoded_pagination.per_page.should == 2
        decoded_pagination.total.should == page_count
        decoded_pagination.records.should == user_count
      end

      context "with a per_page of zero" do
        let(:object_to_present) do
          User.paginate(:per_page => 0, :page => 1)
        end

        it "omits the total pages in the response" do
          get :index

          decoded_pagination.total.should be_nil
        end
      end
    end
  end

  describe "session expiration" do
    controller do
      def index
        head :ok
      end
    end

    before do
      log_in users(:no_collaborators)
      session[:expires_at] = 1.hour.from_now
    end

    context "with and unexpired session" do
      it "allows API requests" do
        get :index
        response.should be_success
      end

      it "resets the expires_at" do
        get :index
        session[:expires_at].should > 1.hour.from_now
      end

      it "uses the configured session timeout" do
        stub(Chorus::Application.config.chorus).[]('session_timeout_minutes') { 60 * 4 }
        Timecop.freeze(2012, 4, 17, 10, 30) do
          get :index
          session[:expires_at].should == 4.hours.from_now
        end
      end
    end

    context "with an expired session" do
      before do
        session[:expires_at] = 2.hours.ago
      end

      it "returns 'unauthorized'" do
        get :index
        response.code.should == "401"
      end
    end

    context "without session expiration" do
      it "returns 'unauthorized'" do
        session.delete(:expires_at)
        get :index
        response.code.should == "401"
      end
    end
  end

  describe "#head :ok" do
    controller do
      def index
        head :ok
      end
    end

    before do
      log_in users(:no_collaborators)
    end

    context "when the request is for application/json" do
      it "renders an empty hash" do
        request.env['HTTP_ACCEPT'] = 'application/json, text/javascript, */*'
        get :index
        response.body.should == '{}'
      end
    end

    context "when the request is not for application/json" do
      it "renders an empty hash" do
        request.env['CONTENT_TYPE'] = nil
        get :index
        response.body.should == ' '
      end
    end
  end
end
