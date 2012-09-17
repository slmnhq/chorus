require 'spec_helper'

describe CommentPresenter, :type => :view do
  let(:comment) { comments(:comment_on_note_on_greenplum) }
  let(:presenter) { CommentPresenter.new(comment, view) }

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:id)
      hash.should have_key(:author)
      hash.should have_key(:text)
      hash.should have_key(:timestamp)
    end
  end
end