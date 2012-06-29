class NoteCommentMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_comment, :chorus_rails_event_id)
      Legacy.connection.add_column :edc_comment, :chorus_rails_event_id, :integer
    end

    get_all_comments do |comment_id, comment_type, comment_body, comment_timestamp|
      if (comment_type == 'instance')
        greenplum_instance = Instance.find_by_id(rails_greenplum_instance_id(comment_id))
        next unless greenplum_instance
        event = Events::NOTE_ON_GREENPLUM_INSTANCE.create(:greenplum_instance => greenplum_instance, :body => comment_body)
        event.created_at = comment_timestamp
        event.save!
        update_event_id(comment_id, event.id)
      end
    end
  end

  private

  def get_all_comments
    sql = "SELECT id, entity_type, body, created_stamp FROM edc_comment"

    comment_table_data = Legacy.connection.exec_query(sql)
    comment_table_data.map do |comment_data|
      yield comment_data["id"], comment_data["entity_type"], comment_data["body"], comment_data["created_stamp"]
    end
  end

  def rails_greenplum_instance_id(comment_id)
    sql = "SELECT ei.chorus_rails_instance_id  FROM edc_instance ei, edc_comment ec
                                               WHERE ec.id = '#{comment_id}'
                                               AND ei.id = ec.entity_id
                                               AND ei.instance_provider = 'Greenplum Database'"

    extract_result("chorus_rails_instance_id", Legacy.connection.exec_query(sql))
  end

  def update_event_id(comment_id, event_id)
    Legacy.connection.update("UPDATE edc_comment SET chorus_rails_event_id = #{event_id} WHERE id = '#{comment_id}'")
  end

  def extract_result(result_key, sql)
    instance_data = Array(sql)[0]
    instance_data && instance_data[result_key]
  end

end