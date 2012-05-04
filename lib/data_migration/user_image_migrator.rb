require "stringio"

class LegacyImage < ActiveRecord::Base
  establish_connection :legacy_test

  def self.table_name
    "edc_image_instance"
  end

  def self.inheritance_column
    nil
  end
end

class UserImageMigrator
  def migrate
    legacy_users_with_images = Legacy.connection.select_all("select * from edc_user where image_id is not null")
    legacy_users_with_images.each do |legacy_user|
      new_user = User.find_with_destroyed(legacy_user["chorus_rails_user_id"])
      image_id = legacy_user["image_id"]
      image = LegacyImage.where("image_id = '#{image_id}' and type = 'original'").first

      file = StringIO.new(image.image.force_encoding("UTF-8"))

      new_user.image = file
      new_user.save!
    end
  end
end

