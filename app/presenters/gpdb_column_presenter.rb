class GpdbColumnPresenter < Presenter
  delegate :name, :data_type, :simplified_type, :description, :to => :model

  MISCELLANEOUS_TYPES = [/\[\]/, "box", "cidr", "circle", "inet", "lseg", "macaddr", "money", "path", "point", "polygon"]

  def to_hash
    {
      :name => h(name),
      :data_type => h(data_type),
      :type_category => type_category,
      :description => h(description),
      :statistics => statistics
    }
  end

  def type_category
    if MISCELLANEOUS_TYPES.any? { |type| type === data_type }
      return "OTHER"
    end

    case simplified_type
      when :integer
        "WHOLE_NUMBER"
      when :decimal, :float
        "REAL_NUMBER"
      when :text
        "LONG_STRING"
      when :boolean, :string, :datetime, :time, :date, :binary
        simplified_type.to_s.upcase
      else
        "OTHER"
    end
  end

  def statistics
    return { } unless model.statistics.present?
    present(model.statistics)
  end
end