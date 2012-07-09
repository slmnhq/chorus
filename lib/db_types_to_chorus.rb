module DbTypesToChorus
  MISCELLANEOUS_TYPES = [/\[\]/, "box", "cidr", "circle", "inet", "lseg", "macaddr", "money", "path", "point", "polygon"]

  def to_category(data_type)
    if MISCELLANEOUS_TYPES.any? { |type| type === data_type }
      return "OTHER"
    end

    case simplify_type(data_type)
      when :integer
        "WHOLE_NUMBER"
      when :decimal, :float
        "REAL_NUMBER"
      when :text
        "LONG_STRING"
      when :boolean, :string, :datetime, :time, :date, :binary
        simplify_type(data_type).to_s.upcase
      else
        "OTHER"
    end
  end

  def simplify_type(data_type)
    ActiveRecord::ConnectionAdapters::PostgreSQLColumn.new("doesntmatter", nil, data_type, nil).type
  end
end