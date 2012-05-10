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

class ImageMigrator
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

    legacy_workspaces_with_images = Legacy.connection.select_all("select * from edc_workspace where icon_id is not null")
    legacy_workspaces_with_images.each do |legacy_workspace|
      new_workspace = Workspace.find(legacy_workspace["chorus_rails_workspace_id"])
      icon_id = legacy_workspace["icon_id"]
      icon = LegacyImage.where("image_id = '#{icon_id}' and type = 'original'").first

      file = StringIO.new(icon.image.force_encoding("UTF-8"))

      new_workspace.image = file
      new_workspace.save!
    end
  end
end

