require 'data_migration/legacy_models'

class ActivityMigrator
  def migrate
     unless Legacy.connection.column_exists?(:edc_activity_stream, :chorus_rails_event_id)
      Legacy.connection.add_column :edc_activity_stream, :chorus_rails_event_id, :integer
    end

    Legacy::ActivityStream.all.each do |activity_stream|
      mapper = ActivityStreamEventMapper.new(activity_stream)
      next unless mapper.can_build?

      event = mapper.build_event

      event.workspace = find_workspace(activity_stream)
      event.actor = find_actor(activity_stream)

      event.save!

      # We can't save activity_stream directly for unknown reasons
      Legacy.connection.update("UPDATE edc_activity_stream SET chorus_rails_event_id = #{event.id} WHERE id = '#{activity_stream.id}'")
    end
  end

  private

  def find_workspace(activity_stream)
    legacy_workspace = activity_stream.workspace

    if legacy_workspace.present?
      Workspace.find_with_destroyed(legacy_workspace.chorus_rails_workspace_id)
    else
      nil
    end
  end

  def find_actor(activity_stream)
    legacy_user = activity_stream.actor
    User.find_with_destroyed(legacy_user.chorus_rails_user_id)
  end
end
