class TypeAheadSearchPresenter < SearchPresenterBase

  delegate :results, to: :model

  def to_hash
    {
        type_ahead: {
            results:
                present_models_with_highlights(results)
        }
    }
  end
end
