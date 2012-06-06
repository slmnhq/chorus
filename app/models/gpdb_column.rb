class GpdbColumn
  COLUMN_METADATA_QUERY = <<-SQL
            SELECT a.attname, format_type(a.atttypid, a.atttypmod), des.description, a.attnum
              FROM pg_attribute a
                    LEFT JOIN pg_attrdef d
                      ON a.attrelid = d.adrelid AND a.attnum = d.adnum
                    LEFT JOIN pg_description des
                      ON a.attrelid = des.objoid AND a.attnum = des.objsubid
            WHERE a.attrelid = '%s'::regclass
              AND a.attnum > 0 AND NOT a.attisdropped
            ORDER BY a.attnum;
                 SQL

  attr_reader :name, :data_type, :description, :ordinal_position

  def self.columns_for(account, table)
    columns = table.with_gpdb_connection(account) do |conn|
      conn.query(COLUMN_METADATA_QUERY % table.name)
    end

    columns.map do |column|
      GpdbColumn.new({
        :name => column[0],
        :data_type => column[1],
        :description => column[2],
        :ordinal_position => column[3]
      })
    end
  end

  def initialize(attributes={})
    @name = attributes[:name]
    @data_type = attributes[:data_type]
    @description = attributes[:description]
    @ordinal_position = attributes[:ordinal_position]
  end
end
