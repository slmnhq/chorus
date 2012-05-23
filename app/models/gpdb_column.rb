class GpdbColumn
  COLUMN_METADATA_QUERY = <<-SQL
            SELECT a.attname, format_type(a.atttypid, a.atttypmod), des.description
              FROM pg_attribute a
                    LEFT JOIN pg_attrdef d
                      ON a.attrelid = d.adrelid AND a.attnum = d.adnum
                    LEFT JOIN pg_description des
                      ON a.attrelid = des.objoid AND a.attnum = des.objsubid

            WHERE a.attrelid = '%s'::regclass
              AND a.attnum > 0 AND NOT a.attisdropped
            ORDER BY a.attnum;
                 SQL

  attr_reader :name, :data_type, :description

  def self.columns_for(account, database_name, table_name)
    columns = Gpdb::ConnectionBuilder.connect!(account.instance, account, database_name) do |conn|
      conn.query(COLUMN_METADATA_QUERY % table_name)
    end

    columns.map do |column|
      GpdbColumn.new({
        :name => column[0],
        :data_type => column[1],
        :description => column[2]
      })
    end
  end

  def initialize(attributes={})
    @name = attributes[:name]
    @data_type = attributes[:data_type]
    @description = attributes[:description]
  end
end
