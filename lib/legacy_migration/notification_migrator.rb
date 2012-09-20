class NotificationMigrator < AbstractMigrator
  class << self
    def prerequisites(options)
      UserMigrator.migrate
      CommentMigrator.migrate(options)
    end

    def classes_to_validate
      [Notification]
    end

    def migrate(options)
      prerequisites(options)

      #NOTE alerts -> notifications
      Legacy.connection.exec_query(%Q(
        INSERT INTO notifications(
          legacy_id,
          recipient_id,
          event_id,
          created_at,
          updated_at,
          read,
          deleted_at
        )
        SELECT
          ea.id,
          users.id,
          events.id,
          ea.created_stamp,
          ea.last_updated_stamp,
          ea.is_read,
          CASE ea.is_deleted
            WHEN 't' THEN ea.last_updated_tx_stamp
            ELSE null
          END
        FROM
          edc_alert ea
          INNER JOIN users
            ON users.legacy_id = ea.recipient
          INNER JOIN events
            ON events.legacy_id = ea.reference AND events.legacy_type = 'edc_comment'
          WHERE type = 'NOTE'
          AND ea.id NOT IN (SELECT legacy_id FROM notifications);
        ))

      #NOTE_COMMENT alerts -> notifications
      Legacy.connection.exec_query(%Q(
        INSERT INTO notifications(
          legacy_id,
          recipient_id,
          event_id,
          comment_id,
          created_at,
          updated_at,
          read,
          deleted_at
        )
        SELECT
          ea.id,
          users.id,
          events.id,
          comments.id,
          ea.created_stamp,
          ea.last_updated_stamp,
          ea.is_read,
          CASE ea.is_deleted
            WHEN 't' THEN ea.last_updated_tx_stamp
            ELSE null
          END
        FROM
          edc_alert ea
          INNER JOIN users
            ON users.legacy_id = ea.recipient
          INNER JOIN comments
            ON comments.legacy_id = ea.reference
          INNER JOIN events
            ON events.id = comments.event_id
          WHERE type = 'NOTE_COMMENT'
          AND ea.id NOT IN (SELECT legacy_id FROM notifications);
        ))

      #MEMBERS_ADDED alerts -> notifications
      Legacy.connection.exec_query(%Q(
        INSERT INTO notifications(
          legacy_id,
          recipient_id,
          event_id,
          created_at,
          updated_at,
          read,
          deleted_at
        )
        SELECT
          ea.id,
          users.id,
          events.id,
          ea.created_stamp,
          ea.last_updated_stamp,
          ea.is_read,
          CASE ea.is_deleted
            WHEN 't' THEN ea.last_updated_tx_stamp
            ELSE null
          END
        FROM
        edc_alert ea
        INNER JOIN edc_activity_stream_object aso
          ON  aso.object_id = ea.recipient AND aso.entity_type = 'user'
          AND aso.created_tx_stamp = ea.created_tx_stamp
        INNER JOIN edc_activity_stream eas
          ON eas.id = aso.activity_stream_id
          AND eas.type = 'MEMBERS_ADDED' and eas.workspace_id = ea.reference
        INNER JOIN users
          ON users.legacy_id = ea.recipient
        INNER JOIN events
          ON events.legacy_id = eas.id AND events.legacy_type = 'edc_activity_stream'
        WHERE ea.type = 'MEMBERS_ADDED'
          AND ea.id NOT IN (SELECT legacy_id FROM notifications);
        ))

    end
  end
end
