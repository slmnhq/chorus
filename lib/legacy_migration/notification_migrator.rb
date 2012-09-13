class NotificationMigrator < AbstractMigrator
  class << self
    def prerequisites(options)
      UserMigrator.migrate
      NoteMigrator.migrate(options)
    end

    def classes_to_validate
      [Notification]
    end

    def migrate(options)
      prerequisites(options)

      Legacy.connection.exec_query(%Q(
        INSERT INTO notifications(
          legacy_id,
          recipient_id,
          event_id,
          created_at,
          updated_at,
          read
        )
        SELECT
          edc_alert.id,
          users.id,
          events.id,
          edc_alert.created_stamp,
          edc_alert.last_updated_stamp,
          edc_alert.is_read
        FROM
          edc_alert
          INNER JOIN users
            ON users.legacy_id = edc_alert.recipient
          INNER JOIN events
            ON events.legacy_id = edc_alert.reference AND events.legacy_type = 'edc_comment'
          WHERE type = 'NOTE'
          AND edc_alert.id NOT IN (SELECT legacy_id FROM notifications);
        ))
    end
  end
end
