class UserMigrator
  def self.migrate
    unless Legacy.connection.column_exists?(:edc_user, :chorus_rails_user_id)
      Legacy.connection.add_column :edc_user, :chorus_rails_user_id, :integer
    end

    users = Legacy.connection.select_all("SELECT * from edc_user")
    users.each do |user|
      new_user = User.create :username   => user["user_name"],
                             :first_name => user["first_name"],
                             :last_name  => user["last_name"],
                             :email      => user["email_address"],
                             :title      => user["title"],
                             :dept       => user["ou"],
                             :notes      => user["notes"]
      new_user.deleted_at = user["last_updated_tx_stamp"] if user["is_deleted"] == "t"
      new_user.password_digest = user["password"][5..-1]
      new_user.save!

      id = user["id"]
      Legacy.connection.update("Update edc_user SET chorus_rails_user_id = #{new_user.id} WHERE id = '#{id}'")
    end
  end
end