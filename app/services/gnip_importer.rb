class GnipImporter < CsvImporter
  def create_success_event
    gnip_event = Events::GnipStreamImportCreated.find(import_created_event_id)

    event = Events::GnipStreamImportSuccess.by(gnip_event.actor).add(
        :workspace => gnip_event.workspace,
        :dataset => gnip_event.dataset,
        :gnip_instance => gnip_event.gnip_instance
    )
    Notification.create!(:recipient_id => gnip_event.actor.id, :event_id => event.id)
  end

  def create_failure_event(error_message)
    gnip_event = Events::GnipStreamImportCreated.find(import_created_event_id)

    event = Events::GnipStreamImportFailed.by(gnip_event.actor).add(
        :workspace => gnip_event.workspace,
        :dataset => gnip_event.dataset,
        :gnip_instance => gnip_event.gnip_instance,
        :error_message => error_message
    )
    Notification.create!(:recipient_id => gnip_event.actor.id, :event_id => event.id)
  end

end