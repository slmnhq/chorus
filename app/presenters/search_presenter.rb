class SearchPresenter < Presenter

  delegate :users, :num_found, to: :model

  def to_hash
    {
        :users => {
            :results => users.collect do |user|
              hsh = present(user)
              hsh[:highlightedAttributes] = user.highlighted_attributes
              hsh
            end,
            :numFound => num_found[:users]
        }
    }
  end
end