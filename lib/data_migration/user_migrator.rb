class UserMigrator
  def self.migrate
    unless Legacy.connection.column_exists?(:edc_user, :chorus_rails_user_id)
      Legacy.connection.add_column :edc_user, :chorus_rails_user_id, :integer
    end

    users = Legacy.connection.select_all("SELECT * from edc_user")
    users.each do |user|
      new_user = User.create :username => user["user_name"],
                             :first_name => user["first_name"],
                             :last_name => user["last_name"],
                             :email => user["email_address"]
      new_user.password_digest = user["password"][5..-1]
      new_user.save!
    end
  end
end