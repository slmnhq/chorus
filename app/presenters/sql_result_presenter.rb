class SqlResultPresenter < Presenter
  delegate :columns, :rows, :warnings, :schema, :to => :model

  def to_hash
    {
        :columns => present(columns),
        :rows => rows,
        :execution_schema => present(schema),
        :warnings => warnings
    }
  end
end
