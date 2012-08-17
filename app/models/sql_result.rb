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
end
