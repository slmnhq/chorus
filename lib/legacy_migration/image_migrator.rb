require "stringio"

class ImageMigrator
  def prerequisites
    UserMigrator.new.migrate
    WorkspaceMigrator.new.migrate
    MembershipMigrator.new.migrate
  end

  def silence_activerecord
    ActiveRecord::Base.record_timestamps = false
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)
    yield
    ActiveRecord::Base.record_timestamps = true
  end

  def migrate
    prerequisites

    silence_activerecord do
      user_image_rows = Legacy.connection.exec_query(
      "SELECT
        edc_user.id AS user_id,
        edc_image_instance.image AS image
      FROM legacy_migrate.edc_user
      INNER JOIN legacy_migrate.edc_image_instance
        ON edc_user.image_id = edc_image_instance.image_id
        AND type = 'original';"
      )

      user_image_rows.each do |row|
        user = User.unscoped.find_by_legacy_id(row['user_id'])
        user.image = StringIO.new(row['image'].force_encoding("UTF-8"))
        user.save!
      end

      workspace_image_rows = Legacy.connection.exec_query(
      "SELECT
        edc_workspace.id AS workspace_id,
        edc_image_instance.image AS image
      FROM legacy_migrate.edc_workspace
      INNER JOIN legacy_migrate.edc_image_instance
        ON edc_workspace.icon_id = edc_image_instance.image_id
        AND type = 'original';"
      )

      workspace_image_rows.each do |row|
        workspace = Workspace.unscoped.find_by_legacy_id(row['workspace_id'])
        workspace.image = StringIO.new(row['image'].force_encoding("UTF-8"))
        workspace.save!
      end
    end
  end
end

