class ImagePresenter < Presenter
  delegate :url, :to => :model

  def to_hash
    {
        :original => url(:original),
        :icon => url(:icon)
    }
  end

  def complete_json?
    true
  end
end

