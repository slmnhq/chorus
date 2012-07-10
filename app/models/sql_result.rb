class SqlResult
  attr_reader :columns, :rows

  def add_column(name, type)
    @columns << GpdbColumn.new(:name => name, :data_type => type)
  end

  def add_row(row)
    @rows << row
  end

  def add_rows(rows)
    rows.each { |row| add_row(row) }
  end

  def initialize
    @columns = []
    @rows = []
  end
end
