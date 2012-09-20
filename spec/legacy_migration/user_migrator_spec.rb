require 'legacy_migration_spec_helper'

describe UserMigrator do
  describe ".migrate" do
    context "when user database is empty" do
      before do
        UserMigrator.migrate
      end

      describe "copying the data" do
        it "creates new users for legacy users and is idempotent" do
          count = Legacy.connection.exec_query("SELECT count(*) FROM edc_user").first["count"]
          User.unscoped.count.should == count
          UserMigrator.migrate
          User.unscoped.count.should == count
        end

        it "copies the correct data fields from the legacy user" do
          Legacy.connection.exec_query("SELECT * FROM edc_user").each do |legacy_user|
            user = User.unscoped.find_by_legacy_id(legacy_user["id"])
            user.should be_present
            user.username.should == legacy_user["user_name"]
            user.first_name.should == legacy_user["first_name"]
            user.last_name.should == legacy_user["last_name"]
            legacy_user["password"].should == "{SHA}#{user.legacy_password_digest}"
            user.email.should == legacy_user["email_address"]
            user.title.should == legacy_user["title"]
            user.dept.should == legacy_user["ou"]
            user.notes.should == legacy_user["notes"]
            user.admin.should == (legacy_user["admin"] == 't' ? true : false)
            user.password_salt.should be_empty
            user.password_digest.should be_nil
            if legacy_user["is_deleted"] == "f"
              user.deleted_at.should be_nil
            else
              user.deleted_at.should == legacy_user["last_updated_tx_stamp"]
            end
            user.updated_at.should == legacy_user["last_updated_tx_stamp"]
            user.created_at.should == legacy_user["created_tx_stamp"]
          end
        end

        it "creates all valid user objects" do
          User.unscoped.all.reject { |user| user.valid? }.should be_empty
        end
      end
    end

    #context "when there is already a non-legacy user in the database" do
    #  let(:non_legacy_user) {User.create!({:username => "non-legacy-user", :email => "user@example.com", :password => "secret", :first_name => "Legacy", :last_name => "User"}, :without_protection => true)}
    #
    #  before do
    #    non_legacy_user.save!
    #    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)
    #    Sunspot.session = Sunspot.session.original_session
    #  end
    #
    #  it "still creates new users for legacy users" do
    #    expect {
    #      UserMigrator.migrate
    #    }.to change(User, :count)
    #  end
    #
    #  it "still contains the non-legacy user" do
    #    UserMigrator.migrate
    #    non_legacy_user.reload.username.should == "non-legacy-user"
    #  end
    #end
  end
end
