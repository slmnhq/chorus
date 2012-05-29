class ChangeStringLengthTo256 < ActiveRecord::Migration

  def string_columns
    {"gpdb_database_objects" => ["type", "name"],
      "gpdb_databases" => ["name"],
      "gpdb_schemas" => ["name"],
      "hadoop_instances" => ["name", "host", "version", "username", "group_list"],
      "instance_accounts" => ["db_username"],
      "instances" => ["name", "host", "maintenance_db", "provision_type", "instance_provider", "version"],
      "users" => ["username", "password_digest", "first_name", "last_name", "email", "title", "dept", "image_file_name", "image_content_type"],
      "workfile_drafts" => ["contents_file_name", "contents_content_type"],
      "workfile_versions" => ["commit_message", "contents_file_name", "contents_content_type"],
      "workspaces" => ["name", "image_file_name", "image_content_type"]}
  end

  def change_string_column_length(length)
    string_columns.each_key do |table_name|
      string_columns[table_name].each do |column_name|
        execute "alter table #{table_name} alter column #{column_name} TYPE varchar(#{length});"
      end
    end
  end

  def up
    change_string_column_length(256)
  end

  def down
    change_string_column_length(255)
  end
end
