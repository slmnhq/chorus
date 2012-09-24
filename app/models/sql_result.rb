class SqlResult
  attr_reader :columns, :rows
  attr_accessor :schema, :warnings

  def add_column(name, type)
    @columns << GpdbColumn.new(:name => name, :data_type => type)
  end

  def add_row(row)
    @rows << row
  end

  def add_rows(rows)
    @rows.concat(rows)
  end

  def initialize
    @columns = []
    @rows = []
    @warnings = []
  end

  def hashes
    rows.map do |row|
      hash = {}
      columns.each_with_index do |column, i|
        hash[column.name] = row[i]
      end
      hash
    end
  end
end
