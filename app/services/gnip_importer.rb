class GnipImporter < CsvImporter
  def self.import_to_table(table_name, gnip_instance_id, workspace_id, user_id, event_id)
    event = Events::Base.find(event_id)

    gnip_instance = GnipInstance.find(gnip_instance_id)
    c = ChorusGnip.from_stream(gnip_instance.stream_url, gnip_instance.username, gnip_instance.password)
    result = c.to_result

    workspace = Workspace.find(workspace_id)
    csv_file = workspace.csv_files.new(
        :contents => StringIO.new(result.contents),
        :column_names => result.column_names,
        :types => result.types,
        :delimiter => ',',
        :to_table => table_name,
        :new_table => true
    )
    csv_file.user = User.find(user_id)
    if csv_file.save
      GnipImporter.import_file(csv_file, event)
    end
  rescue Exception => e
    GnipImporter.create_failure_event(e.message, event, table_name)
  end

  def create_success_event
    gnip_event = Events::GnipStreamImportCreated.find(import_created_event_id).tap do |event|
      event.dataset = destination_dataset
      event.save!
    end

    event = Events::GnipStreamImportSuccess.by(gnip_event.actor).add(
        :workspace => gnip_event.workspace,
        :dataset => gnip_event.dataset,
        :gnip_instance => gnip_event.gnip_instance
    )
    Notification.create!(:recipient_id => gnip_event.actor.id, :event_id => event.id)
  end

  def create_failure_event(error_message)
    gnip_event = Events::GnipStreamImportCreated.find(import_created_event_id)
    GnipImporter.create_failure_event(error_message, gnip_event, csv_file.to_table)
  end

  def self.create_failure_event(error_message, gnip_event, table_name)
    event = Events::GnipStreamImportFailed.by(gnip_event.actor).add(
        :workspace => gnip_event.workspace,
        :destination_table => table_name,
        :gnip_instance => gnip_event.gnip_instance,
        :error_message => error_message
    )
    Notification.create!(:recipient_id => gnip_event.actor.id, :event_id => event.id)
  end
end